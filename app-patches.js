/* Event Planner PRO Amsterdam v16 - kleine correcties bovenop de klantapp.
   Doel: geen 1111, einddatum alleen als voorstel, overzichtknop fallback. */
(function(){
  'use strict';
  if(window.__EPP_AMS_V16_PATCHES__) return;
  window.__EPP_AMS_V16_PATCHES__ = true;

  function E(id){ return document.getElementById(id); }
  function T(v){ return String(v == null ? '' : v).trim(); }
  function addDays(v, days){
    var d = new Date(String(v||'') + 'T00:00:00');
    if(isNaN(d)) return '';
    d.setDate(d.getDate()+days);
    return d.toISOString().slice(0,10);
  }
  function patchDates(){
    var starts = ['dateStart','orderStart','startDate','datumStart'].map(E).filter(Boolean);
    var ends = ['dateEnd','orderEnd','endDate','datumEnd'].map(E).filter(Boolean);
    if(!starts.length || !ends.length) return;
    var end = ends[0];
    if(end.dataset.eppV16DatePatched==='1') return;
    end.dataset.eppV16DatePatched='1';
    end.addEventListener('input', function(){ end.dataset.eppManual='1'; }, true);
    end.addEventListener('change', function(){ end.dataset.eppManual='1'; }, true);
    starts.forEach(function(st){
      st.addEventListener('change', function(){
        if(!end.dataset.eppManual && st.value){ end.value = addDays(st.value,3); }
      }, true);
    });
  }
  function patchAdmin1111(){
    document.addEventListener('click', function(ev){
      var b = ev.target && ev.target.closest && ev.target.closest('#unlockAdmin,#pinOk');
      if(!b) return;
      var pinBox = E('adminPin');
      var pinView = E('pinView');
      var txt = T(pinBox && pinBox.value);
      if(!txt && pinView) txt = T(pinView.textContent).replace(/\D/g,'');
      if(txt === '1111'){
        ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
        alert('PIN 1111 is uitgeschakeld. Gebruik de klant-PIN of mastercode.');
        if(pinBox) pinBox.value='';
        return false;
      }
    }, true);
  }
  function findOrderFromCard(el){
    var card = el && el.closest && el.closest('.order-card,.v95order,.bns356-card,[data-order-id],[data-id]');
    var key = card && (card.getAttribute('data-order-id') || card.getAttribute('data-id'));
    if(key) return key;
    var txt = card ? T(card.textContent) : T(el && el.closest && el.closest('section,div') && el.closest('section,div').textContent);
    var m = txt.match(/(20\d{2}[-_ ]?\d{3,6})/);
    return m ? m[1].replace(/\s+/g,'') : '';
  }
  function patchOverview(){
    document.addEventListener('click', function(ev){
      var b = ev.target && ev.target.closest && ev.target.closest('button,a');
      if(!b) return;
      var label = T(b.textContent || b.value).toLowerCase();
      if(label.indexOf('overzicht bestelling') < 0 && label.indexOf('overzicht maken') < 0) return;
      setTimeout(function(){
        try{
          var id = findOrderFromCard(b);
          if(id && typeof window.BNS_V493_SHOW === 'function') window.BNS_V493_SHOW(id);
          else if(id && typeof window.BNS_V128_SHOW_ORDER_OVERVIEW === 'function') window.BNS_V128_SHOW_ORDER_OVERVIEW(id);
        }catch(e){ console.warn('Overzicht bestelling fallback fout', e); }
      }, 50);
    }, true);
  }
  function loop(){ try{ patchDates(); }catch(e){} }
  patchAdmin1111();
  patchOverview();
  loop();
  setInterval(loop, 1200);
  console.info('[Amsterdam v16] patches actief: licentie-first, 1111 uit, datum handmatig vrij, overzicht fallback.');
})();
