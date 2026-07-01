/* Amsterdam fix v35: 3330 = Admin, 9119 = geheime sleutel, 1111 geblokkeerd, einddatum +/- stabiel.
   Deze fix raakt geen beheer-rendering en bouwt geen schermen opnieuw op. */
(function(){
  'use strict';
  if(window.__EPP_AMS_FIX_V35__) return;
  window.__EPP_AMS_FIX_V35__ = true;
  var STORE = 'event-planner-pro-amsterdam-verhuur-v1';
  var SECRET = '9119';
  var ADMIN = '3330';
  function E(id){ return document.getElementById(id); }
  function toast(t){ try{ if(typeof toastMsg==='function') toastMsg(t); else alert(t); }catch(e){ alert(t); } }
  function getState(){
    try{ if(typeof state==='object' && state) return state; }catch(e){}
    try{ return JSON.parse(localStorage.getItem(STORE)||'{}') || {}; }catch(e){ return {}; }
  }
  function saveState(s){
    try{ if(typeof state==='object' && state) Object.assign(state,s); }catch(e){}
    try{ localStorage.setItem(STORE, JSON.stringify(s)); }catch(e){}
    try{ if(typeof save==='function') save(); }catch(e){}
  }
  function syncAccess(){
    var s=getState();
    s.users = Array.isArray(s.users) ? s.users.filter(function(u){ return String(u && u.pin) !== '1111' && String(u && u.pin) !== SECRET; }) : [];
    s.adminPin = SECRET;
    var u=s.users.find(function(x){ return String(x && x.pin)===ADMIN; });
    if(u){ u.name = u.name || 'Admin'; u.role='Admin'; u.active=true; }
    else s.users.push({id:'ams_admin_3330', name:'Admin', pin:ADMIN, role:'Admin', active:true});
    saveState(s);
  }
  function bindAccess(){
    syncAccess();
    var btn=E('unlockAdmin');
    if(btn && btn.__amsV35!=='1'){
      btn.__amsV35='1';
      btn.onclick=function(ev){
        if(ev){ ev.preventDefault(); ev.stopPropagation(); }
        syncAccess();
        var p=String((E('adminPin') && E('adminPin').value)||'').trim();
        if(p==='1111'){ toast('Deze code is geblokkeerd'); return false; }
        if(p===SECRET || p===ADMIN){ var area=E('adminArea'); if(area) area.classList.remove('hidden'); return false; }
        toast('Verkeerde PIN');
        return false;
      };
    }
    try{
      window.adminPinOk = function(p){ p=String(p||'').trim(); return p===SECRET || p===ADMIN; };
      adminPinOk = window.adminPinOk;
    }catch(e){}
  }
  function iso(d){ d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,10); }
  function parse(v){ var d=v?new Date(v+'T00:00:00'):new Date(); if(isNaN(d)) d=new Date(); return d; }
  function addDays(v,n){ var d=parse(v); d.setDate(d.getDate()+n); return iso(d); }
  function setStable(input,value){
    if(!input) return;
    input.value=value;
    [0,30,120,300].forEach(function(ms){ setTimeout(function(){ if(input.value!==value) input.value=value; },ms); });
    try{ if(typeof summaryRender==='function') summaryRender(); }catch(e){}
  }
  function stepDate(id,delta){
    var ds=E('dateStart'), de=E('dateEnd');
    var input=E(id); if(!input) return;
    var base=input.value || (id==='dateEnd' && ds && ds.value ? ds.value : iso(new Date()));
    var next=addDays(base,delta);
    setStable(input,next);
    if(ds && de && ds.value && de.value && de.value < ds.value) setStable(de,ds.value);
  }
  function dateClick(ev){
    var t=ev.target;
    if(!t || !t.id) return;
    var map={startMinus:['dateStart',-1],startPlus:['dateStart',1],endMinus:['dateEnd',-1],endPlus:['dateEnd',1]};
    if(!map[t.id]) return;
    ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
    stepDate(map[t.id][0], map[t.id][1]);
    return false;
  }
  function bindDates(){
    var e3=E('endPlus3'); if(e3) e3.style.display='none';
    ['startMinus','startPlus','endMinus','endPlus'].forEach(function(id){
      var b=E(id); if(!b) return;
      b.type='button';
      b.onclick=function(ev){ return dateClick(ev || window.event); };
    });
  }
  function run(){ bindAccess(); bindDates(); }
  document.addEventListener('click', dateClick, true);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ setTimeout(run,0); }); else setTimeout(run,0);
  setTimeout(run,500); setTimeout(run,1600); setTimeout(run,2600);
  setInterval(syncAccess,2000);
})();
