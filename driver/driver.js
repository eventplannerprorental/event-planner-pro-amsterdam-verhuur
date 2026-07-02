(function(){
  'use strict';

  const CUSTOMER_ID = 'amsterdam-verhuur';
  const CUSTOMER_NAME = 'Amsterdam verhuur';
  const BASE_PATH = 'customers/' + CUSTOMER_ID;
  const LOCK_KEY = 'epp_driver_lock_' + CUSTOMER_ID;
  const firebaseConfig = {
    apiKey: 'AIzaSyADMGcbgIP2KSsP_LPR4XIuycw4npUc1Vs',
    authDomain: 'epp-amsterdam-verhuur.firebaseapp.com',
    databaseURL: 'https://epp-amsterdam-verhuur-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'epp-amsterdam-verhuur',
    storageBucket: 'epp-amsterdam-verhuur.firebasestorage.app',
    messagingSenderId: '484128911122',
    appId: '1:484128911122:web:b2ba741c7a0a2511054dcb'
  };

  const $ = (id) => document.getElementById(id);
  const statusEl = $('status');
  const loginCard = $('loginCard');
  const ordersCard = $('ordersCard');
  const nameBlock = $('nameBlock');
  const lockedBlock = $('lockedBlock');
  const lockedName = $('lockedName');
  const driverSelect = $('driverSelect');
  const pinInput = $('pinInput');
  const loginError = $('loginError');
  const loginHelp = $('loginHelp');
  const driverInfo = $('driverInfo');
  const ordersList = $('ordersList');

  let db = null;
  let authReady = false;
  let drivers = [];
  let currentDriver = null;
  let ordersRef = null;

  function setStatus(text, mode){
    statusEl.textContent = text;
    statusEl.className = 'status' + (mode ? ' ' + mode : '');
  }

  function showError(text){
    loginError.textContent = text;
    loginError.classList.remove('hidden');
  }

  function clearError(){
    loginError.textContent = '';
    loginError.classList.add('hidden');
  }

  function normalizeDate(value){
    if(!value) return '';
    const s = String(value).trim();
    if(/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)){
      const p = s.split('-');
      return p[0] + '-' + p[1].padStart(2,'0') + '-' + p[2].padStart(2,'0');
    }
    if(/^\d{1,2}-\d{1,2}-\d{4}$/.test(s)){
      const p = s.split('-');
      return p[2] + '-' + p[1].padStart(2,'0') + '-' + p[0].padStart(2,'0');
    }
    return s.slice(0,10);
  }

  function today(){
    return new Date().toISOString().slice(0,10);
  }

  function licenseIsValid(lic){
    if(!lic) return false;
    if(lic.active === false) return false;
    if(lic.blocked === true) return false;
    if(String(lic.status || '').toLowerCase() === 'blocked') return false;
    if(lic.paid === false) return false;
    const until = normalizeDate(lic.validUntil || lic.paidUntil || '');
    if(until && until < today()) return false;
    return true;
  }

  async function readOnce(path){
    const snap = await db.ref(path).get();
    return snap.exists() ? snap.val() : null;
  }

  async function checkLicense(){
    const lic = await readOnce(BASE_PATH + '/license');
    if(!licenseIsValid(lic)) throw new Error('Licentie niet actief voor ' + CUSTOMER_NAME + '.');
  }

  function asArray(value){
    if(!value) return [];
    if(Array.isArray(value)) return value.filter(Boolean).map((v,i) => ({...v, _key: v.id || String(i)}));
    if(typeof value === 'object') return Object.keys(value).map(k => ({...value[k], _key:k}));
    return [];
  }

  function getName(u){
    return String(u.name || u.naam || u.displayName || u.fullName || u.driverName || u.bezorger || u.chauffeur || '').trim();
  }

  function getPin(u){
    return String(u.pin || u.PIN || u.pincode || u.code || u.driverPin || u.password || '').trim();
  }

  function isDriverUser(u){
    const text = [u.role,u.rol,u.type,u.functie,u.group,u.groep,u.permissions,u.rechten].map(x => String(x || '').toLowerCase()).join(' ');
    if(u.driver === true || u.bezorger === true || u.chauffeur === true) return true;
    if(text.includes('driver') || text.includes('bezorg') || text.includes('chauffeur')) return true;
    return false;
  }

  async function loadDrivers(){
    const sources = [
      BASE_PATH + '/drivers',
      BASE_PATH + '/users',
      BASE_PATH + '/appState/drivers',
      BASE_PATH + '/appState/users',
      BASE_PATH + '/appState/personnel',
      BASE_PATH + '/appState/personeel'
    ];
    let all = [];
    for(const path of sources){
      try{ all = all.concat(asArray(await readOnce(path)).map(x => ({...x, _source:path}))); }catch(e){}
    }
    const seen = new Set();
    drivers = all.map(u => ({...u, _name:getName(u), _pin:getPin(u)}))
      .filter(u => u._name)
      .filter(u => isDriverUser(u) || getPin(u))
      .filter(u => {
        const key = u._name.toLowerCase();
        if(seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a,b) => a._name.localeCompare(b._name, 'nl'));

    if(!drivers.length){
      driverSelect.innerHTML = '<option value="">Geen bezorgers gevonden</option>';
      throw new Error('Geen bezorgers gevonden. Maak eerst een bezorger aan in Admin > Personeel.');
    }

    driverSelect.innerHTML = '<option value="">Kies je naam eenmalig</option>' +
      drivers.map((d,i) => '<option value="' + i + '">' + escapeHtml(d._name) + '</option>').join('');
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function applyLock(){
    const raw = localStorage.getItem(LOCK_KEY);
    if(!raw){
      nameBlock.classList.remove('hidden');
      lockedBlock.classList.add('hidden');
      loginHelp.textContent = 'Kies je naam eenmalig en vul je persoonlijke PIN in.';
      return null;
    }
    try{
      const lock = JSON.parse(raw);
      if(lock && lock.name){
        lockedName.textContent = lock.name;
        nameBlock.classList.add('hidden');
        lockedBlock.classList.remove('hidden');
        loginHelp.textContent = 'Vul je persoonlijke PIN in.';
        return lock;
      }
    }catch(e){}
    localStorage.removeItem(LOCK_KEY);
    return null;
  }

  function selectedDriver(){
    const lock = applyLock();
    if(lock){
      return drivers.find(d => d._name === lock.name) || {_name:lock.name, _pin:lock.pin || ''};
    }
    const idx = driverSelect.value;
    return idx === '' ? null : drivers[Number(idx)];
  }

  function pinMatches(driver, pin){
    const expected = String(driver._pin || '').trim();
    if(!expected) return false;
    return String(pin || '').trim() === expected;
  }

  function orderAssignedToDriver(order, driver){
    const name = driver._name.toLowerCase();
    const fields = [
      order.driver, order.driverName, order.driverNaam,
      order.bezorger, order.bezorgerNaam,
      order.chauffeur, order.chauffeurNaam,
      order.assignedTo, order.assignee,
      order.deliveryBy, order.deliveryDriver,
      order.medewerker, order.personeel
    ];
    return fields.some(v => String(v || '').toLowerCase().trim() === name || String(v || '').toLowerCase().includes(name));
  }

  function orderDate(order){
    return order.date || order.datum || order.startDate || order.dateStart || order.deliveryDate || order.brengDatum || order.begin || '';
  }

  function orderAddress(order){
    return order.address || order.adres || order.location || order.locatie || order.deliveryAddress || order.bezorgAdres || '';
  }

  function orderTitle(order){
    return order.title || order.naam || order.customer || order.klant || order.clientName || order.orderName || 'Opdracht';
  }

  function orderNumber(order, key){
    return order.number || order.orderNumber || order.opdrachtNummer || order.opdrNr || order.id || key || '';
  }

  async function updateOrderStatus(key, status){
    if(!authReady) setStatus('Status opslaan kan pas na database-login.', 'bad');
    await db.ref(BASE_PATH + '/orders/' + key).update({driverStatus:status, driverStatusAt:new Date().toISOString(), driverName:currentDriver._name});
  }

  function renderOrders(data){
    const arr = asArray(data).filter(o => orderAssignedToDriver(o, currentDriver));
    arr.sort((a,b) => String(orderDate(a)).localeCompare(String(orderDate(b))));
    if(!arr.length){
      ordersList.innerHTML = '<div class="empty">Geen opdrachten voor ' + escapeHtml(currentDriver._name) + '.</div>';
      return;
    }
    ordersList.innerHTML = arr.map(o => {
      const key = o._key;
      return '<article class="order">' +
        '<h3>' + escapeHtml(orderTitle(o)) + '</h3>' +
        '<div class="meta">' +
          '<div><b>Opdracht:</b> ' + escapeHtml(orderNumber(o,key)) + '</div>' +
          '<div><b>Datum:</b> ' + escapeHtml(orderDate(o) || '-') + '</div>' +
          '<div><b>Adres:</b> ' + escapeHtml(orderAddress(o) || '-') + '</div>' +
          '<div><b>Status:</b> ' + escapeHtml(o.driverStatus || o.status || '-') + '</div>' +
        '</div>' +
        '<div class="actions">' +
          '<button data-key="' + escapeHtml(key) + '" data-status="Onderweg">Onderweg</button>' +
          '<button class="done" data-key="' + escapeHtml(key) + '" data-status="Geleverd">Geleverd</button>' +
          '<button class="problem" data-key="' + escapeHtml(key) + '" data-status="Probleem">Probleem</button>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function startOrders(){
    if(ordersRef) ordersRef.off();
    ordersRef = db.ref(BASE_PATH + '/orders');
    ordersRef.on('value', snap => {
      renderOrders(snap.exists() ? snap.val() : null);
      setStatus('Data geladen', 'ok');
    }, err => setStatus('Opdrachten laden mislukt: ' + err.message, 'bad'));
  }

  async function login(){
    clearError();
    const driver = selectedDriver();
    const pin = pinInput.value.trim();
    if(!driver){ showError('Kies eerst je naam.'); return; }
    if(!pin){ showError('Vul je PIN in.'); return; }
    if(!pinMatches(driver, pin)){ showError('PIN klopt niet voor deze bezorger.'); return; }

    localStorage.setItem(LOCK_KEY, JSON.stringify({name:driver._name, lockedAt:new Date().toISOString()}));
    currentDriver = driver;
    loginCard.classList.add('hidden');
    ordersCard.classList.remove('hidden');
    driverInfo.textContent = 'Ingelogd als ' + driver._name;
    pinInput.value = '';
    startOrders();
  }

  async function init(){
    try{
      setStatus('App laden...');
      if(!window.firebase) throw new Error('Firebase script niet geladen.');
      firebase.initializeApp(firebaseConfig);
      db = firebase.database();
      try{
        await firebase.auth().signInAnonymously();
        authReady = true;
      }catch(e){
        authReady = false;
        console.warn('Anoniem inloggen niet beschikbaar, lezen blijft mogelijk.', e);
      }
      await checkLicense();
      await loadDrivers();
      applyLock();
      setStatus('Data geladen', 'ok');
    }catch(e){
      setStatus(e.message || 'App laden mislukt.', 'bad');
      driverSelect.innerHTML = '<option value="">Niet beschikbaar</option>';
    }
  }

  $('loginBtn').addEventListener('click', login);
  pinInput.addEventListener('keydown', e => { if(e.key === 'Enter') login(); });
  $('resetDeviceBtn').addEventListener('click', () => {
    if(confirm('Deze telefoon/browser loskoppelen van de bezorger?')){
      localStorage.removeItem(LOCK_KEY);
      applyLock();
    }
  });
  $('logoutBtn').addEventListener('click', () => {
    if(ordersRef) ordersRef.off();
    currentDriver = null;
    ordersCard.classList.add('hidden');
    loginCard.classList.remove('hidden');
    applyLock();
  });
  ordersList.addEventListener('click', async e => {
    const btn = e.target.closest('button[data-key]');
    if(!btn) return;
    try{
      await updateOrderStatus(btn.dataset.key, btn.dataset.status);
      setStatus('Status opgeslagen: ' + btn.dataset.status, 'ok');
    }catch(err){
      setStatus('Status opslaan mislukt: ' + err.message, 'bad');
    }
  });

  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js?v=320').catch(() => {});
  }

  init();
})();
