/* Event Planner PRO - licentie bewaking v14 */
(function(){
  'use strict';
  var cfg = window.EVENT_PLANNER_CUSTOMER || window.EPP_CUSTOMER_CONFIG || {};
  var fb = cfg.firebaseConfig || window.BNS_FIREBASE_CONFIG || null;
  var customerId = cfg.customerId || window.EPP_CUSTOMER_ID || 'amsterdam-verhuur';
  var VERSION = '10.12.5';
  function today(){ return new Date().toISOString().slice(0,10); }
  function block(msg){
    window.EPP_LICENSE_BLOCKED = true;
    var div = document.createElement('div');
    div.id = 'eppLicenseBlock';
    div.style.cssText = 'position:fixed;inset:0;z-index:999999;background:#0f172a;color:white;display:flex;align-items:center;justify-content:center;text-align:center;font-family:Arial,sans-serif;padding:24px;';
    div.innerHTML = '<div style="max-width:560px;background:#111827;border:1px solid #334155;border-radius:22px;padding:28px;box-shadow:0 20px 80px rgba(0,0,0,.45)"><h1 style="margin:0 0 12px;font-size:28px">Licentie niet actief</h1><p style="font-size:18px;line-height:1.5">'+String(msg||'Deze klantomgeving is tijdelijk geblokkeerd. Neem contact op met Tapwagen.nl.')+'</p></div>';
    document.body.appendChild(div);
  }
  function warn(msg){
    var div = document.createElement('div');
    div.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:999998;background:#f59e0b;color:#111827;border-radius:14px;padding:12px 16px;font:700 14px Arial,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.25);text-align:center';
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(function(){ try{div.remove();}catch(e){} }, 10000);
  }
  async function run(){
    if(!fb || !fb.apiKey) return;
    try{
      var appMod = await import('https://www.gstatic.com/firebasejs/'+VERSION+'/firebase-app.js');
      var authMod = await import('https://www.gstatic.com/firebasejs/'+VERSION+'/firebase-auth.js');
      var dbMod = await import('https://www.gstatic.com/firebasejs/'+VERSION+'/firebase-database.js');
      var appName = 'epp-license-'+customerId;
      var existing = appMod.getApps().find(function(a){return a.name===appName;});
      var app = existing || appMod.initializeApp(fb, appName);
      var auth = authMod.getAuth(app);
      try{ if(!auth.currentUser) await authMod.signInAnonymously(auth); }catch(e){}
      var db = dbMod.getDatabase(app);
      var snap = await dbMod.get(dbMod.ref(db, customerId + '/license'));
      if(!snap.exists()) return;
      var lic = snap.val() || {};
      var until = String(lic.validUntil || lic.paidUntil || '').slice(0,10);
      var blocked = lic.blocked === true || lic.active === false || String(lic.status||'').toLowerCase()==='blocked';
      if(blocked){ block(lic.contactText || 'Deze klantomgeving is geblokkeerd. Neem contact op.'); return; }
      if(until && until < today()){ block(lic.expiredText || lic.contactText || ('De licentie is verlopen op '+until+'. Neem contact op.')); return; }
      var wd = Number(lic.warningDays || 0);
      if(until && wd>0){
        var ms = new Date(until+'T00:00:00').getTime() - new Date(today()+'T00:00:00').getTime();
        var days = Math.ceil(ms/86400000);
        if(days>=0 && days<=wd) warn(lic.warningText || ('Let op: licentie verloopt over '+days+' dag(en).'));
      }
    }catch(e){ console.warn('Licentiecontrole fout', e); }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
