
(function(){
  'use strict';
  var cfg = window.EPP_CUSTOMER_CONFIG || {};
  var fb = cfg.firebaseConfig || {};
  var customerId = cfg.customerId || 'amsterdam-verhuur';
  var db = (fb.databaseURL || '').replace(/\/$/, '');
  function ymd(d){ var x=new Date(d); x.setMinutes(x.getMinutes()-x.getTimezoneOffset()); return x.toISOString().slice(0,10); }
  function today(){ return ymd(new Date()); }
  function daysLeft(until){ if(!until || !/^\d{4}-\d{2}-\d{2}$/.test(String(until))) return null; var a=new Date(today()+'T00:00:00'); var b=new Date(until+'T00:00:00'); return Math.ceil((b-a)/86400000); }
  function showBlock(msg){
    if(document.getElementById('eppLicenseBlocker')) return;
    var d=document.createElement('div');
    d.id='eppLicenseBlocker';
    d.style.cssText='position:fixed;inset:0;z-index:999999;background:rgba(15,23,42,.96);color:white;display:flex;align-items:center;justify-content:center;padding:24px;font-family:Arial,sans-serif;text-align:center';
    d.innerHTML='<div style="max-width:560px;background:#111827;border:1px solid #334155;border-radius:24px;padding:28px;box-shadow:0 30px 80px rgba(0,0,0,.45)"><h1 style="margin:0 0 12px;font-size:30px">Licentie niet actief</h1><p style="font-size:18px;line-height:1.45">'+String(msg||'Uw licentie is verlopen. Neem contact op.').replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})+'</p><p style="opacity:.75;margin-top:18px">Amsterdam verhuur</p></div>';
    document.body.appendChild(d);
  }
  function showWarn(msg){
    if(sessionStorage.getItem('eppLicWarnShown')==='1') return;
    sessionStorage.setItem('eppLicWarnShown','1');
    setTimeout(function(){ alert(msg); }, 700);
  }
  async function getJson(path){
    if(!db) return null;
    try{ var r=await fetch(db+'/'+path+'.json?cacheBust=' + Date.now()); if(!r.ok) return null; return await r.json(); }catch(e){ return null; }
  }
  async function checkLicense(){
    var lic = await getJson('customers/'+customerId+'/license');
    if(!lic) lic = await getJson(customerId+'/license');
    if(!lic) return;
    var until = lic.validUntil || lic.endDate || lic.paidUntil || '';
    var left = daysLeft(until);
    var text = lic.contactText || 'Neem contact op.';
    if(lic.blocked === true || lic.active === false || /blocked|geblokkeerd|expired|verlopen/i.test(String(lic.status||'')) || (left !== null && left < 0)){
      showBlock(lic.expiredText || lic.blockedText || 'Uw licentie is verlopen. Neem contact op.');
      return;
    }
    var warn = Number(lic.warningDays == null ? 5 : lic.warningDays);
    if(left !== null && left >= 0 && left <= warn){
      showWarn((text || 'Uw licentie verloopt binnenkort. Neem contact op.') + '\n\nGeldig tot: ' + until + '\nNog ' + left + ' dag(en).');
    }
  }
  window.EPP_LICENSE_GUARD = { checkLicense: checkLicense };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', checkLicense); else checkLicense();
  setInterval(checkLicense, 60000);
})();
