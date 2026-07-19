/* Event Planner PRO Amsterdam - licentiecontrole v37
   De app start direct. De licentie wordt onzichtbaar maximaal eenmaal per 24 uur
   gecontroleerd, ook wanneer de app onafgebroken open blijft.
   Alleen een expliciet ongeldige licentie blokkeert de app met de bestaande tekst. */
(function(){
  'use strict';
  if(window.__EPP_AMS_LICENSE_OVERLAY_V37__) return;
  window.__EPP_AMS_LICENSE_OVERLAY_V37__ = true;

  var DATABASE_URL = 'https://epp-amsterdam-verhuur-default-rtdb.europe-west1.firebasedatabase.app';
  var LICENSE_PATH = 'customers/amsterdam-verhuur/license';
  var CUSTOMER_ID = 'amsterdam-verhuur';
  var DAY_MS = 24 * 60 * 60 * 1000;
  var FETCH_TIMEOUT_MS = 5000;
  var LAST_CHECK_KEY = 'epp-license-last-check-v37';
  var timer = null;
  var checking = false;

  function css(){
    if(document.getElementById('eppLicenseOverlayStyle')) return;
    var s=document.createElement('style');
    s.id='eppLicenseOverlayStyle';
    s.textContent = ''+
      '#eppLicenseOverlay{position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,.96);display:flex;align-items:center;justify-content:center;padding:22px;font-family:Arial,Helvetica,sans-serif;color:#172033}'+
      '#eppLicenseOverlay .box{width:min(520px,100%);background:#fff;border-radius:24px;box-shadow:0 20px 70px rgba(0,0,0,.45);padding:28px;text-align:center}'+
      '#eppLicenseOverlay h2{margin:0 0 12px;font-size:24px;color:#991b1b}'+
      '#eppLicenseOverlay p{margin:8px 0;color:#334155;line-height:1.45}'+
      '#eppLicenseOverlay .muted{font-size:13px;color:#64748b;margin-top:16px}';
    (document.head||document.documentElement).appendChild(s);
  }

  function showBlocked(title,msg){
    css();
    var el=document.getElementById('eppLicenseOverlay');
    if(!el){
      el=document.createElement('div');
      el.id='eppLicenseOverlay';
      document.body.appendChild(el);
    }
    el.innerHTML='<div class="box"><h2>'+esc(title)+'</h2><p>'+esc(msg)+'</p><div class="muted">'+CUSTOMER_ID+' · licentiecontrole</div></div>';
  }

  function removeOverlay(){
    var el=document.getElementById('eppLicenseOverlay');
    if(el) el.remove();
  }

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function dateOnly(d){ return new Date(d.getFullYear(),d.getMonth(),d.getDate()); }

  function parseDate(v){
    v=String(v||'').trim();
    if(!v) return null;
    var m=v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if(m) return new Date(+m[1],+m[2]-1,+m[3]);
    m=v.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if(m) return new Date(+m[3],+m[2]-1,+m[1]);
    var d=new Date(v);
    return isNaN(d)?null:d;
  }

  function validate(lic){
    if(!lic || typeof lic!=='object') return {ok:false,msg:'Licentie niet gevonden.'};
    if(lic.active===false) return {ok:false,msg:'Licentie is niet actief.'};
    if(lic.blocked===true) return {ok:false,msg:'Licentie is geblokkeerd.'};
    var status=String(lic.status||'').toLowerCase();
    if(status==='blocked') return {ok:false,msg:'Licentie is geblokkeerd.'};
    if(status==='expired') return {ok:false,msg:'Licentie is verlopen.'};
    if(lic.paid===false) return {ok:false,msg:'Licentie staat niet op betaald.'};
    var until=parseDate(lic.validUntil || lic.paidUntil || '');
    if(until && dateOnly(until) < dateOnly(new Date())){
      return {ok:false,msg:'Licentie is verlopen op '+String(lic.validUntil||lic.paidUntil)+'.'};
    }
    return {ok:true,msg:'ok'};
  }

  function url(){
    return DATABASE_URL.replace(/\/$/,'') + '/' + LICENSE_PATH.split('/').map(encodeURIComponent).join('/') + '.json';
  }

  function getLastCheck(){
    try{
      var n=Number(localStorage.getItem(LAST_CHECK_KEY)||0);
      return isFinite(n) && n>0 ? n : 0;
    }catch(e){ return 0; }
  }

  function setLastCheck(ts){
    try{ localStorage.setItem(LAST_CHECK_KEY,String(ts)); }catch(e){}
  }

  function scheduleNext(){
    if(timer) clearTimeout(timer);
    var last=getLastCheck();
    var delay=last ? Math.max(1000, DAY_MS-(Date.now()-last)) : 1000;
    timer=setTimeout(function(){
      timer=null;
      checkLicense(true);
    },delay);
  }

  function checkLicense(force){
    if(location.protocol==='file:' || checking) return;
    var last=getLastCheck();
    if(!force && last && Date.now()-last < DAY_MS){
      scheduleNext();
      return;
    }

    checking=true;
    /* De dagelijkse poging telt direct, zodat er nooit meerdere zichtbare of
       onzichtbare controles binnen dezelfde 24 uur worden uitgevoerd. */
    setLastCheck(Date.now());

    var controller=typeof AbortController==='function' ? new AbortController() : null;
    var timeout=setTimeout(function(){ if(controller) controller.abort(); },FETCH_TIMEOUT_MS);
    var options={cache:'no-cache'};
    if(controller) options.signal=controller.signal;

    fetch(url(),options)
      .then(function(r){
        if(!r.ok) throw new Error('HTTP '+r.status);
        return r.json();
      })
      .then(function(lic){
        var result=validate(lic);
        if(result.ok){
          removeOverlay();
        }else{
          showBlocked('Licentie geblokkeerd',result.msg+' Neem contact op met de beheerder.');
        }
      })
      .catch(function(err){
        /* Bij een tijdelijke verbindingsfout blijft de app bruikbaar.
           De volgende automatische poging is 24 uur later. */
        try{ console.warn('[Licentie v37] Dagelijkse controle tijdelijk mislukt:',err&&err.message?err.message:err); }catch(e){}
      })
      .finally(function(){
        clearTimeout(timeout);
        checking=false;
        scheduleNext();
      });
  }

  function start(){
    /* Geen opstartmelding of controle-overlay: de app is direct bruikbaar. */
    removeOverlay();
    if(getLastCheck() && Date.now()-getLastCheck() < DAY_MS){
      scheduleNext();
      return;
    }
    if('requestIdleCallback' in window){
      window.requestIdleCallback(function(){ checkLicense(false); },{timeout:1500});
    }else{
      setTimeout(function(){ checkLicense(false); },300);
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
