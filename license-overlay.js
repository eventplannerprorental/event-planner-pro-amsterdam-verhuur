/* Event Planner PRO Amsterdam - licentie overlay v35
   Laadt NA app.js en blokkeert alleen het scherm. Laadt app.js niet opnieuw en raakt beheer/materialen niet aan. */
(function(){
  'use strict';
  if(window.__EPP_AMS_LICENSE_OVERLAY_V35__) return;
  window.__EPP_AMS_LICENSE_OVERLAY_V35__ = true;

  var DATABASE_URL = 'https://epp-amsterdam-verhuur-default-rtdb.europe-west1.firebasedatabase.app';
  var LICENSE_PATH = 'customers/amsterdam-verhuur/license';
  var CUSTOMER_ID = 'amsterdam-verhuur';

  function css(){
    if(document.getElementById('eppLicenseOverlayStyle')) return;
    var s=document.createElement('style');
    s.id='eppLicenseOverlayStyle';
    s.textContent = ''+
      '#eppLicenseOverlay{position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,.96);display:flex;align-items:center;justify-content:center;padding:22px;font-family:Arial,Helvetica,sans-serif;color:#172033}'+
      '#eppLicenseOverlay .box{width:min(520px,100%);background:#fff;border-radius:24px;box-shadow:0 20px 70px rgba(0,0,0,.45);padding:28px;text-align:center}'+
      '#eppLicenseOverlay h2{margin:0 0 12px;font-size:24px;color:#0f172a}'+
      '#eppLicenseOverlay p{margin:8px 0;color:#334155;line-height:1.45}'+
      '#eppLicenseOverlay .muted{font-size:13px;color:#64748b;margin-top:16px}'+
      '#eppLicenseOverlay .bad{color:#991b1b;font-weight:900}'+
      '#eppLicenseOverlay .spin{width:34px;height:34px;border-radius:50%;border:4px solid #dbeafe;border-top-color:#2563eb;margin:0 auto 16px;animation:eppSpin .8s linear infinite}'+
      '@keyframes eppSpin{to{transform:rotate(360deg)}}';
    (document.head||document.documentElement).appendChild(s);
  }
  function overlay(title,msg,bad){
    css();
    var el=document.getElementById('eppLicenseOverlay');
    if(!el){ el=document.createElement('div'); el.id='eppLicenseOverlay'; document.body.appendChild(el); }
    el.innerHTML='<div class="box">'+(bad?'':'<div class="spin"></div>')+'<h2'+(bad?' class="bad"':'')+'>'+esc(title)+'</h2><p>'+esc(msg)+'</p><div class="muted">'+CUSTOMER_ID+' · licentiecontrole</div></div>';
  }
  function removeOverlay(){ var el=document.getElementById('eppLicenseOverlay'); if(el) el.remove(); }
  function esc(v){ return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function dateOnly(d){ var x=new Date(d.getFullYear(),d.getMonth(),d.getDate()); return x; }
  function parseDate(v){
    v=String(v||'').trim(); if(!v) return null;
    var m=v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/); if(m) return new Date(+m[1],+m[2]-1,+m[3]);
    m=v.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/); if(m) return new Date(+m[3],+m[2]-1,+m[1]);
    var d=new Date(v); return isNaN(d)?null:d;
  }
  function valid(lic){
    if(!lic || typeof lic!=='object') return {ok:false,msg:'Licentie niet gevonden.'};
    if(lic.active===false) return {ok:false,msg:'Licentie is niet actief.'};
    if(lic.blocked===true) return {ok:false,msg:'Licentie is geblokkeerd.'};
    if(String(lic.status||'').toLowerCase()==='blocked') return {ok:false,msg:'Licentie is geblokkeerd.'};
    if(lic.paid===false) return {ok:false,msg:'Licentie staat niet op betaald.'};
    var until=parseDate(lic.validUntil || lic.paidUntil || '');
    if(until && dateOnly(until) < dateOnly(new Date())) return {ok:false,msg:'Licentie is verlopen op '+String(lic.validUntil||lic.paidUntil)+'.'};
    return {ok:true,msg:'ok'};
  }
  function url(){ return DATABASE_URL.replace(/\/$/,'') + '/' + LICENSE_PATH.split('/').map(encodeURIComponent).join('/') + '.json?cb=' + Date.now(); }
  function run(){
    if(location.protocol==='file:'){ removeOverlay(); return; }
    overlay('Licentie controleren','Een ogenblik geduld. De app wordt vrijgegeven zodra de licentie geldig is.',false);
    fetch(url(), {cache:'no-store'}).then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
      .then(function(lic){ var v=valid(lic); if(v.ok) removeOverlay(); else overlay('Licentie geblokkeerd', v.msg + ' Neem contact op met de beheerder.', true); })
      .catch(function(){ overlay('Licentiecontrole mislukt','De licentie kon niet gecontroleerd worden. Controleer internet/Firebase of neem contact op met de beheerder.', true); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
})();
