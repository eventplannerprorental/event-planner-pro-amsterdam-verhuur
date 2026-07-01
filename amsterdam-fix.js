/* Amsterdam minimale fix: PIN + datum. Raakt beheer-onderdelen voor artikelen niet aan. */
(function(){
  'use strict';
  if(window.__EPP_AMS_MIN_FIX_V33__) return;
  window.__EPP_AMS_MIN_FIX_V33__ = true;
  var STORE = 'event-planner-pro-amsterdam-verhuur-v1';
  function $(id){ return document.getElementById(id); }
  function read(){ try{ return JSON.parse(localStorage.getItem(STORE)||'{}')||{}; }catch(e){ return {}; } }
  function write(s){ try{ localStorage.setItem(STORE, JSON.stringify(s)); }catch(e){} }
  function syncCodes(){
    try{
      var s = (typeof state==='object' && state) ? state : read();
      s.users = Array.isArray(s.users) ? s.users.filter(function(u){ return String(u && u.pin) !== '1111'; }) : [];
      s.adminPin = '9119';
      if(!s.users.some(function(u){ return String(u.pin)==='3330'; })) s.users.push({id:'ams_user_3330', name:'Gebruiker', pin:'3330', role:'Planner', active:true});
      if(!s.users.some(function(u){ return String(u.pin)==='9119'; })) s.users.push({id:'ams_admin_9119', name:'Admin', pin:'9119', role:'Admin', active:true});
      if(typeof state==='object' && state) Object.assign(state, s);
      write(s);
    }catch(e){}
  }
  function bindAccess(){
    syncCodes();
    var btn = $('unlockAdmin');
    if(btn){
      btn.onclick = function(){
        syncCodes();
        var p = String(($('adminPin') && $('adminPin').value) || '').trim();
        if(p === '1111'){ try{ toastMsg('Deze code is geblokkeerd'); }catch(e){ alert('Deze code is geblokkeerd'); } return; }
        if(p === '9119'){ var area=$('adminArea'); if(area) area.classList.remove('hidden'); return; }
        try{ toastMsg('Verkeerde PIN'); }catch(e){ alert('Verkeerde PIN'); }
      };
    }
  }
  function iso(d){ d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,10); }
  function add(v,n){ var d = v ? new Date(v+'T00:00:00') : new Date(); if(isNaN(d)) d=new Date(); d.setDate(d.getDate()+n); return iso(d); }
  function bindDates(){
    var ds=$('dateStart'), de=$('dateEnd');
    function set(input, delta){
      if(!input) return;
      input.value = add(input.value, delta);
      if(ds && de && de.value && ds.value && de.value < ds.value) de.value = ds.value;
      try{ if(typeof summaryRender==='function') summaryRender(); }catch(e){}
    }
    [['startMinus',ds,-1],['startPlus',ds,1],['endMinus',de,-1],['endPlus',de,1]].forEach(function(x){
      var b=$(x[0]); if(!b) return;
      b.onclick=function(ev){ if(ev){ ev.preventDefault(); ev.stopPropagation(); } set(x[1], x[2]); return false; };
    });
  }
  function run(){ bindAccess(); bindDates(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(run,0); }); else setTimeout(run,0);
  setTimeout(run,300);
  setTimeout(run,1200);
  setInterval(syncCodes, 1500);
})();
