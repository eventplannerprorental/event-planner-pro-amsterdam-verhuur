/* Event Planner PRO - licentie bewaking v16
   Belangrijk: app.js wordt PAS geladen nadat de licentie geldig is. */
(function(){
  'use strict';
  var cfg = window.EVENT_PLANNER_CUSTOMER || window.EPP_CUSTOMER_CONFIG || {};
  var fb = cfg.firebaseConfig || window.BNS_FIREBASE_CONFIG || null;
  var customerId = cfg.customerId || window.EPP_CUSTOMER_ID || 'amsterdam-verhuur';
  var VERSION = '10.12.5';
  var overlay;
  var loaded = false;

  window.EPP_LICENSE_CHECK_DONE = false;
  window.EPP_LICENSE_BLOCKED = true;

  function today(){ return new Date().toISOString().slice(0,10); }
  function esc(s){ return String(s || '').replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]; }); }
  function ensureOverlay(title, msg, mode){
    if(!overlay){
      overlay = document.createElement('div');
      overlay.id = 'eppLicenseBlock';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#0f172a;color:white;display:flex;align-items:center;justify-content:center;text-align:center;font-family:Arial,sans-serif;padding:24px;';
      document.documentElement.appendChild(overlay);
    }
    var bg = mode === 'checking' ? '#1e293b' : '#111827';
    overlay.innerHTML = '<div style="max-width:620px;background:'+bg+';border:1px solid #334155;border-radius:22px;padding:30px;box-shadow:0 20px 80px rgba(0,0,0,.55)">'+
      '<div style="font-size:42px;margin-bottom:10px">'+(mode === 'checking' ? '⏳' : '🔒')+'</div>'+ 
      '<h1 style="margin:0 0 12px;font-size:28px">'+esc(title)+'</h1>'+ 
      '<p style="font-size:18px;line-height:1.5;margin:0">'+esc(msg)+'</p>'+ 
      '<p style="opacity:.7;margin-top:18px;font-size:13px">Event Planner PRO · '+esc(customerId)+'</p>'+ 
      '</div>';
  }
  function hardBlock(msg){
    window.EPP_LICENSE_BLOCKED = true;
    window.EPP_LICENSE_CHECK_DONE = true;
    ensureOverlay('Licentie niet actief', msg || 'Deze klantomgeving is tijdelijk geblokkeerd. Neem contact op met Tapwagen.nl.', 'blocked');
  }
  function removeOverlay(){
    if(overlay){ try{ overlay.remove(); }catch(e){} overlay = null; }
  }
  function warn(msg){
    var div = document.createElement('div');
    div.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483646;background:#f59e0b;color:#111827;border-radius:14px;padding:12px 16px;font:700 14px Arial,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.25);text-align:center';
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(function(){ try{div.remove();}catch(e){} }, 10000);
  }
  function loadScript(src){
    return new Promise(function(resolve,reject){
      var s=document.createElement('script');
      s.src=src;
      s.onload=function(){ resolve(); };
      s.onerror=function(){ reject(new Error('Kan script niet laden: '+src)); };
      document.body.appendChild(s);
    });
  }
  async function startApp(){
    if(loaded) return;
    loaded = true;
    window.EPP_LICENSE_BLOCKED = false;
    window.EPP_LICENSE_CHECK_DONE = true;
    removeOverlay();
    await loadScript('bns-preloader.js?v=16');
    await loadScript('app.js?v=16_license_first');
    await loadScript('app-patches.js?v=16');
  }
  async function run(){
    ensureOverlay('Licentie controleren', 'Een moment geduld. De klantomgeving wordt gecontroleerd voordat de planner start.', 'checking');
    if(!fb || !fb.apiKey){
      hardBlock('Firebase-config ontbreekt of is ongeldig. Controleer customer-config.js.');
      return;
    }
    try{
      var appMod = await import('https://www.gstatic.com/firebasejs/'+VERSION+'/firebase-app.js');
      var authMod = await import('https://www.gstatic.com/firebasejs/'+VERSION+'/firebase-auth.js');
      var dbMod = await import('https://www.gstatic.com/firebasejs/'+VERSION+'/firebase-database.js');
      var appName = 'epp-license-'+customerId;
      var existing = appMod.getApps().find(function(a){return a.name===appName;});
      var app = existing || appMod.initializeApp(fb, appName);
      var auth = authMod.getAuth(app);
      if(!auth.currentUser){ await authMod.signInAnonymously(auth); }
      var db = dbMod.getDatabase(app);
      var snap = await dbMod.get(dbMod.ref(db, customerId + '/license'));
      if(!snap.exists()){
        hardBlock('Licentiegegevens ontbreken. Neem contact op met Tapwagen.nl.');
        return;
      }
      var lic = snap.val() || {};
      var until = String(lic.validUntil || lic.paidUntil || '').slice(0,10);
      var status = String(lic.status||'').toLowerCase();
      var blocked = lic.blocked === true || lic.active === false || status === 'blocked' || status === 'inactive';
      if(blocked){
        hardBlock(lic.contactText || 'Deze klantomgeving is geblokkeerd. Neem contact op.');
        return;
      }
      if(until && until < today()){
        hardBlock(lic.expiredText || lic.contactText || ('De licentie is verlopen op '+until+'. Neem contact op.'));
        return;
      }
      await startApp();
      var wd = Number(lic.warningDays || 0);
      if(until && wd>0){
        var ms = new Date(until+'T00:00:00').getTime() - new Date(today()+'T00:00:00').getTime();
        var days = Math.ceil(ms/86400000);
        if(days>=0 && days<=wd) warn(lic.warningText || ('Let op: licentie verloopt over '+days+' dag(en).'));
      }
    }catch(e){
      console.warn('Licentiecontrole fout', e);
      hardBlock('Licentiecontrole kon niet worden uitgevoerd. Controleer internet/Firebase en neem contact op.');
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
