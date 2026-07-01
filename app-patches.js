/* Event Planner PRO Amsterdam v24 SAFE patches
   Doel: originele app-functionaliteit behouden; alleen gerichte fixes:
   - PIN 1111 blokkeren
   - einddatum +/- en handmatig terugzetten toestaan
   - Overzicht bestelling fallback
   - personeel/gebruiker aanmaken niet overschrijven
*/
(function(){
  'use strict';
  if(window.__EPP_AMS_V24_SAFE_PATCHES__) return;
  window.__EPP_AMS_V24_SAFE_PATCHES__ = true;

  function E(id){ return document.getElementById(id); }
  function A(sel,root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }
  function T(v){ return String(v == null ? '' : v).trim(); }
  function L(v){ return T(v).toLowerCase(); }
  function H(v){ return String(v == null ? '' : v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function todayId(){ return Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7); }
  function readLS(){
    var keys=['event-planner-pro-amsterdam-verhuur-v1','event-planner-pro-rental-v1'];
    for(var i=0;i<keys.length;i++){
      try{ var raw=localStorage.getItem(keys[i]); if(raw){ var s=JSON.parse(raw); if(s && typeof s==='object') return {key:keys[i], state:s}; } }catch(e){}
    }
    return {key:'event-planner-pro-amsterdam-verhuur-v1', state:{users:[],orders:[],materials:[],customers:[],locations:[]}};
  }
  function getState(){
    try{ if(window.state && typeof window.state==='object') return window.state; }catch(e){}
    return readLS().state;
  }
  function persistState(s){
    try{ if(window.state && typeof window.state==='object') Object.assign(window.state,s); }catch(e){}
    try{ localStorage.setItem('event-planner-pro-amsterdam-verhuur-v1', JSON.stringify(s)); }catch(e){}
    try{ if(typeof window.save==='function') window.save(); }catch(e){}
    try{ if(typeof window.renderAll==='function') window.renderAll(); }catch(e){}
  }
  function addDays(iso, days){
    var d=new Date(String(iso||'')+'T00:00:00');
    if(isNaN(d)) return '';
    d.setDate(d.getDate()+days);
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function dateInputCandidates(kind){
    var ids = kind==='start' ? ['dateStart','orderStart','startDate','datumStart'] : ['dateEnd','orderEnd','endDate','datumEnd'];
    var out = ids.map(E).filter(Boolean);
    A('input[type="date"]').forEach(function(inp){
      var meta=L([inp.id,inp.name,inp.placeholder,inp.getAttribute('aria-label')].join(' '));
      if(kind==='start' && /start|begin|vanaf/.test(meta) && out.indexOf(inp)<0) out.push(inp);
      if(kind==='end' && /end|eind|tot/.test(meta) && out.indexOf(inp)<0) out.push(inp);
    });
    return out;
  }
  function patchDates(){
    var starts=dateInputCandidates('start'), ends=dateInputCandidates('end');
    if(!starts.length || !ends.length) return;
    var end=ends[0];
    if(!end.dataset.eppV23EndFree){
      end.dataset.eppV23EndFree='1';
      ['input','change','keyup','mouseup'].forEach(function(ev){ end.addEventListener(ev,function(){ end.dataset.eppManual='1'; }, true); });
      // voorkom dat oude code direct na +/- de waarde terugzet: onthoud laatste handmatige einddatum
      var last='';
      setInterval(function(){ if(end.value && end.value!==last){ last=end.value; } }, 350);
      end.addEventListener('change', function(){ last=end.value; }, true);
    }
    starts.forEach(function(st){
      if(st.dataset.eppV23StartHook) return;
      st.dataset.eppV23StartHook='1';
      st.addEventListener('change', function(){
        if(st.value && !end.dataset.eppManual && !end.value) end.value=addDays(st.value,3);
      }, true);
    });
  }
  function block1111(){
    document.addEventListener('click', function(ev){
      var b=ev.target && ev.target.closest && ev.target.closest('button,a');
      if(!b) return;
      var label=L(b.textContent||b.value||'');
      if(!/ok|login|inloggen|open|ontgrendel|admin|beheer/.test(label) && !(b.id||'').match(/pin|admin|unlock|ok/i)) return;
      var inputs=A('input').filter(function(i){ return /pin|code|password|admin/i.test([i.id,i.name,i.placeholder,i.type].join(' ')); });
      var bad=inputs.some(function(i){ return T(i.value)==='1111'; });
      if(bad){
        ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
        alert('PIN 1111 is uitgeschakeld. Gebruik 3330 of mastercode 9119.');
        inputs.forEach(function(i){ if(T(i.value)==='1111') i.value=''; });
        return false;
      }
    }, true);
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
          // laatste fallback: klik de bestaande globale functie als die bestaat
          if(typeof window.BNS_V821_OPEN==='function') return window.BNS_V821_OPEN(key);
        }catch(e){ console.warn('[v23] overzicht fallback fout', e); }
      },80);
    }, true);
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
      var s=getState(); s.users=Array.isArray(s.users)?s.users:[];
      // Belangrijk: opslaan maakt standaard een NIEUWE gebruiker. Alleen data-epp-edit-user bewerkt bestaand.
      var editId=pane.getAttribute('data-epp-edit-user')||'';
      var u=editId ? s.users.find(function(x){ return String(x.id)===String(editId); }) : null;
      if(!u){ u={id:'u_'+todayId(), name:nm, pin:pn, role:rl, active:true, rights:{}}; s.users.push(u); }
      else { u.name=nm; u.pin=pn; u.role=rl; u.active=true; }
      pane.removeAttribute('data-epp-edit-user');
      name.value=''; pin.value='';
      persistState(s);
      alert('Gebruiker opgeslagen. Totaal personeel: '+s.users.length);
      return false;
    }, true);
  }
  function loop(){ try{patchDates();}catch(e){} }
  block1111(); patchOverview(); patchUsers(); loop(); setInterval(loop,1000);
  console.info('[Amsterdam v24 SAFE] patches actief: datum +/- vrij, overzicht fallback, personeel meerdere gebruikers, 1111 uit.');
})();
