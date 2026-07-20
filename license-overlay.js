/* Event Planner PRO Amsterdam - licentiecontrole v40
   - App start direct zonder zichtbare controle.
   - Geldige licentie wordt maximaal eenmaal per 24 uur gecontroleerd.
   - Een online blokkade wordt lokaal onthouden en blijft ook offline actief.
   - Bij een tijdelijke netwerkfout volgt onzichtbaar na 1 uur een nieuwe poging.
   - Zodra een geldige online controle slaagt, wordt een lokale blokkade opgeheven. */
(function(){
  'use strict';
  if(window.__EPP_AMS_LICENSE_OVERLAY_V40__) return;
  window.__EPP_AMS_LICENSE_OVERLAY_V40__ = true;

  var DATABASE_URL = 'https://epp-amsterdam-verhuur-default-rtdb.europe-west1.firebasedatabase.app';
  var LICENSE_PATH = 'customers/amsterdam-verhuur/license';
  var CUSTOMER_ID = 'amsterdam-verhuur';
  var DAY_MS = 24 * 60 * 60 * 1000;
  var RETRY_MS = 60 * 60 * 1000;
  var FETCH_TIMEOUT_MS = 5000;
  var STATE_KEY = 'epp-license-state-v40';
  var OLD_LAST_CHECK_KEY = 'epp-license-last-check-v37';
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
      (document.body||document.documentElement).appendChild(el);
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

  function getState(){
    try{
      var raw=localStorage.getItem(STATE_KEY);
      if(raw){
        var parsed=JSON.parse(raw);
        if(parsed && typeof parsed==='object') return parsed;
      }
      var old=Number(localStorage.getItem(OLD_LAST_CHECK_KEY)||0);
      if(isFinite(old) && old>0) return {status:'valid',checkedAt:old,message:''};
    }catch(e){}
    return {status:'unknown',checkedAt:0,message:''};
  }

  function setState(status,message,checkedAt){
    var state={
      status:status,
      message:String(message||''),
      checkedAt:Number(checkedAt||Date.now())
    };
    try{
      localStorage.setItem(STATE_KEY,JSON.stringify(state));
      localStorage.removeItem(OLD_LAST_CHECK_KEY);
    }catch(e){}
    return state;
  }

  function applyStoredBlock(){
    var state=getState();
    if(state.status==='blocked'){
      showBlocked('Licentie geblokkeerd',(state.message||'Licentie is geblokkeerd.')+' Neem contact op met de beheerder.');
      return true;
    }
    return false;
  }

  function schedule(delay){
    if(timer) clearTimeout(timer);
    timer=setTimeout(function(){
      timer=null;
      checkLicense(true);
    },Math.max(1000,Number(delay)||1000));
  }

  function scheduleFromState(){
    var state=getState();
    var age=Date.now()-Number(state.checkedAt||0);
    if(state.status==='blocked'){
      schedule(RETRY_MS);
    }else if(state.checkedAt && age < DAY_MS){
      schedule(DAY_MS-age);
    }else{
      schedule(1000);
    }
  }

  function checkLicense(force){
    if(location.protocol==='file:' || checking) return;
    var state=getState();
    if(!force && state.status!=='blocked' && state.checkedAt && Date.now()-state.checkedAt < DAY_MS){
      scheduleFromState();
      return;
    }

    checking=true;
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
          setState('valid','',Date.now());
          removeOverlay();
          schedule(DAY_MS);
        }else{
          setState('blocked',result.msg,Date.now());
          showBlocked('Licentie geblokkeerd',result.msg+' Neem contact op met de beheerder.');
          schedule(RETRY_MS);
        }
      })
      .catch(function(err){
        try{ console.warn('[Licentie v40] Controle tijdelijk mislukt:',err&&err.message?err.message:err); }catch(e){}
        /* De laatst bekende status blijft leidend. Een bestaande blokkade blijft
           dus zichtbaar; zonder blokkade blijft de app bruikbaar. */
        if(getState().status==='blocked') applyStoredBlock();
        schedule(RETRY_MS);
      })
      .finally(function(){
        clearTimeout(timeout);
        checking=false;
      });
  }

  function start(){
    var blocked=applyStoredBlock();
    var state=getState();

    /* Een lokaal geblokkeerde installatie controleert bij iedere online start
       opnieuw, zodat een door de beheerder opgeheven blokkade snel verdwijnt. */
    if(blocked){
      setTimeout(function(){ checkLicense(true); },300);
      return;
    }

    if(state.checkedAt && Date.now()-state.checkedAt < DAY_MS){
      removeOverlay();
      scheduleFromState();
      return;
    }

    removeOverlay();
    if('requestIdleCallback' in window){
      window.requestIdleCallback(function(){ checkLicense(false); },{timeout:1500});
    }else{
      setTimeout(function(){ checkLicense(false); },300);
    }
  }

  window.addEventListener('online',function(){
    if(getState().status==='blocked') checkLicense(true);
    else if(!checking) checkLicense(false);
  });

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
