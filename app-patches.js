/* Event Planner PRO Amsterdam v25 SAFE patches
   Basis: originele rental app.js blijft leidend.
   Deze file doet alleen gerichte fixes en raakt materiaalbeheer NIET aan.
*/
(function(){
  'use strict';
  if(window.__EPP_AMS_V25_SAFE_PATCHES__) return;
  window.__EPP_AMS_V25_SAFE_PATCHES__ = true;

  function E(id){ return document.getElementById(id); }
  function A(sel,root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }
  function T(v){ return String(v == null ? '' : v).trim(); }
  function L(v){ return T(v).toLowerCase(); }
  function isoToday(){ var d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,10); }
  function addDaysISO(iso, days){
    var s=String(iso||'').slice(0,10);
    var d=s ? new Date(s+'T00:00:00') : new Date();
    if(isNaN(d)) d=new Date();
    d.setDate(d.getDate()+Number(days||0));
    d.setMinutes(d.getMinutes()-d.getTimezoneOffset());
    return d.toISOString().slice(0,10);
  }

  // PIN 1111 mag niet meer werken. Geen mastercode tonen in popup.
  function block1111(){
    document.addEventListener('click', function(ev){
      var b=ev.target && ev.target.closest && ev.target.closest('button,a');
      if(!b) return;
      var inputs=A('input').filter(function(i){ return /pin|code|password|admin/i.test([i.id,i.name,i.placeholder,i.type].join(' ')); });
      var bad=inputs.some(function(i){ return T(i.value)==='1111'; });
      if(!bad) return;
      ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
      alert('Deze PIN is niet geldig.');
      inputs.forEach(function(i){ if(T(i.value)==='1111') i.value=''; });
      return false;
    }, true);
  }

  // Einddatum +/- hard overrulen. Oude handlers krijgen geen kans om de waarde terug te zetten.
  function patchEndDateButtons(){
    ['endMinus','endPlus','startMinus','startPlus'].forEach(function(id){
      var b=E(id); if(!b || b.dataset.eppV25DateFixed) return;
      b.dataset.eppV25DateFixed='1';
      b.addEventListener('click', function(ev){
        var ds=E('dateStart'), de=E('dateEnd');
        if(!ds || !de) return;
        ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
        if(!ds.value) ds.value=isoToday();
        if(!de.value) de.value=ds.value;
        if(id==='startMinus') ds.value=addDaysISO(ds.value,-1);
        if(id==='startPlus') ds.value=addDaysISO(ds.value,1);
        if(id==='endMinus') de.value=addDaysISO(de.value,-1);
        if(id==='endPlus') de.value=addDaysISO(de.value,1);
        // Einddatum mag terug tot startdatum, niet daarvóór.
        if(de.value < ds.value) de.value = ds.value;
        de.dataset.eppManual='1';
        try{ ds.dispatchEvent(new Event('input',{bubbles:true})); ds.dispatchEvent(new Event('change',{bubbles:true})); }catch(e){}
        try{ de.dispatchEvent(new Event('input',{bubbles:true})); de.dispatchEvent(new Event('change',{bubbles:true})); }catch(e){}
        try{ if(typeof window.summaryRender==='function') window.summaryRender(); }catch(e){}
        return false;
      }, true);
    });
  }

  function findOrderFromButton(btn){
    var card=btn && btn.closest && btn.closest('[data-order-id],[data-id],.order-card,.bns356-card,.v95order,.card,.panel');
    var direct=card && (card.getAttribute('data-order-id')||card.getAttribute('data-id'));
    if(direct) return direct;
    var txt=T(card && card.textContent);
    var m=txt.match(/(20\d{2}[-_ ]?\d{3,6})/);
    return m ? m[1].replace(/\s+/g,'') : '';
  }
  function patchOverview(){
    document.addEventListener('click', function(ev){
      var b=ev.target && ev.target.closest && ev.target.closest('button,a');
      if(!b) return;
      var label=L(b.textContent||b.value||'');
      if(label.indexOf('overzicht bestelling')<0 && label.indexOf('overzicht maken')<0) return;
      setTimeout(function(){
        try{
          var key=findOrderFromButton(b);
          if(key && typeof window.BNS_V493_SHOW==='function') return window.BNS_V493_SHOW(key);
          if(key && typeof window.BNS_V128_SHOW_ORDER_OVERVIEW==='function') return window.BNS_V128_SHOW_ORDER_OVERVIEW(key);
          if(typeof window.BNS_V821_OPEN==='function') return window.BNS_V821_OPEN(key);
        }catch(e){ console.warn('[v25] overzicht fallback fout', e); }
      },80);
    }, true);
  }

  function readState(){
    try{ if(window.state && typeof window.state==='object') return window.state; }catch(e){}
    try{ return JSON.parse(localStorage.getItem('event-planner-pro-amsterdam-verhuur-v1')||'{}'); }catch(e){ return {}; }
  }
  function persistState(s){
    try{ if(window.state && typeof window.state==='object') Object.assign(window.state,s); }catch(e){}
    try{ localStorage.setItem('event-planner-pro-amsterdam-verhuur-v1', JSON.stringify(s)); }catch(e){}
    try{ if(typeof window.save==='function') window.save(); }catch(e){}
    try{ if(typeof window.renderAll==='function') window.renderAll(); }catch(e){}
  }
  function patchUsers(){
    document.addEventListener('click', function(ev){
      var b=ev.target && ev.target.closest && ev.target.closest('button');
      if(!b || !/opslaan gebruiker/i.test(b.textContent||'')) return;
      var pane=b.closest('#adminUsers,.adminPane,.panel,.card,section')||document;
      var name=E('adminUserName') || pane.querySelector('input[placeholder*="Naam"],input[name*="name"],input[id*="Name"]');
      var pin=E('adminUserPin') || pane.querySelector('input[placeholder*="PIN"],input[name*="pin"],input[id*="Pin"]');
      var role=E('adminUserRole') || pane.querySelector('select');
      if(!name || !pin) return;
      var nm=T(name.value), pn=T(pin.value), rl=T(role && role.value)||'Bezorger';
      if(!nm || !pn) return;
      ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
      var s=readState(); s.users=Array.isArray(s.users)?s.users:[];
      var id='u_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6);
      s.users.push({id:id, name:nm, pin:pn, role:rl, active:true, rights:{}});
      name.value=''; pin.value='';
      persistState(s);
      alert('Gebruiker opgeslagen.');
      return false;
    }, true);
  }

  function loop(){ patchEndDateButtons(); }
  block1111(); patchOverview(); patchUsers(); loop(); setInterval(loop,750);
  console.info('[Amsterdam v25 SAFE] originele materiaalbeheer uit copy + datum/personeel/overzicht/1111 patches actief.');
})();
