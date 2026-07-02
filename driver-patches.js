// ===== EPP Amsterdam v31 Driver/Bezorger app =====
// Doel: /driver/ is aparte bezorger-login.
// 1e keer kiest bezorger zijn naam + PIN. Daarna blijft deze browser vast op die naam.
// Bezorger ziet alleen eigen opdrachten en kan niet naar planning/admin.
(function(){
  if(!window.EPP_DRIVER_MODE || window.__EPP_DRIVER_APP_V31__) return;
  window.__EPP_DRIVER_APP_V31__ = true;
  var CUSTOMER_ID = (window.EPP_CUSTOMER_CONFIG && window.EPP_CUSTOMER_CONFIG.customerId) || 'amsterdam-verhuur';
  var LOCK_KEY = 'epp-driver-lock-' + CUSTOMER_ID;

  function $(id){ return document.getElementById(id); }
  function norm(v){ return String(v == null ? '' : v).trim(); }
  function lower(v){ return norm(v).toLowerCase(); }
  function getUsers(){
    try { return (Array.isArray(state.users) ? state.users : []); } catch(e) { return []; }
  }
  function isDriver(u){ return lower(u && u.role) === 'bezorger' || lower(u && u.role) === 'chauffeur' || lower(u && u.role) === 'driver'; }
  function drivers(){ return getUsers().filter(isDriver); }
  function readLock(){ try { return JSON.parse(localStorage.getItem(LOCK_KEY) || 'null'); } catch(e) { return null; } }
  function writeLock(u){ try { localStorage.setItem(LOCK_KEY, JSON.stringify({name:u.name || '', pin:u.pin || '', id:u.id || '', lockedAt:new Date().toISOString()})); } catch(e){} }
  function escapeHtml(s){ return String(s == null ? '' : s).replace(/[&<>'"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]; }); }
  function currentPin(){ try { return norm(pin); } catch(e) { return ''; } }
  function clearPin(){ try { pin = ''; } catch(e){} var pv=$('pinView'); if(pv) pv.textContent='- - - -'; }
  function setToast(t){ try { if(typeof toastMsg === 'function') toastMsg(t); else alert(t); } catch(e){ alert(t); } }
  function selectedName(){ var sel=$('eppDriverNameOnce'); return sel ? norm(sel.value) : ''; }
  function findLockedUser(){
    var l = readLock();
    if(!l) return null;
    return drivers().find(function(u){ return (l.id && String(u.id) === String(l.id)) || (norm(u.name) === norm(l.name) && norm(u.pin) === norm(l.pin)); }) || null;
  }
  function findSelectedUser(){
    var name = selectedName();
    if(!name) return null;
    return drivers().find(function(u){ return norm(u.name) === name; }) || null;
  }
  function driverName(){
    var l=readLock();
    if(l && l.name) return norm(l.name);
    var u=findSelectedUser();
    return u ? norm(u.name) : '';
  }
  function orderDriverName(o){ return norm(o && (o.driverName || o.driver || o.bezorger || o.orderDriver)); }
  function activeOrder(o){
    var s=lower(o && o.status);
    if(!o) return false;
    if(o.deleted || o.deletedAt) return false;
    if(/geannuleerd|verwijderd|deleted|gewist|trash/.test(s)) return false;
    if(/uitgevoerd|afgerond|klaar|done/.test(s)) return false;
    return true;
  }
  function niceDate(v){ try { if(typeof nice === 'function') return nice(v); } catch(e){} return norm(v); }

  function installLoginChoice(){
    var card = document.querySelector('#login .login-card');
    if(!card) return;
    document.title = 'Event Planner PRO Driver';
    var title = card.querySelector('h1'); if(title) title.textContent='BEZORGER APP';
    var p = card.querySelector('p'); if(p) p.textContent='Amsterdam verhuur';
    var small = card.querySelector('small'); if(small) small.textContent='Voer je eigen PIN in';

    var box = $('eppDriverLockBox');
    if(!box){
      box = document.createElement('div');
      box.id = 'eppDriverLockBox';
      box.style.margin = '12px 0';
      box.innerHTML = '<label style="display:block;font-weight:800;margin-bottom:6px">Bezorger</label><select id="eppDriverNameOnce" style="width:100%;padding:11px;border-radius:12px;border:1px solid #cbd5e1"></select><div id="eppDriverLockInfo" style="font-size:12px;opacity:.85;margin-top:6px"></div>';
      var pinView = $('pinView');
      card.insertBefore(box, pinView || card.firstChild);
    }
    refreshDriverSelect();
  }

  function refreshDriverSelect(){
    var box=$('eppDriverLockBox'), sel=$('eppDriverNameOnce'), info=$('eppDriverLockInfo');
    if(!box || !sel) return;
    var l=readLock();
    var ds=drivers();
    if(l && l.name){
      sel.innerHTML = '<option value="'+escapeHtml(l.name)+'">'+escapeHtml(l.name)+'</option>';
      sel.disabled = true;
      if(info) info.innerHTML = 'Deze telefoon/browser is vast gekoppeld aan <b>'+escapeHtml(l.name)+'</b>. Andere bezorgers zijn hier niet meer kiesbaar.';
    } else {
      sel.disabled = false;
      sel.innerHTML = '<option value="">Kies je naam eenmalig</option>' + ds.map(function(u){ return '<option value="'+escapeHtml(u.name)+'">'+escapeHtml(u.name)+'</option>'; }).join('');
      if(info) info.textContent = ds.length ? 'Kies je naam eenmalig. Daarna is deze telefoon/browser vast gekoppeld.' : 'Nog geen bezorgers gevonden. Maak eerst personeel aan in Admin > Personeel.';
    }
  }

  function driverLogin(){
    var p = currentPin();
    if(p.length !== 4){ setToast('Voer je 4-cijferige PIN in'); return; }
    var u = findLockedUser();
    if(u){
      if(norm(u.pin) !== p){ setToast('Verkeerde PIN voor ' + norm(u.name)); clearPin(); return; }
    } else {
      u = findSelectedUser();
      if(!u){ setToast('Kies eerst je naam'); clearPin(); return; }
      if(norm(u.pin) !== p){ setToast('Verkeerde PIN'); clearPin(); return; }
      writeLock(u);
    }
    try { user = u; } catch(e){}
    openDriverApp(u);
  }

  function openDriverApp(u){
    var login=$('login'), app=$('app');
    if(login) login.classList.add('hidden');
    if(app) app.classList.remove('hidden');
    document.querySelectorAll('.page').forEach(function(x){ x.classList.remove('active'); });
    var driver=$('driver'); if(driver) driver.classList.add('active');
    document.querySelectorAll('.nav').forEach(function(b){
      var isDriverBtn = b.getAttribute('data-page') === 'driver';
      b.style.display = isDriverBtn ? '' : 'none';
      b.classList.toggle('active', isDriverBtn);
    });
    document.querySelectorAll('.admin-only').forEach(function(x){ x.style.display='none'; });
    var header=document.querySelector('.top'); if(header) header.style.display='none';
    var side=document.querySelector('.side');
    if(side){
      side.querySelectorAll('button.nav').forEach(function(b){ if(b.getAttribute('data-page') !== 'driver') b.style.display='none'; });
      var h=side.querySelector('h1'); if(h) h.innerHTML='BEZORGER<br>APP';
      var p=side.querySelector('p'); if(p) p.textContent=norm(u.name);
    }
    try { driverRender(); } catch(e) { console.warn('[driver v31] render fout', e); }
  }

  function driverRender(){
    var box=$('driverList'); if(!box) return;
    var name=driverName();
    var rows=[];
    try { rows = (typeof sortedOrders === 'function' ? sortedOrders() : (state.orders || [])); } catch(e){ rows=[]; }
    rows = rows.filter(activeOrder).filter(function(o){ return lower(orderDriverName(o)) === lower(name); });
    var arch=$('driverArchive'); if(arch) arch.innerHTML='';
    box.innerHTML = '<div class="order-card" style="border-left:6px solid #2563eb"><div><b>Ingelogd als bezorger:</b><br>'+escapeHtml(name || '-')+'</div></div>' +
      (rows.length ? rows.map(function(o){
        var mat = ((o.materials || []).map(function(m){ return m.code || m.name || ''; }).filter(Boolean).join(', '));
        var loc = [o.locationName, o.locationStreet, o.locationCity].filter(Boolean).join(' - ');
        return '<div class="order-card" data-bns-order-id="'+escapeHtml(o.id)+'"><div class="date-tile">'+escapeHtml(niceDate(o.start))+'</div><div><b>'+escapeHtml(o.number || '')+' - '+escapeHtml(o.title || '')+'</b><br><b>Klant:</b> '+escapeHtml(o.customerName || '-')+'<br><b>Locatie:</b> '+escapeHtml(loc || '-')+'<br><b>Materiaal:</b> '+escapeHtml(mat || '-')+'</div><div class="actions"><button type="button" onclick="alertFor(\''+escapeHtml(o.id)+'\',\'Storing\')">Storing</button><button type="button" onclick="alertFor(\''+escapeHtml(o.id)+'\',\'Schade\')">Schade</button><button type="button" onclick="alertFor(\''+escapeHtml(o.id)+'\',\'Vermissing\')">Vermissing</button></div></div>';
      }).join('') : '<p>Geen actieve opdrachten voor deze bezorger.</p>');
  }

  function hookPinButtons(){
    document.querySelectorAll('[data-pin]').forEach(function(b){
      b.onclick=function(){
        try { if(pin.length < 4) pin += b.dataset.pin; } catch(e){}
        var pv=$('pinView'); if(pv){ try{ pv.textContent=(pin.split('').map(function(){return '•';}).join(' ')+' - - - -').split(' ').slice(0,4).join(' '); }catch(e){} }
        if(currentPin().length === 4) driverLogin();
      };
    });
    var ok=$('pinOk'); if(ok) ok.onclick=driverLogin;
    var clear=$('pinClear'); if(clear) clear.onclick=clearPin;
    var lo=$('logout'); if(lo) lo.onclick=function(){ clearPin(); location.reload(); };
  }

  function blockNormalNavigation(){
    try { showPage = function(p){ if(p !== 'driver') { setToast('Bezorger-app: alleen eigen opdrachten'); p='driver'; } document.querySelectorAll('.page').forEach(function(x){x.classList.remove('active');}); var d=$('driver'); if(d)d.classList.add('active'); driverRender(); }; } catch(e){}
    try { renderDriver = driverRender; window.renderDriver = driverRender; } catch(e){}
  }

  function boot(){ installLoginChoice(); hookPinButtons(); blockNormalNavigation(); refreshDriverSelect(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot,50); setTimeout(boot,800); setTimeout(boot,2000); });
  else { setTimeout(boot,50); setTimeout(boot,800); setTimeout(boot,2000); }
  setInterval(function(){ try{ refreshDriverSelect(); if($('app') && !$('app').classList.contains('hidden')) driverRender(); }catch(e){} }, 2500);
})();
