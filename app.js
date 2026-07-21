
/* BNS v913 globale timer/MutationObserver-wrapper verwijderd in v39. */

// ===== EPP AMSTERDAM VERHUUR v16: klantconfig uit customer-config.js =====
(function(){
  var cfg = window.EVENT_PLANNER_CUSTOMER || window.EPP_CUSTOMER_CONFIG || {};
  var fb = cfg.firebaseConfig || {
    apiKey: 'AIzaSyADMGcbgIP2KSsP_LPR4XIuycw4npUc1Vs',
    authDomain: 'epp-amsterdam-verhuur.firebaseapp.com',
    databaseURL: 'https://epp-amsterdam-verhuur-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'epp-amsterdam-verhuur',
    storageBucket: 'epp-amsterdam-verhuur.firebasestorage.app',
    messagingSenderId: '484128911122',
    appId: '1:484128911122:web:b2ba741c7a0a2511054dcb'
  };
  window.EPP_CUSTOMER_ID = cfg.customerId || 'amsterdam-verhuur';
  window.EPP_CUSTOMER_NAME = cfg.customerName || 'Amsterdam verhuur';
  window.EPP_USER_PIN = cfg.userPin || (cfg.pins && cfg.pins.user) || '3330';
  window.EPP_MASTER_PIN = cfg.masterPin || (cfg.pins && cfg.pins.master) || String.fromCharCode(57,49,49,57);
  window.EPP_REMOTE_ROOT = window.EPP_CUSTOMER_ID;
  window.BNS_FIREBASE_CONFIG = fb;
  window.FIREBASE_CONFIG = fb;
  window.firebaseConfig = fb;
})();
// ===== EVENT PLANNER PRO RENTAL LOCAL STRICT v828 =====
// Storage sandbox: vanaf hier schrijft de app fysiek nog maar naar 1 browser-key.
// Oude losse keys blijven binnen deze ene master-container en raken Tapwagen niet.
(function(){
  if(window.__EPP_RENTAL_LOCAL_STRICT_V828__) return;
  window.__EPP_RENTAL_LOCAL_STRICT_V828__ = true;
  window.EVENT_PLANNER_CONFIG = Object.freeze({
    mode: 'customer-firebase-rtdb-test',
    appName: 'Event Planner PRO Amsterdam verhuur',
    customerId: 'amsterdam-verhuur',
    storageKey: 'event-planner-pro-amsterdam-verhuur-v1',
    firebaseEnabled: true,
    firebaseProjectId: 'epp-amsterdam-verhuur',
    databaseURL: 'https://epp-amsterdam-verhuur-default-rtdb.europe-west1.firebasedatabase.app'
  });
  var PHYSICAL_KEY = window.EVENT_PLANNER_CONFIG.storageKey;
  var BLOCKED_PHYSICAL_KEYS = [
    'event-planner-pro-v87',
    'event-planner-pro-v8',
    'event-planner-pro',
    'eventPlannerProV91',
    'eventPlannerProState',
    'plannerState',
    'bns_event_planner',
    'bns_auto_backup_latest_json_v1',
    'bns_auto_backup_date_v1'
  ];
  var rawGet = Storage.prototype.getItem;
  var rawSet = Storage.prototype.setItem;
  var rawRemove = Storage.prototype.removeItem;
  function loadBox(){
    try{
      var raw = rawGet.call(localStorage, PHYSICAL_KEY);
      var box = raw ? JSON.parse(raw) : null;
      if(!box || typeof box !== 'object') box = {};
      if(!box.__meta) box.__meta = {version:'v840-rental-firebase', createdAt:new Date().toISOString()};
      if(!box.items || typeof box.items !== 'object') box.items = {};
      return box;
    }catch(e){
      return {__meta:{version:'v840-rental-firebase', version:'v840-rental-firebase', recoveredAt:new Date().toISOString()}, items:{}};
    }
  }
  function saveBox(box){
    rawSet.call(localStorage, PHYSICAL_KEY, JSON.stringify(box));
  }
  function normKey(key){
    return String(key == null ? '' : key);
  }
  Storage.prototype.getItem = function(key){
    key = normKey(key);
    if(key === PHYSICAL_KEY) return rawGet.call(this, PHYSICAL_KEY);
    var box = loadBox();
    return Object.prototype.hasOwnProperty.call(box.items, key) ? box.items[key] : null;
  };
  Storage.prototype.setItem = function(key, value){
    key = normKey(key);
    if(key === PHYSICAL_KEY) return rawSet.call(this, PHYSICAL_KEY, String(value));
    var box = loadBox();
    box.items[key] = String(value);
    box.__meta.updatedAt = new Date().toISOString();
    saveBox(box);
  };
  Storage.prototype.removeItem = function(key){
    key = normKey(key);
    if(key === PHYSICAL_KEY) return rawRemove.call(this, PHYSICAL_KEY);
    var box = loadBox();
    delete box.items[key];
    box.__meta.updatedAt = new Date().toISOString();
    saveBox(box);
  };
  try{
    BLOCKED_PHYSICAL_KEYS.forEach(function(k){ rawRemove.call(localStorage, k); });
  }catch(e){}
  console.info('[EPP RENTAL v840] localStorage sandbox actief: fysieke opslag-key = ' + PHYSICAL_KEY);
})();


// ===== EVENT PLANNER PRO RENTAL v840 FIREBASE RTDB TEST =====
// Deze klant-build gebruikt een eigen Firebase Realtime Database via aparte EPP-config. Oude BNS_FIREBASE_CONFIG blijft geblokkeerd.
(function(){
  'use strict';
  window.__BNS_FIREBASE_DISABLED__ = false;
  window.__BNS_OLD_FIREBASE_BLOCKED__ = true;
  window.EVENT_PLANNER_FIREBASE_ENABLED = true;
  window.BNS_RENTAL_MODE = true;
  window.BNS_RENTAL_CUSTOMER_ID = 'amsterdam-verhuur';
  window.BNS_RENTAL_STORAGE_KEY = 'event-planner-pro-amsterdam-verhuur-v1';
  window.BNS_RENTAL_FIREBASE_CONFIG = window.BNS_FIREBASE_CONFIG;
  // Amsterdam klant-build: Firebase config NIET blokkeren; deze komt uit customer-config.js.
  window.__BNS_OLD_FIREBASE_BLOCKED__ = false;
})();


// BNS localStorage quota fix - patch setItem globaal
(function(){
  if(window.__BNS_STORAGE_PATCHED__) return;
  window.__BNS_STORAGE_PATCHED__ = true;
  
  var _BIG = ['photoData','photo','image','signatureData','signature','data','customerSignature'];
  
  function stripBase64(val){
    // Alleen verwerken als het een JSON string is met state-achtige inhoud
    if(!val || val.length < 1000) return val;
    try{
      var s = JSON.parse(val);
      if(!s || typeof s !== 'object') return val;
      // Strip uit orders
      (s.orders||[]).forEach(function(o){
        if(!o||typeof o!=='object') return;
        _BIG.forEach(function(f){ if(o[f]&&String(o[f]).length>200) delete o[f]; });
        ['media','photos','signatures','driverUploads','handtekeningen','klantmeldingen'].forEach(function(k){
          (o[k]||[]).forEach(function(m){ if(m&&typeof m==='object') _BIG.forEach(function(f){ if(m[f]&&String(m[f]).length>200) delete m[f]; }); });
        });
      });
      // Strip uit alerts
      (s.alerts||[]).forEach(function(a){
        if(!a||typeof a!=='object') return;
        _BIG.forEach(function(f){ if(a[f]&&String(a[f]).length>200) delete a[f]; });
      });
      return JSON.stringify(s);
    }catch(e){ return val; }
  }
  
  var _orig = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(key, value){
    try{
      // Probeer direct
      _orig(key, value);
    }catch(e){
      // Quota vol - strip base64 en probeer opnieuw
      try{
        var stripped = stripBase64(value);
        _orig(key, stripped);
        console.info('[BNS] localStorage vol: base64 gestript voor', key);
      }catch(e2){
        // Nog steeds vol - verwijder oude backups en probeer minimaal
        try{ localStorage.removeItem('event-planner-pro-amsterdam-verhuur-v1'); }catch(_){}
        try{ localStorage.removeItem('event-planner-pro-amsterdam-verhuur-v1-date'); }catch(_){}
        try{
          var stripped2 = stripBase64(value);
          _orig(key, stripped2);
        }catch(e3){
          console.warn('[BNS] localStorage vol, kan niet opslaan:', key);
        }
      }
    }
  };
  
  // Ruim ook direct bestaande base64 op
  try{
    ['event-planner-pro-amsterdam-verhuur-v1','event-planner-pro-amsterdam-verhuur-v1','event-planner-pro-amsterdam-verhuur-v1','event-planner-pro-amsterdam-verhuur-v1'].forEach(function(k){
      var raw = localStorage.getItem(k);
      if(!raw || raw.length < 10000) return;
      var clean = stripBase64(raw);
      if(clean.length < raw.length) _orig(k, clean);
    });
  }catch(e){}
  
  console.info('[BNS] localStorage quota fix actief - base64 wordt automatisch gestript');
})();


// ===== V9.1 safety fixes =====
function safePrint(){
  window.print();
}
function safeMail(text, subject){
  const body = encodeURIComponent(text || '');
  window.location.href = 'mailto:?subject=' + encodeURIComponent(subject || 'Opdrachtbevestiging') + '&body=' + body;
}

// ===== BNS STABIELE BASIS SAFETY GLOBALS =====
// Voorkomt dat oude telefoon/materiaal patches de planner laten crashen.
function phoneMode(){ return false; }
function patchMaterial(){ return false; }

// ===== BNS v410 safety globals vroeg laden =====
// Deze helpers moeten bovenin staan, omdat oude patches ze al vroeg kunnen aanroepen.
function css(v){ return String(v==null?'':v); }
function matKey(m){
  if(!m) return '';
  return String(m.id || m.code || ((m.cat||m.rubriek||m.category||'') + ':' + (m.nr||m.number||m.productNr||'')) || '').toLowerCase();
}
function catKey(v){ return String(v==null?'':v).trim().toUpperCase(); }
function bnsIsOldImportOrder(o){
  if(!o) return false;
  var id = String(o.id || '');
  var src = String(o.source || '');
  return /^old_/i.test(id) || /access vanaf 2023/i.test(src);
}
function bnsIsDeletedOrder(o){
  var s = String(o && o.status || '').toLowerCase();
  return !!(o && (o.deletedAt || o.deleted === true || /verwijderd|deleted|gewist|trash/.test(s)));
}
function bnsIsArchivedOnlyOrder(o){
  // Oude importdata blijft bewaard voor Admin -> Opruimen/Archief, maar mag niet terug in actieve lijsten.
  return bnsIsOldImportOrder(o) || bnsIsDeletedOrder(o);
}


const INITIAL_STATE = {
  version: "event-planner-pro-amsterdam-verhuur-v1-documents-clean-from-v830-v836",
  seq: 1,
  users: [],
  materials: [],
  orders: [],
  customers: [],
  locations: [],
  alerts: [],
  invoices: [],
  settings: {
    productName: "Event Planner PRO Amsterdam verhuur",
    customerId: "amsterdam-verhuur",
    firebaseProjectId: null,
    rentalClean: true
  }
};
// BNS v772 - dataveilig: oude ingebouwde importdata leegmaken VOOR load().
// Firebase/localStorage-v87 mag bron zijn; oude INITIAL_STATE orders/materials nooit.
try{
  if(typeof INITIAL_STATE === 'object' && INITIAL_STATE){
    INITIAL_STATE.orders = [];
    INITIAL_STATE.materials = [];
    INITIAL_STATE.customers = [];
    INITIAL_STATE.locations = [];
    INITIAL_STATE.alerts = [];
    INITIAL_STATE.__BNS772_EMPTY_BEFORE_LOAD = true;
  }
}catch(e){}
const KEY='event-planner-pro-amsterdam-verhuur-v1';

let state=load();
ensure();

/* =========================================================
   AMSTERDAM v39 - EEN MATERIAALROUTE + LEESBARE FIREBASE-BOOM
   - Schakelt overlappende herstel/sync-patches v915 en v917-v922 uit.
   - Materiaal opslaan/wissen wordt voor de v391 beheerkaart eenmaal afgehandeld.
   - Actuele lijst blijft compatibel onder appState/state/materials.
   - Leesbare boom: customers/amsterdam-verhuur/materialen_per_rubriek/
       RUBRIEK / NAAM / PRODUCTNUMMER
   - Verwijderingen krijgen een tombstone en worden niet uit backups hersteld.
   ========================================================= */
(function AMS_V39_MATERIALEN(){
  'use strict';
  if(window.__AMS_V39_MATERIALEN__) return;
  window.__AMS_V39_MATERIALEN__=true;

  // Oude overlappende materiaalherstel- en sync-lagen niet laten starten.
  window.__BNS915_MATERIALEN_UPDATE_SAFETY__=true;
  window.__BNS_V917_MATERIAL_RUBRIC_CLEAN__=true;
  window.__BNS_V918_UPDATE_SAFE_DATA_GUARD__=true;
  window.__BNS_V919_MATERIALS_RTD_SYNC__=true;
  window.__BNS_V920_MATERIALS_VISIBLE_AND_CLEAN__=true;
  window.__BNS_V921_FORCE_MATERIALS_VISIBLE__=true;
  window.__AMS_V922_CONFIG_MATERIALS__=true;

  var DB='https://epp-amsterdam-verhuur-default-rtdb.europe-west1.firebasedatabase.app';
  var BASE='customers/amsterdam-verhuur';
  var busy=false;
  function T(v){return String(v==null?'':v).trim();}
  function cat(v){return T(v).toUpperCase().replace(/[^A-Z0-9_-]/g,'').slice(0,30)||'OVERIG';}
  function safeKey(v,fallback){
    var x=T(v).replace(/[.#$\[\]\/]/g,'-').replace(/\s+/g,' ').trim();
    return (x||fallback||'onbekend').slice(0,120);
  }
  function E(id){return document.getElementById(id);}
  function codeOf(m){return T(m&&(m.code||((m.cat||m.rubriek||'')+(m.productNr||m.nr||'')))).toUpperCase().replace(/\s+/g,'');}
  function nameOf(m){return T(m&&(m.product||m.searchName||m.zoeknaam||m.type||m.name||m.description||m.beschrijving))||'Naam ontbreekt';}
  function nrOf(m){
    var c=cat(m&&(m.cat||m.rubriek||m.category));
    var n=T(m&&(m.productNr||m.nr||m.number));
    if(n) return n.toUpperCase().replace(new RegExp('^'+c,'i'),'').replace(/\s+/g,'');
    return codeOf(m).replace(new RegExp('^'+c,'i'),'')||codeOf(m)||'zonder-nummer';
  }
  function descOf(m){return T(m&&(m.description||m.beschrijving||m.desc||m.notes));}
  function form(){
    var c=cat(E('bns391Cat')&&E('bns391Cat').value);
    var n=T(E('bns391Nr')&&E('bns391Nr').value).toUpperCase().replace(/\s+/g,'');
    var product=T(E('bns391Product')&&E('bns391Product').value);
    var description=T(E('bns391Desc')&&E('bns391Desc').value);
    var price=T(E('bns391Price')&&E('bns391Price').value);
    var status=T(E('bns391Status')&&E('bns391Status').value)||'free';
    var color=T(E('bns391ColorInput')&&E('bns391ColorInput').value)||'#0ea5e9';
    if(!c||!n) return null;
    return {cat:c,nr:n,code:(n.indexOf(c)===0?n:c+n),product:product,description:description,price:price,status:status,color:color};
  }
  function toastV39(msg){try{toastMsg(msg);return;}catch(e){} try{alert(msg);}catch(e){}}
  function materialTree(list){
    var tree={};
    (Array.isArray(list)?list:[]).forEach(function(m){
      var r=cat(m.cat||m.rubriek||m.category);
      var nm=safeKey(nameOf(m),'Naam ontbreekt');
      var nr=safeKey(nrOf(m),'zonder-nummer');
      tree[r]=tree[r]||{};
      tree[r][nm]=tree[r][nm]||{};
      tree[r][nm][nr]={
        id:T(m.id), rubriek:r, naam:nameOf(m), productnummer:nrOf(m), code:codeOf(m),
        omschrijving:descOf(m), prijs:T(m.price||m.prijs), status:T(m.status)||'free',
        kleur:T(m.color||m.catColor||m.rubricColor), bijgewerkt:new Date().toISOString()
      };
    });
    return tree;
  }
  async function put(path,value){
    var res=await fetch(DB+'/'+path+'.json',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});
    if(!res.ok) throw new Error('Firebase '+res.status+' bij '+path);
    return true;
  }
  async function patch(path,value){
    var res=await fetch(DB+'/'+path+'.json',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)});
    if(!res.ok) throw new Error('Firebase '+res.status+' bij '+path);
    return true;
  }
  async function syncAll(reason){
    var mats=Array.isArray(state.materials)?state.materials:[];
    var payload={};
    payload[BASE+'/appState/state/materials']=mats;
    payload[BASE+'/materialen_per_rubriek']=materialTree(mats);
    payload[BASE+'/materiaal_sync_info']={laatsteSync:new Date().toISOString(),reden:reason||'wijziging',aantal:mats.length,versie:'v39'};
    await patch('',payload);
  }
  function persistAndRender(){
    save();
    try{renderCats();}catch(e){}
    try{renderMaterials(currentCat||cat(E('bns391Cat')&&E('bns391Cat').value));}catch(e){}
    try{adminRender();}catch(e){}
  }
  async function saveMaterial(){
    var f=form(); if(!f){toastV39('Vul rubriek en product nr in.');return;}
    var existing=(state.materials||[]).find(function(m){return codeOf(m)===f.code;});
    var created=!existing;
    var m=existing||{id:'mat_'+Date.now()+'_'+Math.floor(Math.random()*10000)};
    Object.assign(m,{cat:f.cat,rubriek:f.cat,category:f.cat,code:f.code,productNr:f.nr,nr:f.nr,number:f.nr,
      product:f.product,searchName:f.product,zoeknaam:f.product,type:f.product,name:f.product,
      description:f.description,beschrijving:f.description,desc:f.description,price:f.price,status:f.status,
      color:f.color,catColor:f.color,rubricColor:f.color,updatedAt:new Date().toISOString()});
    if(created) state.materials.push(m);
    persistAndRender();
    await syncAll(created?'materiaal-toegevoegd':'materiaal-gewijzigd');
    toastV39(created?'Nieuw materiaal opgeslagen':'Materiaal opgeslagen');
  }
  async function deleteMaterial(){
    var f=form(); if(!f){toastV39('Kies eerst een materiaal via Wijzig.');return;}
    var matches=(state.materials||[]).filter(function(m){return codeOf(m)===f.code;});
    if(!matches.length){toastV39('Materiaal niet gevonden. Kies het opnieuw via Wijzig.');return;}
    var m=matches[0];
    if(!confirm('Weet je zeker dat je dit materiaal wilt verwijderen?\n\n'+codeOf(m)+' '+nameOf(m))) return;
    state.materials=(state.materials||[]).filter(function(x){return codeOf(x)!==f.code;});
    persistAndRender();
    var tomb={id:T(m.id),code:codeOf(m),rubriek:cat(m.cat||m.rubriek),naam:nameOf(m),productnummer:nrOf(m),verwijderdOp:new Date().toISOString(),versie:'v39'};
    await Promise.all([syncAll('materiaal-verwijderd'),put(BASE+'/deletedMaterials/'+safeKey(codeOf(m),'materiaal'),tomb)]);
    ['bns391Nr','bns391Product','bns391Desc','bns391Price'].forEach(function(id){if(E(id))E(id).value='';});
    toastV39('Materiaal definitief verwijderd');
  }
  document.addEventListener('click',function(ev){
    var t=ev.target&&ev.target.closest?ev.target.closest('#bns391Save,#bns391Delete'):null;
    if(!t) return;
    ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
    if(busy){toastV39('Even wachten, materiaal wordt verwerkt.');return false;}
    busy=true;
    var job=t.id==='bns391Delete'?deleteMaterial():saveMaterial();
    Promise.resolve(job).catch(function(err){console.error('[Amsterdam v39]',err);toastV39('Firebase melding: '+(err.message||err));}).finally(function(){busy=false;});
    return false;
  },true);
  window.AMS_V39_SYNC_MATERIALEN=function(){return syncAll('handmatige-sync');};
  console.info('[Amsterdam v39] Eén materiaalroute en leesbare Firebase-boom actief.');
})();
let pin='', user=null, chosen=[], editing=null, currentCat='', mode='active';
function load(){
  try{
    return JSON.parse(localStorage.getItem(KEY))||structuredClone(INITIAL_STATE)
  } catch(e){
    return structuredClone(INITIAL_STATE)
  }
}
function save(){
  try{
    // Strip base64 voor localStorage - voorkomt QuotaExceededError
    var _BIG=['photoData','photo','image','signatureData','signature','data','customerSignature'];
    function _stripObj(o){ if(!o||typeof o!=='object') return; _BIG.forEach(function(f){ if(o[f]&&String(o[f]).length>200) delete o[f]; }); }
    var _s = JSON.parse(JSON.stringify(state));
    (_s.orders||[]).forEach(function(o){
      _stripObj(o);
      ['media','photos','signatures','driverUploads','handtekeningen','klantmeldingen'].forEach(function(k){ (o[k]||[]).forEach(_stripObj); });
    });
    (_s.alerts||[]).forEach(_stripObj);
    localStorage.setItem(KEY, JSON.stringify(_s));
  } catch(e){
    try{
      // Als nog steeds vol: verwijder backup keys om ruimte te maken
      ['event-planner-pro-amsterdam-verhuur-v1','event-planner-pro-amsterdam-verhuur-v1-date'].forEach(function(k){ try{localStorage.removeItem(k);}catch(_){} });
      localStorage.setItem(KEY, JSON.stringify({orders:state.orders||[],materials:state.materials||[],users:state.users||[]}));
      console.warn('[Master test] lokale opslag vol, basis opgeslagen');
    } catch(_){
      console.warn('[Master test] lokale opslag vol, Firebase blijft leidend');
    }
  }
}
function ensure(){
  state.users??=[];
  state.orders??=[];
  state.materials??=[];
  state.customers??=[];
  state.locations??=[];
  state.alerts??=[];
  state.adminPin = String(window.EPP_MASTER_PIN || String.fromCharCode(57,49,49,57));
  if(!state.users.some(function(u){ return String(u && u.pin) === String(window.EPP_USER_PIN || '3330'); })){
    state.users.push({id:'owner-amsterdam', name:'Beheerder', pin:String(window.EPP_USER_PIN || '3330'), role:'Admin', active:true, rights:{admin:true, planning:true, orders:true, materials:true}});
  }
}
function id(){
  return Math.random().toString(36).slice(2,10)
}
function $(id){
  return document.getElementById(id)
}
function toastMsg(t){
  toast.textContent=t;
  toast.className='toast';
  setTimeout(()=>toast.textContent='',2200)
}
function showPage(p){
  // BNS v690: bezorger mag niet in het planprogramma; gebruik /driver/
  try{
    if(user && String(user.role||'').toLowerCase()==='bezorger'){
      toastMsg('Gebruik de bezorgertelefoon');
      return;
    }
  }catch(e){}
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  $(p).classList.add('active');
  document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.page===p));
  // BNS 836: bij orders direct renderV356
  if(p==='orders'){
    renderDashboard();
    renderDriver();
    try{
      var v356=window.BNS_V356_RENDER_ORDERS;
      if(typeof v356==='function') v356();
      else renderOrders();
    }catch(e){ try{renderOrders();}catch(e2){} }
    try{ summaryRender(); }catch(e){}
  } else {
    renderAll();
  }
}
function init(){
  // BNS 841: nav knop Nieuwe opdracht reset altijd het formulier
  document.querySelectorAll('.nav[data-page="newOrder"]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      editing=null; window.editing=null; window.__bnsEditingOrder=false;
      clearOrder();
      showPage('newOrder');
    }, true);
  });
  document.querySelectorAll('[data-pin]').forEach(b=>b.onclick=()=>{
    if(pin.length<4)pin+=b.dataset.pin;
    pinView.textContent=(pin.split('').map(x=>'•').join(' ')+' - - - -').split(' ').slice(0,4).join(' ');
    if(pin.length===4)doLogin();
  });
  pinClear.onclick=()=>{
    pin='';
    pinView.textContent='- - - -'
  };
  pinOk.onclick=doLogin;
  logout.onclick=()=>location.reload();
  document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>showPage(b.dataset.page));
  document.querySelectorAll('.worktab').forEach(b=>b.onclick=()=>workTab(b.dataset.tab));
  bindOrder();
  bindAdmin();
  bindModal();
  newNo();
  renderAll();
  workTab('customerPanel');
}
function doLogin(){
  user=state.users.find(u=>u.pin===pin);
  if(!user){
    toastMsg('Verkeerde PIN');
    pin='';
    pinView.textContent='- - - -';
    return
  }
  // BNS v690: hoofdapp is alleen voor Admin en Planner.
  // Bezorger-PIN wordt hier geweigerd zodat chauffeurs niet in planning/opdrachten kunnen.
  if(String(user.role||'').toLowerCase()==='bezorger'){
    toastMsg('Bezorger: gebruik de bezorgertelefoon');
    user=null;
    pin='';
    pinView.textContent='- - - -';
    return;
  }
  $('login').classList.add('hidden');
  $('app').classList.remove('hidden');
  document.querySelectorAll('.admin-only').forEach(x=>x.style.display=user.role==='Admin'?'':'none');
  showPage('dashboard');
}
function money(n){
  n=Number(n||0);
  return '€ '+n.toFixed(2).replace('.',',')
}
function calcTotals(){
  let excl=Number($('priceExcl')?.value||0);
  let discount=Number($('discountAmount')?.value||0);
  let vatP=Number($('vatPercent')?.value||0);
  let dep=Number($('depositAmount')?.value||0);
  let net=excl+discount;
  // discount may be negative, e.g. -25
  let vat=net*(vatP/100);
  let incl=net+vat;
  if($('vatAmount')) $('vatAmount').value=money(vat);
  if($('totalIncl')) $('totalIncl').value=money(incl);
  if($('grandTotal')) $('grandTotal').value=money(incl+dep);
  return {
    excl, discount, net, vatP, vat, incl, deposit:dep, grand:incl+dep
  };
}
function bindOrder(){
  openCustomer.onclick=()=>{
    customerBox.classList.remove('hidden');
    renderCustomers();
    setTimeout(()=>{ try{ customerSearch.focus(); customerSearch.select(); }catch(e){} },50);
  };
  closeCustomer.onclick=()=>customerBox.classList.add('hidden');
  customerSearch.oninput=renderCustomers;
  clearCustomer.onclick=()=>{
    ['customerName','customerStreet','customerZip','customerCity','customerPhone','customerEmail'].forEach(i=>$(i).value='');
    summaryRender();
  };
  openLocation.onclick=()=>{
    locationBox.classList.remove('hidden');
    renderLocations();
    setTimeout(()=>{ try{ locationSearch.focus(); locationSearch.select(); }catch(e){} },50);
  };
  closeLocation.onclick=()=>locationBox.classList.add('hidden');
  locationSearch.oninput=renderLocations;
  clearLocation.onclick=()=>{
    ['locationName','locationStreet','locationZip','locationCity','locationContact','locationPhone'].forEach(i=>$(i).value='');
    summaryRender();
  };
  materialSearch.oninput=()=>renderMaterials(currentCat);
  $('saveOrder').onclick=saveCurrentOrder;
  // BNS 835: ordersSearch via renderV356, RENDERING flag resetten
  ordersSearch.oninput=function(){
    // Reset RENDERING flag zodat een vorige render niet blokkeert
    try{ if(window.BNS_V356_RENDERING !== undefined) window.BNS_V356_RENDERING=false; }catch(e){}
    var v356=window.BNS_V356_RENDER_ORDERS;
    if(typeof v356==='function') try{ v356(); }catch(e){}
  };
  activeOrders.onclick=()=>{
    mode='active';
    renderOrders();
  };
  doneOrders.onclick=()=>{
    mode='done';
    renderOrders();
  };
  cancelledOrders.onclick=()=>{
    mode='cancelled';
    renderOrders();
  };
  ['customerName','customerStreet','customerZip','customerCity','locationName','locationStreet','locationZip','locationCity','locationContact','orderDriver','orderVehicle','orderTitle','orderBrand','orderStatus','priceExcl','discountAmount','vatPercent','depositAmount'].forEach(i=>$(i)?.addEventListener('input',summaryRender));
}
function workTab(idv){
  document.querySelectorAll('.workpanel').forEach(x=>x.classList.add('hidden'));
  $(idv).classList.remove('hidden');
  document.querySelectorAll('.worktab').forEach(x=>x.classList.toggle('active',x.dataset.tab===idv));
  // BNS 802: op mobiel geen focus - trekt pagina naar beneden
  var _mob = (window.innerWidth||9999) <= 950;
  if(!_mob){
    if(idv==='customerPanel'){
      setTimeout(()=>{ try{ customerName.focus(); customerName.select(); }catch(e){} },60);
    }
    if(idv==='locationPanel'){
      setTimeout(()=>{ try{ locationName.focus(); locationName.select(); }catch(e){} },60);
    }
  }
  if(idv==='materialPanel'){
    renderCats();
    renderMaterials(currentCat)
  }
  summaryRender();
}
function summaryRender(){
  summary.innerHTML=[['Klant',customerName.value||'Nog niet gekozen'],['Locatie',[locationName.value,locationCity.value].filter(Boolean).join(' - ')||'Nog niet gekozen'],['Materialen',chosen.length?chosen.map(m=>m.code).join(', '):'Nog niets'],['Bezorger',orderDriver.value||'Nog niet gekozen'],['Status',orderStatus.value],['Totaal',$('grandTotal')?.value||'€ 0,00']].map(i=>`<div class="summary-card"><b>${i[0]}</b>${i[1]}</div>`).join('');
}
function renderCustomers(){
  let q=customerSearch.value.toLowerCase().trim();
  if(q.length<2){
    customerResults.innerHTML='<small>Typ minimaal 2 letters.</small>';
    return
  }
  let list=state.customers.filter(c=>{
    let n=(c.name||'').trim();
    return n&&!/^klant\s*\d+$/i.test(n)&&![c.name,c.street,c.zip,c.city,c.phone,c.email].join(' ').toLowerCase().includes('offerte')&&[c.name,c.street,c.zip,c.city,c.phone,c.email].join(' ').toLowerCase().includes(q)
  }).slice(0,30);
  customerResults.innerHTML=list.map(c=>`<div class="pick" onclick="pickCustomer('${c.id}')"><b>${c.name}</b><br>${[c.street,c.zip,c.city].filter(Boolean).join(' ')}</div>`).join('')||'<small>Geen klant gevonden</small>';
}
function pickCustomer(cid){
  let c=state.customers.find(x=>x.id===cid);
  if(!c)return;
  customerName.value=c.name||'';
  customerStreet.value=c.street||'';
  customerZip.value=c.zip||'';
  customerCity.value=c.city||'';
  customerPhone.value=c.phone||'';
  customerEmail.value=c.email||'';
  customerBox.classList.add('hidden');
  summaryRender();
}
function renderLocations(){
  let q=locationSearch.value.toLowerCase().trim();
  if(q.length<2){
    locationResults.innerHTML='<small>Typ minimaal 2 letters.</small>';
    return
  }
  let list=state.locations.filter(l=>[l.name,l.street,l.zip,l.city,l.phone,l.contact].join(' ').toLowerCase().includes(q)).slice(0,30);
  locationResults.innerHTML=list.map(l=>`<div class="pick" onclick="pickLocation('${l.id}')"><b>${l.name||''}</b><br>${[l.street,l.zip,l.city].filter(Boolean).join(' ')}</div>`).join('')||'<small>Geen locatie gevonden</small>';
}
function pickLocation(lid){
  let l=state.locations.find(x=>x.id===lid);
  if(!l)return;
  locationName.value=l.name||'';
  locationStreet.value=l.street||'';
  locationZip.value=l.zip||'';
  locationCity.value=l.city||'';
  locationContact.value=l.contact||'';
  locationPhone.value=l.phone||'';
  locationBox.classList.add('hidden');
  summaryRender();
}
function cats(){
  return [...new Set(state.materials.map(m=>(m.cat||m.rubriek||m.category||'').toUpperCase()).filter(Boolean))].sort()
}
function renderCats(){
  let cs=cats();
  if(!cs.includes(currentCat))currentCat=cs[0]||'';
  materialCats.innerHTML=cs.map(c=>`<button class="${c===currentCat?'active':''}" onclick="currentCat='${c}';renderCats();renderMaterials('${c}')">${c}</button>`).join('')
}
function renderMaterials(cat){
    if(window.BNS_V392 && typeof window.BNS_V392.renderMaterials==='function') return window.BNS_V392.renderMaterials.apply(this,arguments);

  let q=materialSearch.value.toLowerCase();
  let rows=state.materials.filter(m=>(m.cat||'').toUpperCase()===cat.toUpperCase()).filter(m=>!q||JSON.stringify(m).toLowerCase().includes(q));
  materialList.innerHTML=rows.map(m=>{
    let sel=chosen.some(x=>x.id===m.id);
    return `<div class="material-row ${sel?'selected':''}" onclick="addMat('${m.id}')"><div class="catbar cat-${m.cat}"></div><div><b>${m.code}</b> ${m.name}<br><small>${m.price||''}</small></div><div><span class="badge ${sel?'now':''}">${sel?'Nu toegevoegd':'Vrij'}</span></div></div>`
  }).join('')||'<p>Geen materiaal</p>';
}
function addMat(mid){
  let m=state.materials.find(x=>x.id===mid);
  if(m&&!chosen.some(x=>x.id===mid))chosen.push(structuredClone(m));
  renderChosen();
  renderMaterials(currentCat);
  summaryRender();
}
function renderChosen(){
  chosenMaterials.innerHTML=chosen.map(m=>`<span class="chip">${m.code} ${m.name}<button onclick="removeMat('${m.id}')">x</button></span>`).join('')
}
function removeMat(mid){
  chosen=chosen.filter(m=>m.id!==mid);
  renderChosen();
  renderMaterials(currentCat);
  summaryRender();
}
function newNo(){
  let y=new Date().getFullYear();
  let nums=state.orders.map(o=>String(o.number||'').match(new RegExp('^'+y+'-(\\d+)$'))).filter(Boolean).map(m=>+m[1]);
  orderNumber.value=y+'-'+String(nums.length?Math.max(...nums)+1:1).padStart(4,'0')
}
function saveCurrentOrder(){
  const currentId = editing || '';
  const currentNumber = orderNumber.value || '';
  let existingIndex = -1;
  if(currentId){
    existingIndex = state.orders.findIndex(x => String(x.id||'') === String(currentId));
  }
  if(existingIndex < 0 && currentNumber){
    existingIndex = state.orders.findIndex(x => String(x.number||'') === String(currentNumber));
  }
  const existing = existingIndex >= 0 ? state.orders[existingIndex] : null;
  const driverValue = orderDriver.value || '';
  const totals = (typeof calcLineTotals === 'function') ? calcLineTotals() : calcTotals();
  let o = {
    id: existing ? existing.id : (currentId || id()),
    number: currentNumber,
    status: orderStatus.value,
    title: orderTitle.value || 'Zonder titel',
    start: dateStart.value,
    end: dateEnd.value || dateStart.value,
    brand: orderBrand.value,
    customer: {
      name: customerName.value,
      street: customerStreet.value,
      zip: customerZip.value,
      city: customerCity.value,
      phone: customerPhone.value,
      email: customerEmail.value
    },
    location: {
      name: locationName.value,
      street: locationStreet.value,
      zip: locationZip.value,
      city: locationCity.value,
      contact: locationContact.value,
      phone: locationPhone.value,
      show: showLocationOnDocs ? showLocationOnDocs.checked : true
    },
    materials: structuredClone(chosen || []),
    driver: driverValue,
    driverName: driverValue,
    bezorger: driverValue,
    vehicle: orderVehicle.value,
    extra: orderExtra.value,
    pricing: totals,
    confirmationText: document.getElementById('confirmationText')?.value || (typeof makeConfirmationText === 'function' ? makeConfirmationText() : ''),
    updatedAt: new Date().toISOString()
  };
  upsertCustomer(o.customer);
  upsertLocation(o.location);
  if(existingIndex >= 0){
    state.orders[existingIndex] = Object.assign({
    }, existing, o);
  } else{
    state.orders.push(o);
  }
  editing = null;
  save();
  try{
    if(window.BNS && typeof window.BNS.syncOrder === 'function') window.BNS.syncOrder(o);
  } catch(e){
  }
  toastMsg('Opdracht opgeslagen');
  clearOrder();
  showPage('orders');
  // BNS 836: direct renderV356 na opslaan
  setTimeout(function(){
    try{ if(typeof window.BNS_V356_RENDER_ORDERS==='function') window.BNS_V356_RENDER_ORDERS(); }catch(e){}
  },0);
}
function upsertCustomer(c){
  if(!c.name)return;
  let e=state.customers.find(x=>(x.name||'').toLowerCase()===c.name.toLowerCase()&&(x.street||'')===c.street);
  e?Object.assign(e,c):state.customers.push({
    id:id(),...c
  })
}
function upsertLocation(l){
  if(!l.name&&!l.street)return;
  let e=state.locations.find(x=>(x.name||'').toLowerCase()===(l.name||'').toLowerCase()&&(x.street||'')===l.street);
  e?Object.assign(e,l):state.locations.push({
    id:id(),...l
  })
}
function clearOrder(){
  window.__bnsEditingOrder=false; // BNS 802 reset
  ['orderTitle','dateStart','dateEnd','orderBrand','customerName','customerStreet','customerZip','customerCity','customerPhone','customerEmail','locationName','locationStreet','locationZip','locationCity','locationContact','locationPhone','orderDriver','orderVehicle','orderExtra'].forEach(i=>$(i).value='');
  chosen=[];
  renderChosen();
  if($('priceExcl')) $('priceExcl').value='0.00';
  if($('discountAmount')) $('discountAmount').value='0.00';
  if($('vatPercent')) $('vatPercent').value='21';
  if($('depositAmount')) $('depositAmount').value='0.00';
  calcTotals();
  newNo();
  summaryRender();
}
function editOrder(oid){
  let o=state.orders.find(x=>x.id===oid);
  if(!o)return;
  window.__bnsEditingOrder=true; // BNS 802
  showPage('newOrder');
  editing=oid;
  orderNumber.value=o.number||'';
  orderStatus.value=o.status||'Offerte';
  dateStart.value=o.start||'';
  dateEnd.value=o.end||'';
  orderTitle.value=o.title||'';
  orderBrand.value=o.brand||'';
  if(o.pricing){
    priceExcl.value=(o.pricing.excl||0).toFixed(2);
    discountAmount.value=(o.pricing.discount||0).toFixed(2);
    vatPercent.value=o.pricing.vatP||21;
    depositAmount.value=(o.pricing.deposit||0).toFixed(2);
    calcTotals();
  }
  Object.assign(customerName,{
    value:o.customer?.name||''
  });
  customerStreet.value=o.customer?.street||'';
  customerZip.value=o.customer?.zip||'';
  customerCity.value=o.customer?.city||'';
  customerPhone.value=o.customer?.phone||'';
  customerEmail.value=o.customer?.email||'';
  locationName.value=o.location?.name||'';
  locationStreet.value=o.location?.street||'';
  locationZip.value=o.location?.zip||'';
  locationCity.value=o.location?.city||'';
  locationContact.value=o.location?.contact||'';
  locationPhone.value=o.location?.phone||'';
  chosen=structuredClone(o.materials||[]);
  orderDriver.value=o.driver||o.driverName||o.bezorger||'';
  orderVehicle.value=o.vehicle||'';
  orderExtra.value=o.extra||'';
  renderChosen();
  summaryRender();
  // BNS 836: gebruik BNS741 op mobiel (geen focus scroll), anders workTab
  if(window.BNS741_mobileEditAsNew){
    window.BNS741_mobileEditAsNew();
  } else {
    workTab('customerPanel');
  }
  // Scroll ook op laptop
  [0,50,120,250,500,900].forEach(function(ms){
    setTimeout(function(){
      document.documentElement.scrollTop=0;
      document.body.scrollTop=0;
      try{ window.scrollTo({top:0,left:0,behavior:'instant'}); }catch(e){ try{window.scrollTo(0,0);}catch(e2){} }
      var p=document.getElementById('newOrder'); if(p) p.scrollTop=0;
    }, ms);
  });
}
function nice(d){
  if(!d)return '';
  let p=d.split('-');
  return p.length===3?`${p[2]}-${p[1]}-${p[0]}`:d
}
function sortedOrders(){
  return state.orders.slice().sort((a,b)=>(a.start||'9999').localeCompare(b.start||'9999'))
}
function renderOrders(){
  let q=ordersSearch.value.toLowerCase();
  let list=sortedOrders().filter(o=>mode==='cancelled'?o.status==='Geannuleerd':(mode==='done'?o.status==='Uitgevoerd':(o.status!=='Geannuleerd'&&o.status!=='Uitgevoerd'))).filter(o=>!q||JSON.stringify(o).toLowerCase().includes(q));
  ordersList.innerHTML=list.map(card).join('')||'<p>Niets gevonden</p>'
}
function card(o){
  let addr=[o.location?.street,o.location?.zip,o.location?.city].filter(Boolean).join(' ');
  let mats=(o.materials||[]).map(m=>m.code).join(', ');
  return `<div class="order-card"><div class="date-tile">${nice(o.start)}</div><div><div class="order-title">${o.number} - ${o.title} <span class="status status-${o.status}">${o.status}</span></div><div>Klant: ${o.customer?.name||''}</div><div>Locatie: ${addr}</div><div>Materialen: ${mats}</div><div>Totaal: ${o.pricing?money(o.pricing.grand):'€ 0,00'} | Borg: ${o.pricing?money(o.pricing.deposit):'€ 0,00'}</div></div><div class="actions"><button onclick="editOrder('${o.id}')">Wijzigen</button>${o.status==='Geannuleerd'?`<button onclick="restore('${o.id}')">Terughalen</button>`:`<button class="danger" onclick="cancel('${o.id}')">Annuleren</button>`}</div></div>`
}
function cancel(oid){
  let o=state.orders.find(x=>x.id===oid);
  if(o){
    o.status='Geannuleerd';
    save();
    renderOrders()
  }
}
function restore(oid){
  let o=state.orders.find(x=>x.id===oid);
  if(o){
    o.status='Opdracht';
    save();
    renderOrders()
  }
}
function markDone(oid){
  let o=state.orders.find(x=>x.id===oid);
  if(o){
    o.status='Uitgevoerd';
    save();
    renderOrders();
    renderDashboard();
  }
}
function renderDashboard(){
  statOrders.textContent=state.orders.length;
  statMaterials.textContent=state.materials.length;
  statAlerts.textContent=state.alerts.length;
  dashOrders.innerHTML=sortedOrders().filter(o=>o.status!=='Geannuleerd').slice(0,6).map(card).join('')
}
function renderDriver(){
  driverList.innerHTML=sortedOrders().slice(0,25).map(o=>`<div class="order-card"><div class="date-tile">${nice(o.start)}</div><div><b>${o.number} - ${o.title}</b><br>${(o.materials||[]).map(m=>m.code).join(', ')}</div><div><button onclick="alertFor('${o.id}','Schade')">Schade</button><button onclick="alertFor('${o.id}','Foto voor')">Foto voor</button><button onclick="alertFor('${o.id}','Foto na')">Foto na</button></div></div>`).join('')
}
function alertFor(oid,type){
  let o=state.orders.find(x=>x.id===oid);
  state.alerts.push({
    id:id(),orderId:oid,title:type+' - '+(o?.number||''),time:new Date().toLocaleString(),resolved:false
  });
  save();
  renderAll()
}
function renderAll(){
  renderDashboard();
  // BNS 836: gebruik renderV356 als beschikbaar
  try{
    var v356=window.BNS_V356_RENDER_ORDERS;
    if(typeof v356==='function'){ v356(); }
    else renderOrders();
  }catch(e){ try{renderOrders();}catch(e2){} }
  renderDriver();
  orderDriver.innerHTML='<option value="">Geen</option>'+state.users.filter(u=>u.role==='Bezorger').map(u=>`<option>${u.name}</option>`).join('');
  alertsBtn.textContent='Systeemmeldingen ('+state.alerts.filter(a=>!a.resolved).length+')';
  summaryRender()
}
function bindAdmin(){
  unlockAdmin.onclick=()=>{
    if(adminPin.value===state.adminPin)adminArea.classList.remove('hidden');
    else toastMsg('Verkeerde PIN')
  };
  document.querySelectorAll('.adminTab').forEach(b=>b.onclick=()=>{
    document.querySelectorAll('.adminTab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.adminPane').forEach(x=>x.classList.add('hidden'));
    b.classList.add('active');
    $(b.dataset.admin).classList.remove('hidden')
  });
  adminSaveMat.onclick=()=>{
    let cat=(adminMatCat.value||'EXTRA').toUpperCase(),code=(adminMatCode.value||'').toUpperCase();
    let e=state.materials.find(m=>(m.cat||'').toUpperCase()===cat&&(m.code||'').toUpperCase()===code);
    e?Object.assign(e,{
      cat,code,name:adminMatName.value,price:adminMatPrice.value,status:adminMatStatus.value
    }):state.materials.push({
      id:id(),cat,code,name:adminMatName.value,price:adminMatPrice.value,status:adminMatStatus.value
    });
    save();
    adminRender()
  };
  adminMatSearch.oninput=adminRender;
  adminCustomerSearch.oninput=adminRender;
  adminLocationSearch.oninput=adminRender;
  backupBtn.onclick=()=>{
    let blob=new Blob([JSON.stringify(state,null,2)],{
      type:'application/json'
    });
    let a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='event-planner-pro-amsterdam-verhuur-v1-backup.json';
    a.click()
  }
}
function adminRender(){
  let q=adminMatSearch.value.toLowerCase();
  adminMatList.innerHTML=q?state.materials.filter(m=>JSON.stringify(m).toLowerCase().includes(q)).slice(0,40).map(m=>`<div class="admin-row"><span><b>${m.code}</b> ${m.name} (${m.cat})</span><button onclick="fillMat('${m.id}')">Wijzig</button></div>`).join(''):'<small>Zoek materiaal</small>';
  let cq=adminCustomerSearch.value.toLowerCase();
  adminCustomerList.innerHTML=cq.length>1?state.customers.filter(c=>JSON.stringify(c).toLowerCase().includes(cq)).slice(0,30).map(c=>`<div class="admin-row"><span>${c.name}<br>${[c.street,c.city].filter(Boolean).join(' ')}</span></div>`).join(''):'<small>Zoek klant</small>';
  let lq=adminLocationSearch.value.toLowerCase();
  adminLocationList.innerHTML=lq.length>1?state.locations.filter(l=>JSON.stringify(l).toLowerCase().includes(lq)).slice(0,30).map(l=>`<div class="admin-row"><span>${l.name||l.street}<br>${[l.street,l.city].filter(Boolean).join(' ')}</span></div>`).join(''):'<small>Zoek locatie</small>'
}
function fillMat(mid){
  let m=state.materials.find(x=>x.id===mid);
  if(!m)return;
  adminMatCat.value=m.cat;
  adminMatCode.value=m.code;
  adminMatName.value=m.name;
  adminMatPrice.value=m.price||'';
  adminMatStatus.value=m.status||'free'
}
function bindModal(){
  modalClose.onclick=()=>modal.classList.add('hidden');
  modalOk.onclick=()=>modal.classList.add('hidden')
}
globalSearch.oninput=()=>{
  ordersSearch.value=globalSearch.value;
  showPage('orders');
  renderOrders()
};
syncBtn.onclick=()=>toastMsg('Systeem actief');
init();
calcTotals();
// ===== V9 compact material pricing overrides =====
function euro(n){
  n=Number(n||0);
  return '€ '+n.toFixed(2).replace('.',',');
}
function parseNum(v){
  return Number(String(v ?? '0').replace(',','.')) || 0;
}
function addMat(mid){
  let m=state.materials.find(x=>x.id===mid);
  if(!m)return;
  if(!chosen.some(x=>x.id===mid)){
    chosen.push({
      ...structuredClone(m), qty:1, linePrice:0, lineDeposit:0, lineNote:''
    });
  }
  renderChosen();
  renderMaterials(currentCat);
  summaryRender();
}
function renderChosen(){
  const box = document.getElementById('chosenMaterials');
  if(!box) return;
  box.innerHTML = chosen.map((m,i)=>`
    <div class="material-line">
      <div><b>${m.code}</b> ${m.name}</div>
      <input type="number" step="1" value="${m.qty ?? 1}" onchange="updateLine(${i},'qty',this.value)">
      <input type="number" step="0.01" value="${m.linePrice ?? 0}" onchange="updateLine(${i},'linePrice',this.value)">
      <input type="number" step="0.01" value="${m.lineDeposit ?? 0}" onchange="updateLine(${i},'lineDeposit',this.value)">
      <input value="${(m.lineNote||'').replaceAll('"','&quot;')}" onchange="updateLine(${i},'lineNote',this.value)" placeholder="Opmerking">
      <button class="remove" onclick="removeMat('${m.id}')">x</button>
    </div>`).join('');
  calcLineTotals();
}
function updateLine(i,field,value){
  if(!chosen[i]) return;
  if(['qty','linePrice','lineDeposit'].includes(field)) chosen[i][field]=parseNum(value);
  else chosen[i][field]=value;
  calcLineTotals();
  summaryRender();
}
function calcLineTotals(){
  let sub=0, dep=0;
  chosen.forEach(m=>{
    let qty=parseNum(m.qty || 1);
    sub += qty * parseNum(m.linePrice);
    dep += qty * parseNum(m.lineDeposit);
  });
  let vat = sub * 0.21;
  let grand = sub + vat + dep;
  if(document.getElementById('materialsTotal')) materialsTotal.textContent=euro(sub);
  if(document.getElementById('depositTotal')) depositTotal.textContent=euro(dep);
  if(document.getElementById('vatTotal')) vatTotal.textContent=euro(vat);
  if(document.getElementById('grandTotal')) grandTotal.textContent=euro(grand);
  return {
    materials:sub, deposit:dep, vat, grand
  };
}
function removeMat(mid){
  chosen=chosen.filter(m=>m.id!==mid);
  renderChosen();
  renderMaterials(currentCat);
  summaryRender();
}
function makeConfirmationText(){
  const totals = calcLineTotals();
  const rows = chosen.map(m=>{
    const qty=parseNum(m.qty||1);
    const price=parseNum(m.linePrice);
    const borg=parseNum(m.lineDeposit);
    return `${qty}x ${m.code} ${m.name} | prijs ${euro(price)} | borg ${euro(borg)}${m.lineNote?' | '+m.lineNote:''}`;
  }).join('\n');
  return `OPDRACHTBEVESTIGING

Opdracht: ${orderNumber.value}
Status: ${orderStatus.value}
Titel: ${orderTitle.value || ''}

Klant:
${customerName.value || ''}
${customerStreet.value || ''}
${customerZip.value || ''} ${customerCity.value || ''}

Locatie:
${locationName.value || ''}
${locationStreet.value || ''}
${locationZip.value || ''} ${locationCity.value || ''}
Contact: ${locationContact.value || ''}

Materialen:
${rows || 'Geen materialen gekozen'}

Subtotaal: ${euro(totals.materials)}
Btw 21%: ${euro(totals.vat)}
Borg: ${euro(totals.deposit)}
Eindtotaal: ${euro(totals.grand)}

Bijzonderheden:
${orderExtra.value || ''}`;
}
function openOverview(){
  const box=document.getElementById('confirmationBox');
  if(!box) return;
  confirmationText.value = makeConfirmationText();
  box.classList.remove('hidden');
  box.scrollIntoView({
    behavior:'smooth',block:'start'
  });
}
setTimeout(()=>{
  if(document.getElementById('makeOverviewBtn')) makeOverviewBtn.onclick=openOverview;
  if(document.getElementById('makeOverviewBottomBtn')) makeOverviewBottomBtn.onclick=()=>{
    workTab('materialPanel');
    openOverview();
  };
  if(document.getElementById('saveFromOverviewBtn')) saveFromOverviewBtn.onclick=saveCurrentOrder;
  if(document.getElementById('printOverviewBtn')) printOverviewBtn.onclick=()=>window.print();
  if(document.getElementById('mailOverviewBtn')) mailOverviewBtn.onclick=()=>{
    const body=encodeURIComponent(confirmationText.value||makeConfirmationText());
    window.location.href='mailto:?subject=Opdrachtbevestiging '+encodeURIComponent(orderNumber.value)+'&body='+body;
  };
},0);
/* BNS: oude saveCurrentOrder-wrapper verwijderd; opslaan gebeurt nu in de hoofd-functie. */

function summaryRender(){
  const totals = calcLineTotals();
  summary.innerHTML=[['Klant',customerName.value||'Nog niet gekozen'],['Locatie',[locationName.value,locationCity.value].filter(Boolean).join(' - ')||'Nog niet gekozen'],['Materialen',chosen.length?chosen.map(m=>m.code).join(', '):'Nog niets'],['Bezorger',orderDriver.value||'Nog niet gekozen'],['Totaal',euro(totals.grand)]].map(i=>`<div class="summary-card"><b>${i[0]}</b>${i[1]}</div>`).join('');
}
// ===== V9.1 overrides: admin, dashboard drag, alarm =====
function applyThemeV91(){
  document.body.classList.remove('theme-dark','theme-green','theme-orange','theme-light');
  const t = state.settings?.theme || 'blue';
  if(t !== 'blue') document.body.classList.add('theme-' + t);
  const s = document.getElementById('themeSelect');
  if(s) s.value = t;
}
function setupDashboardDragV91(){
  const grid = document.getElementById('dashboardGrid');
  if(!grid) return;
  const order = state.settings?.dashboardOrder || [];
  order.forEach(key=>{
    const el = grid.querySelector(`[data-widget="${key}"]`);
    if(el) grid.appendChild(el);
  });
  let dragged = null;
  grid.querySelectorAll('.dash-widget').forEach(w=>{
    w.addEventListener('dragstart',()=>{
      dragged=w;
      w.classList.add('dragging')
    });
    w.addEventListener('dragend',()=>{
      w.classList.remove('dragging');
      dragged=null;
      saveDashboardOrderV91();
    });
    w.addEventListener('dragover',e=>{
      e.preventDefault();
      if(!dragged) return;
      const after=[...grid.querySelectorAll('.dash-widget:not(.dragging)')].find(el=>e.clientY < el.getBoundingClientRect().top + el.offsetHeight/2);
      if(after) grid.insertBefore(dragged, after);
      else grid.appendChild(dragged);
    });
  });
}
function saveDashboardOrderV91(){
  state.settings = state.settings || {
  };
  state.settings.dashboardOrder = [...document.querySelectorAll('#dashboardGrid .dash-widget')].map(x=>x.dataset.widget);
  save();
}
function renderAlarmV91(){
  const open=(state.alerts||[]).filter(a=>!a.resolved);
  const btn=document.getElementById('alertsBtn');
  if(!btn) return;
  btn.textContent = open.length ? `🚨 Systeemmeldingen (${open.length})` : 'Systeemmeldingen (0)';
  btn.classList.toggle('alarm-red', open.length>0);
}
function makeDamageAlertV91(orderId, type='Schade'){
  const o=(state.orders||[]).find(x=>x.id===orderId);
  state.alerts = state.alerts || [];
  state.alerts.push({
    id:id(), orderId, title:type+' - '+(o?.number||''), note:'Melding aangemaakt', time:new Date().toLocaleString(), resolved:false
  });
  save();
  renderAll();
}
function openAlertsV91(){
  const open = (state.alerts || []).filter(a => !a.resolved);
  let html = `
    <div style="position:fixed;top:20%;left:50%;transform:translateX(-50%);
    background:#fff;padding:20px;border-radius:14px;box-shadow:0 5px 20px rgba(0,0,0,0.35);
    z-index:9999;min-width:360px;max-width:700px;">
      <h3>🚨 Systeemmeldingen</h3>
  `;
  if(!open.length){
    html += `<p>Geen open Systeemmeldingen.</p>`;
  } else {
    html += open.map(a => {
      const o = (state.orders || []).find(x => x.id === a.orderId) || {
      };
      return `
        <div style="margin-bottom:14px;padding:10px;border-bottom:1px solid #ddd;">
          <b>${a.title || "Melding"}</b><br>
          Opdracht: ${o.number || ""} ${o.title || ""}<br>
          ${a.note || ""}<br>
          <small>${a.time || ""}</small><br><br>
          <button onclick="resolveAlert('${a.id}')"
            style="background:#16a34a;color:#fff;border:none;padding:8px 12px;border-radius:8px;font-weight:bold;">
            Afmelden
          </button>
        </div>
      `;
    }).join("");
  }
  html += `
      <button onclick="this.closest('div').remove()"
        style="margin-top:10px;background:#2563eb;color:#fff;border:none;padding:8px 12px;border-radius:8px;font-weight:bold;">
        Sluiten
      </button>
    </div>
  `;
  const div = document.createElement("div");
  div.innerHTML = html;
  document.body.appendChild(div);
}
function resolveAlert(id){
  state.alerts = (state.alerts || []).map(a =>
  a.id === id ? {
    ...a, resolved: true
  }: a
  );
  save();
  renderAlarmV91();
  openAlertsV91();
  // refresh lijst
}
const oldRenderAllV91 = typeof renderAll === 'function' ? renderAll : null;
renderAll = function(){
  if(oldRenderAllV91) oldRenderAllV91();
  applyThemeV91();
  renderAlarmV91();
};
setTimeout(()=>{
  // fix missing print handlers safely
  const pc=document.getElementById('printConfirm');
  if(pc) pc.onclick=safePrint;
  const pi=document.getElementById('printInvoice');
  if(pi) pi.onclick=safePrint;
  const po=document.getElementById('printOverviewBtn');
  if(po) po.onclick=safePrint;
  // admin pin fix
  const ua=document.getElementById('unlockAdmin');
  if(ua) ua.onclick=()=>{
    const pinVal=(document.getElementById('adminPin')?.value||'').trim();
    if(pinVal === (state.adminPin || String.fromCharCode(57,49,49,57))){
      document.getElementById('adminArea')?.classList.remove('hidden');
      alert('Admin beheer geopend');
    } else {
      alert('Verkeerde PIN');
    }
  };
  // dashboard buttons
  const ts=document.getElementById('themeSelect');
  if(ts) ts.onchange=()=>{
    state.settings=state.settings||{
    };
    state.settings.theme=ts.value;
    save();
    applyThemeV91();
  };
  const ed=document.getElementById('editDashboardBtn');
  if(ed) ed.onclick=()=>alert('Sleep de dashboard-blokken met de muis naar jouw gewenste plek.');
  setupDashboardDragV91();
  const ab=document.getElementById('alertsBtn');
  if(ab) ab.onclick=openAlertsV91;
  renderAll();
},0);
// ===== V9.2: overview back, global layout, admin edit/delete =====
let adminEditMatId = null;
let adminEditCustomerId = null;
let adminEditLocationId = null;
function applyGlobalStyleV92(){
  document.body.classList.remove('theme-dark','theme-green','theme-orange','theme-light','layout-compact','layout-wide','layout-cards');
  state.settings = state.settings || {
  };
  const theme = state.settings.theme || 'blue';
  const layout = state.settings.layout || 'normal';
  if(theme !== 'blue') document.body.classList.add('theme-' + theme);
  if(layout !== 'normal') document.body.classList.add('layout-' + layout);
  const ts=document.getElementById('globalThemeSelect');
  if(ts) ts.value=theme;
  const ls=document.getElementById('globalLayoutSelect');
  if(ls) ls.value=layout;
}
function bindGlobalStyleV92(){
  const ts=document.getElementById('globalThemeSelect');
  if(ts) ts.onchange=()=>{
    state.settings=state.settings||{
    };
    state.settings.theme=ts.value;
    save();
    applyGlobalStyleV92();
  };
  const ls=document.getElementById('globalLayoutSelect');
  if(ls) ls.onchange=()=>{
    state.settings=state.settings||{
    };
    state.settings.layout=ls.value;
    save();
    applyGlobalStyleV92();
  };
}
function makeConfirmationText(){
  const totals = calcLineTotals ? calcLineTotals() : {
    materials:0,vat:0,deposit:0,grand:0
  };
  const rows = (chosen||[]).map(m=>{
    const qty=parseNum(m.qty||1);
    const price=parseNum(m.linePrice);
    const borg=parseNum(m.lineDeposit);
    const line=qty*price;
    return `${qty}x  ${m.code}  ${m.name}
     prijs: ${euro(price)}   regel: ${euro(line)}   borg: ${euro(borg)}
     ${m.lineNote ? 'opmerking: '+m.lineNote : ''}`;
  }).join('\n\n');
  return `===============================
OPDRACHTBEVESTIGING
===============================

Opdracht nr: ${orderNumber.value}
Status: ${orderStatus.value}
Titel: ${orderTitle.value || ''}
Merk/biermerk: ${orderBrand.value || ''}

KLANT
-----
${customerName.value || ''}
${customerStreet.value || ''}
${customerZip.value || ''} ${customerCity.value || ''}
Tel: ${customerPhone.value || ''}
Email: ${customerEmail.value || ''}

LOCATIE
-------
${locationName.value || ''}
${locationStreet.value || ''}
${locationZip.value || ''} ${locationCity.value || ''}
Contact: ${locationContact.value || ''}
Tel locatie: ${locationPhone.value || ''}

MATERIALEN
----------
${rows || 'Geen materialen gekozen'}

BEDRAGEN
--------
Subtotaal materialen: ${euro(totals.materials)}
Btw 21%:              ${euro(totals.vat)}
Borg:                 ${euro(totals.deposit)}
Eindtotaal:           ${euro(totals.grand)}

BIJZONDERHEDEN
--------------
${orderExtra.value || ''}

===============================
Controleer deze bevestiging.
Daarna kun je opslaan, afdrukken of mailen.
===============================`;
}
function backToEditV92(){
  const box=document.getElementById('confirmationBox');
  if(box) box.classList.add('hidden');
  const materialPanel=document.getElementById('materialPanel');
  if(materialPanel) materialPanel.scrollIntoView({
    behavior:'smooth',block:'start'
  });
}
function clearMatAdminV92(){
  adminEditMatId=null;
  ['adminMatCat','adminMatCode','adminMatName','adminMatPrice'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.value='';
  });
  if(document.getElementById('adminMatStatus')) adminMatStatus.value='free';
  const s=document.getElementById('adminSelectedMat');
  if(s) s.textContent='Nieuw materiaal';
}
function fillMat(idv){
  const m=(state.materials||[]).find(x=>x.id===idv);
  if(!m)return;
  adminEditMatId=idv;
  adminMatCat.value=m.cat||'';
  adminMatCode.value=m.code||'';
  adminMatName.value=m.name||'';
  adminMatPrice.value=m.price||'';
  adminMatStatus.value=m.status||'free';
  const s=document.getElementById('adminSelectedMat');
  if(s) s.textContent='Gekozen: '+(m.code||'')+' '+(m.name||'');
}
function saveMatAdminV92(){
  const cat=(adminMatCat.value||'EXTRA').toUpperCase();
  const code=(adminMatCode.value||'').toUpperCase();
  if(adminEditMatId){
    const m=state.materials.find(x=>x.id===adminEditMatId);
    if(m){
      Object.assign(m,{
        cat,code,name:adminMatName.value,price:adminMatPrice.value,status:adminMatStatus.value
      });
    }
  } else {
    const existing=state.materials.find(m=>(m.cat||'').toUpperCase()===cat && (m.code||'').toUpperCase()===code);
    if(existing){
      Object.assign(existing,{
        cat,code,name:adminMatName.value,price:adminMatPrice.value,status:adminMatStatus.value
      });
      adminEditMatId=existing.id;
    } else state.materials.push({
      id:id(),cat,code,name:adminMatName.value,price:adminMatPrice.value,status:adminMatStatus.value
    });
  }
  save();
  adminRender();
  renderCats?.();
  alert('Materiaal opgeslagen');
}
function deleteMatAdminV92(){
  if(!adminEditMatId){
    alert('Kies eerst een materiaal uit de lijst.');
    return;
  }
  if(!confirm('Materiaal verwijderen?')) return;
  state.materials=state.materials.filter(m=>m.id!==adminEditMatId);
  clearMatAdminV92();
  save();
  adminRender();
  renderCats?.();
}
function fillCustomerAdminV92(idv){
  const c=(state.customers||[]).find(x=>x.id===idv);
  if(!c)return;
  adminEditCustomerId=idv;
  adminCustomerName.value=c.name||'';
  adminCustomerStreet.value=c.street||'';
  adminCustomerZip.value=c.zip||'';
  adminCustomerCity.value=c.city||'';
  adminCustomerPhone.value=c.phone||'';
  adminCustomerEmail.value=c.email||'';
  const s=document.getElementById('adminSelectedCustomer');
  if(s) s.textContent='Gekozen klant: '+(c.name||'');
}
function clearCustomerAdminV92(){
  adminEditCustomerId=null;
  ['adminCustomerName','adminCustomerStreet','adminCustomerZip','adminCustomerCity','adminCustomerPhone','adminCustomerEmail'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.value='';
  });
  const s=document.getElementById('adminSelectedCustomer');
  if(s) s.textContent='Nieuwe klant';
}
function saveCustomerAdminV92(){
  const obj={
    name:adminCustomerName.value,street:adminCustomerStreet.value,zip:adminCustomerZip.value,city:adminCustomerCity.value,phone:adminCustomerPhone.value,email:adminCustomerEmail.value
  };
  if(adminEditCustomerId){
    const c=state.customers.find(x=>x.id===adminEditCustomerId);
    if(c) Object.assign(c,obj);
  } else state.customers.push({
    id:id(),...obj
  });
  save();
  adminRender();
  alert('Klant opgeslagen');
}
function deleteCustomerAdminV92(){
  if(!adminEditCustomerId){
    alert('Kies eerst een klant.');
    return;
  }
  if(!confirm('Klant verwijderen?')) return;
  state.customers=state.customers.filter(c=>c.id!==adminEditCustomerId);
  clearCustomerAdminV92();
  save();
  adminRender();
}
function fillLocationAdminV92(idv){
  const l=(state.locations||[]).find(x=>x.id===idv);
  if(!l)return;
  adminEditLocationId=idv;
  adminLocationName.value=l.name||'';
  adminLocationStreet.value=l.street||'';
  adminLocationZip.value=l.zip||'';
  adminLocationCity.value=l.city||'';
  adminLocationContact.value=l.contact||'';
  adminLocationPhone.value=l.phone||'';
  const s=document.getElementById('adminSelectedLocation');
  if(s) s.textContent='Gekozen locatie: '+(l.name||l.street||'');
}
function clearLocationAdminV92(){
  adminEditLocationId=null;
  ['adminLocationName','adminLocationStreet','adminLocationZip','adminLocationCity','adminLocationContact','adminLocationPhone'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.value='';
  });
  const s=document.getElementById('adminSelectedLocation');
  if(s) s.textContent='Nieuwe locatie';
}
function saveLocationAdminV92(){
  const obj={
    name:adminLocationName.value,street:adminLocationStreet.value,zip:adminLocationZip.value,city:adminLocationCity.value,contact:adminLocationContact.value,phone:adminLocationPhone.value
  };
  if(adminEditLocationId){
    const l=state.locations.find(x=>x.id===adminEditLocationId);
    if(l) Object.assign(l,obj);
  } else state.locations.push({
    id:id(),...obj
  });
  save();
  adminRender();
  alert('Locatie opgeslagen');
}
function deleteLocationAdminV92(){
  if(!adminEditLocationId){
    alert('Kies eerst een locatie.');
    return;
  }
  if(!confirm('Locatie verwijderen?')) return;
  state.locations=state.locations.filter(l=>l.id!==adminEditLocationId);
  clearLocationAdminV92();
  save();
  adminRender();
}
function adminRender(){
  let q=(adminMatSearch?.value||'').toLowerCase();
  if(adminMatList) adminMatList.innerHTML=q?state.materials.filter(m=>JSON.stringify(m).toLowerCase().includes(q)).slice(0,60).map(m=>`<div class="admin-row"><span><b>${m.code}</b> ${m.name} (${m.cat})</span><span><button onclick="fillMat('${m.id}')">Wijzig</button><button class="delete" onclick="fillMat('${m.id}');deleteMatAdminV92()">Verwijder</button></span></div>`).join(''):'<small>Typ bijvoorbeeld TW, TO, KA of naam om te zoeken.</small>';
  let cq=(adminCustomerSearch?.value||'').toLowerCase();
  if(adminCustomerList) adminCustomerList.innerHTML=cq.length>1?state.customers.filter(c=>JSON.stringify(c).toLowerCase().includes(cq)).slice(0,40).map(c=>`<div class="admin-row"><span>${c.name||''}<br><small>${[c.street,c.zip,c.city].filter(Boolean).join(' ')}</small></span><span><button onclick="fillCustomerAdminV92('${c.id}')">Wijzig</button><button class="delete" onclick="fillCustomerAdminV92('${c.id}');deleteCustomerAdminV92()">Verwijder</button></span></div>`).join(''):'<small>Typ minimaal 2 letters om klanten te zoeken.</small>';
  let lq=(adminLocationSearch?.value||'').toLowerCase();
  if(adminLocationList) adminLocationList.innerHTML=lq.length>1?state.locations.filter(l=>JSON.stringify(l).toLowerCase().includes(lq)).slice(0,40).map(l=>`<div class="admin-row"><span>${l.name||l.street||''}<br><small>${[l.street,l.zip,l.city].filter(Boolean).join(' ')}</small></span><span><button onclick="fillLocationAdminV92('${l.id}')">Wijzig</button><button class="delete" onclick="fillLocationAdminV92('${l.id}');deleteLocationAdminV92()">Verwijder</button></span></div>`).join(''):'<small>Typ minimaal 2 letters om locaties te zoeken.</small>';
}
const oldRenderAllV92 = typeof renderAll === 'function' ? renderAll : null;
renderAll = function(){
  if(oldRenderAllV92) oldRenderAllV92();
  applyGlobalStyleV92();
};
setTimeout(()=>{
  bindGlobalStyleV92();
  applyGlobalStyleV92();
  const back=document.getElementById('backToEditBtn');
  if(back) back.onclick=backToEditV92;
  const sm=document.getElementById('adminSaveMat');
  if(sm) sm.onclick=saveMatAdminV92;
  const dm=document.getElementById('adminDeleteMat');
  if(dm) dm.onclick=deleteMatAdminV92;
  const nm=document.getElementById('adminNewMat');
  if(nm) nm.onclick=clearMatAdminV92;
  const sc=document.getElementById('adminSaveCustomer');
  if(sc) sc.onclick=saveCustomerAdminV92;
  const dc=document.getElementById('adminDeleteCustomer');
  if(dc) dc.onclick=deleteCustomerAdminV92;
  const nc=document.getElementById('adminNewCustomer');
  if(nc) nc.onclick=clearCustomerAdminV92;
  const sl=document.getElementById('adminSaveLocation');
  if(sl) sl.onclick=saveLocationAdminV92;
  const dl=document.getElementById('adminDeleteLocation');
  if(dl) dl.onclick=deleteLocationAdminV92;
  const nl=document.getElementById('adminNewLocation');
  if(nl) nl.onclick=clearLocationAdminV92;
  ['adminMatSearch','adminCustomerSearch','adminLocationSearch'].forEach(idv=>{
    const el=document.getElementById(idv);
    if(el) el.oninput=adminRender;
  });
  adminRender();
},0);
// ===== V9.3: date controls + system wording + stronger layouts =====
function todayISO(){
  const d=new Date();
  d.setMinutes(d.getMinutes()-d.getTimezoneOffset());
  return d.toISOString().slice(0,10);
}
function addDaysISO(dateStr, days){
  let d=dateStr ? new Date(dateStr+'T00:00:00') : new Date();
  if(isNaN(d)) d=new Date();
  d.setDate(d.getDate()+days);
  d.setMinutes(d.getMinutes()-d.getTimezoneOffset());
  return d.toISOString().slice(0,10);
}
function clampToday(idv){
  const el=document.getElementById(idv);
  if(!el) return;
  const t=todayISO();
  el.min=t;
  // BNS 802: bij wijzigen datum niet forceren
  if(!window.__bnsEditingOrder && (!el.value || el.value<t)) el.value=t;
}
function setEndThreeDays(){
  clampToday('dateStart');
  const ds=document.getElementById('dateStart');
  const de=document.getElementById('dateEnd');
  if(ds && de) de.value=addDaysISO(ds.value,3);
}
function bindDateControlsV93(){
  const ds=document.getElementById('dateStart');
  const de=document.getElementById('dateEnd');
  if(ds){
    ds.min=todayISO();
    ds.onchange=()=>{
      if(!window.__bnsEditingOrder) clampToday('dateStart');
      if(!window.__bnsEditingOrder && de && (!de.value || de.value<ds.value)) de.value=addDaysISO(ds.value,3);
      else if(window.__bnsEditingOrder && de && de.value<ds.value) de.value=ds.value;
    };
  }
  if(de){
    de.min=todayISO();
    de.onchange=()=>{ if(!window.__bnsEditingOrder) clampToday('dateEnd'); };
  }
  const sm=document.getElementById('startMinus');
  const sp=document.getElementById('startPlus');
  const em=document.getElementById('endMinus');
  const ep=document.getElementById('endPlus');
  const e3=document.getElementById('endPlus3');
  if(sm) sm.onclick=()=>{
    clampToday('dateStart');
    dateStart.value=addDaysISO(dateStart.value,-1);
    clampToday('dateStart');
    if(dateEnd.value<dateStart.value) dateEnd.value=dateStart.value;
  };
  if(sp) sp.onclick=()=>{
    clampToday('dateStart');
    dateStart.value=addDaysISO(dateStart.value,1);
    if(dateEnd.value<dateStart.value) dateEnd.value=dateStart.value;
  };
  if(em) em.onclick=()=>{
    clampToday('dateEnd');
    dateEnd.value=addDaysISO(dateEnd.value,-1);
    clampToday('dateEnd');
    if(dateEnd.value<dateStart.value) dateEnd.value=dateStart.value;
  };
  if(ep) ep.onclick=()=>{
    clampToday('dateEnd');
    dateEnd.value=addDaysISO(dateEnd.value,1);
  };
  if(e3) e3.onclick=setEndThreeDays;
}
const oldApplyGlobalStyleV93 = typeof applyGlobalStyleV92 === 'function' ? applyGlobalStyleV92 : null;
function applyGlobalStyleV93(){
  if(oldApplyGlobalStyleV93) oldApplyGlobalStyleV93();
  document.body.classList.remove('layout-planning');
  const layout=state.settings?.layout || 'normal';
  if(layout==='planning') document.body.classList.add('layout-planning');
}
const oldRenderAllV93 = typeof renderAll === 'function' ? renderAll : null;
renderAll = function(){
  if(oldRenderAllV93) oldRenderAllV93();
  applyGlobalStyleV93();
};
setTimeout(()=>{
  bindDateControlsV93();
  clampToday('dateStart');
  if(!dateEnd.value || dateEnd.value<dateStart.value) setEndThreeDays();
  const ts=document.getElementById('globalThemeSelect');
  const ls=document.getElementById('globalLayoutSelect');
  if(ls) ls.onchange=()=>{
    state.settings=state.settings||{
    };
    state.settings.layout=ls.value;
    save();
    applyGlobalStyleV93();
  };
  if(ts) ts.onchange=()=>{
    state.settings=state.settings||{
    };
    state.settings.theme=ts.value;
    save();
    applyGlobalStyleV93();
  };
  applyGlobalStyleV93();
},0);


/* =========================================================
   AMSTERDAM CLEAN v57
   Schone uitbreiding op de stabiele basis.
   - Geen polling, MutationObserver of anonieme Firebase Auth.
   - Firebase eenmalig ophalen bij openen; opslaan alleen na echte wijzigingen.
   - Gescheiden RTDB-mappen voor orders, customers, locations, users, materials en alerts.
   - Opdrachtenrubrieken: Lopend, Optie 14 dagen, Offertes.
   - Google Agenda: juiste lokale datum, materialen, geen merk/uitstraling.
   ========================================================= */
(function AMSTERDAM_CLEAN_V57(){
  'use strict';
  if(window.__AMSTERDAM_CLEAN_V57__) return;
  window.__AMSTERDAM_CLEAN_V57__=true;

  var DB='https://epp-amsterdam-verhuur-default-rtdb.europe-west1.firebasedatabase.app';
  var BASE='customers/amsterdam-verhuur';
  var applyingRemote=false;
  var uploadTimer=null;
  var originalSave=(typeof save==='function')?save:null;

  function E(id){return document.getElementById(id);}
  function T(v){return String(v==null?'':v).trim();}
  function L(v){return T(v).toLowerCase();}
  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(e){return v;}}
  function now(){return new Date().toISOString();}
  function stateObj(){try{return state;}catch(e){return window.state||{};}}
  function orderKey(o){return T(o&&(o.id||o.orderId||o.number||o.orderNumber));}
  function itemKey(o){return T(o&&(o.id||o.code||o.name||o.email||o.number));}
  function stamp(o){var n=Date.parse(o&&(o.updatedAt||o.modifiedAt||o.createdAt)||'');return isFinite(n)?n:0;}
  function mergeList(local,remote,keyFn){
    var map=new Map();
    (Array.isArray(local)?local:[]).forEach(function(x){var k=keyFn(x);if(k)map.set(k,x);});
    (Array.isArray(remote)?remote:[]).forEach(function(x){
      var k=keyFn(x);if(!k)return;
      var old=map.get(k);
      if(!old||stamp(x)>=stamp(old))map.set(k,x);
    });
    return Array.from(map.values());
  }
  function arr(v){if(Array.isArray(v))return v; if(v&&typeof v==='object')return Object.values(v); return [];}
  async function get(path){var r=await fetch(DB+'/'+path+'.json',{cache:'no-store'});if(!r.ok)throw new Error('Firebase lezen '+r.status);return r.json();}
  async function patchRoot(payload){var r=await fetch(DB+'/.json',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!r.ok)throw new Error('Firebase opslaan '+r.status);}
  function status(ok){var b=E('syncBtn');if(b)b.textContent=ok?'Firebase OK':'Firebase fout';}

  async function pullOnce(){
    try{
      var remote=await get(BASE);
      if(!remote||typeof remote!=='object'){status(true);return;}
      var s=stateObj();
      applyingRemote=true;
      var appState=(remote.appState&&remote.appState.state)||remote.state||{};
      s.orders=mergeList(s.orders,arr(remote.orders).concat(arr(appState.orders)),orderKey);
      s.customers=mergeList(s.customers,arr(remote.customers).concat(arr(appState.customers)),itemKey);
      s.locations=mergeList(s.locations,arr(remote.locations).concat(arr(appState.locations)),itemKey);
      s.users=mergeList(s.users,arr(remote.users).concat(arr(appState.users)),itemKey);
      s.materials=mergeList(s.materials,arr(remote.materials).concat(arr(appState.materials)),itemKey);
      s.alerts=mergeList(s.alerts,arr(remote.alerts).concat(arr(appState.alerts)),itemKey);
      try{if(typeof ensure==='function')ensure();}catch(e){}
      if(originalSave)originalSave();
      try{if(typeof renderAll==='function')renderAll();}catch(e){}
      status(true);
      console.info('[Amsterdam clean v57] Firebase eenmalig geladen');
    }catch(e){status(false);console.warn('[Amsterdam clean v57] Firebase laden mislukt',e);}
    finally{applyingRemote=false;}
  }

  function payload(){
    var s=clone(stateObj());
    var p={};
    p[BASE+'/appState']={version:'clean-v57',updatedAt:now(),state:s};
    p[BASE+'/state']=s;
    p[BASE+'/orders']=s.orders||[];
    p[BASE+'/customers']=s.customers||[];
    p[BASE+'/locations']=s.locations||[];
    p[BASE+'/users']=s.users||[];
    p[BASE+'/materials']=s.materials||[];
    p[BASE+'/alerts']=s.alerts||[];
    p[BASE+'/sync_info']={version:'clean-v57',updatedAt:now()};
    return p;
  }
  function scheduleUpload(){
    if(applyingRemote)return;
    clearTimeout(uploadTimer);
    uploadTimer=setTimeout(function(){patchRoot(payload()).then(function(){status(true);}).catch(function(e){status(false);console.warn('[Amsterdam clean v57] Firebase opslaan mislukt',e);});},500);
  }
  if(originalSave){
    save=function(){var r=originalSave.apply(this,arguments);scheduleUpload();return r;};
    try{window.save=save;}catch(e){}
  }

  // ----- Opdrachtenrubrieken -----
  var orderMode='running';
  function statusKind(o){
    var s=L(o&&o.status);
    if(/offerte|aanvraag/.test(s))return 'quotes';
    if(/optie/.test(s))return 'options';
    if(/geann|annul|uitgevoerd|afgerond|verwijderd|deleted/.test(s))return 'other';
    return 'running';
  }
  function installOrderTabs(){
    var page=E('orders'), list=E('ordersList');
    if(!page||!list)return;
    var bar=E('amsCleanOrderTabs');
    if(!bar){
      bar=document.createElement('div');bar.id='amsCleanOrderTabs';bar.className='tabs';
      bar.innerHTML='<button type="button" data-ams-mode="running">Lopende opdrachten</button><button type="button" data-ams-mode="options">14 dagen opties</button><button type="button" data-ams-mode="quotes">Offertes</button>';
      list.parentNode.insertBefore(bar,list);
      bar.addEventListener('click',function(ev){var b=ev.target.closest('[data-ams-mode]');if(!b)return;orderMode=b.dataset.amsMode;renderOrdersClean();});
    }
    Array.from(bar.querySelectorAll('button')).forEach(function(b){b.classList.toggle('active',b.dataset.amsMode===orderMode);});
  }
  function renderOrdersClean(){
    installOrderTabs();
    var listEl=E('ordersList');if(!listEl)return;
    var q=L((E('ordersSearch')||{}).value);
    var list=(typeof sortedOrders==='function'?sortedOrders():(stateObj().orders||[])).filter(function(o){return statusKind(o)===orderMode;}).filter(function(o){return !q||L(JSON.stringify(o)).indexOf(q)>=0;});
    listEl.innerHTML=list.length?list.map(function(o){return typeof card==='function'?card(o):'';}).join(''):'<p>'+(orderMode==='quotes'?'Geen offertes':orderMode==='options'?'Geen 14 dagen opties':'Geen lopende opdrachten')+'</p>';
    var bar=E('amsCleanOrderTabs');if(bar)Array.from(bar.querySelectorAll('button')).forEach(function(b){b.classList.toggle('active',b.dataset.amsMode===orderMode);});
  }
  window.renderOrders=renderOrdersClean;
  try{renderOrders=renderOrdersClean;}catch(e){}
  var oldShow=(typeof showPage==='function')?showPage:null;
  if(oldShow){showPage=function(p){var r=oldShow.apply(this,arguments);if(p==='orders')renderOrdersClean();return r;};try{window.showPage=showPage;}catch(e){}}

  // ----- Google Agenda -----
  function localDate(value,plus){
    var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(T(value));if(!m)return '';
    var d=new Date(Number(m[1]),Number(m[2])-1,Number(m[3]));d.setDate(d.getDate()+(plus||0));
    return String(d.getFullYear())+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');
  }
  function shortDate(value){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(T(value));if(!m)return value;return Number(m[3])+'-'+Number(m[2])+'-'+m[1].slice(2);}
  function address(){return [T((E('locationStreet')||{}).value)||T((E('customerStreet')||{}).value),T((E('locationZip')||{}).value)||T((E('customerZip')||{}).value),T((E('locationCity')||{}).value)||T((E('customerCity')||{}).value)].filter(Boolean).join(' ');}
  function materialText(){try{return (chosen||[]).map(function(m){return [T(m.code),T(m.name||m.product)].filter(Boolean).join(' ');}).filter(Boolean).join(', ');}catch(e){return '';}}
  function agenda(type){
    var start=T((E('dateStart')||{}).value), end=T((E('dateEnd')||{}).value)||start;
    var date=type==='pickup'?end:start;if(!date){alert('Kies eerst een datum.');return;}
    var title=T((E('orderTitle')||{}).value)||'Opdracht';
    var eventTitle=type==='pickup'?'TR '+title:title;
    var lines=[
      'Opdrachtnummer: '+T((E('orderNumber')||{}).value),
      'Klant: '+T((E('customerName')||{}).value),
      'Adres: '+address(),
      'Telefoon: '+T((E('customerPhone')||{}).value),
      'Materialen: '+(materialText()||'Geen materialen'),
      'Brengdatum: '+shortDate(start),
      'Ophaaldatum: '+shortDate(end)
    ];
    var url='https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(eventTitle)+'&dates='+encodeURIComponent(localDate(date,0)+'/'+localDate(date,1))+'&location='+encodeURIComponent(address())+'&details='+encodeURIComponent(lines.join('\n'))+'&ctz=Europe%2FAmsterdam';
    window.open(url,'_blank');
  }
  function installAgenda(){
    var panel=E('newOrder');if(!panel)return;
    var box=E('amsCleanAgendaTools');if(box)return;
    box=document.createElement('div');box.id='amsCleanAgendaTools';box.className='actions';
    box.innerHTML='<button type="button" id="amsAgendaOrder">Agenda opdracht maken</button><button type="button" id="amsAgendaPickup">Agenda ophalen</button>';
    var target=E('confirmationBox')||panel.querySelector('.order-head')||panel.firstChild;
    if(target&&target.parentNode)target.parentNode.insertBefore(box,target.nextSibling);else panel.appendChild(box);
    E('amsAgendaOrder').onclick=function(){agenda('order');};
    E('amsAgendaPickup').onclick=function(){agenda('pickup');};
  }

  function boot(){installOrderTabs();installAgenda();pullOnce();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0);
})();
