/* Amsterdam Verhuur UI fix v38
   - Herstelt alle opdrachtstatussen wanneer oudere patches opties verwijderen.
   - Markeert de app als gereed zodat vroeg ingevoerde PIN-toetsen veilig kunnen worden afgespeeld.
   - Geen Tapwagen-code en geen Firebase-datawijzigingen. */
(function(){
  'use strict';
  if(window.__AMS_UI_FIX_V38__) return;
  window.__AMS_UI_FIX_V38__ = true;

  var STATUSSEN = [
    'Offerte',
    'Opdrachtbevestiging',
    'Optie',
    'optie 14 dagen',
    'geannuleerd'
  ];

  function herstelStatussen(){
    var sel=document.getElementById('orderStatus');
    if(!sel) return;
    var huidige=String(sel.value||'Offerte');
    var bestaand={};
    Array.prototype.forEach.call(sel.options,function(o){
      bestaand[String(o.value||o.textContent||'').trim().toLowerCase()]=true;
    });
    STATUSSEN.forEach(function(status){
      if(!bestaand[status.toLowerCase()]){
        var o=document.createElement('option');
        o.value=status;
        o.textContent=status;
        sel.appendChild(o);
      }
    });
    var geldig=STATUSSEN.some(function(s){ return s.toLowerCase()===huidige.toLowerCase(); });
    if(geldig) sel.value=huidige;
  }

  function start(){
    herstelStatussen();
    window.__AMS_APP_READY_V38__=true;
    try{ window.dispatchEvent(new CustomEvent('ams-app-ready-v38')); }catch(e){}
    setTimeout(herstelStatussen,250);
    setTimeout(herstelStatussen,1000);
    setTimeout(herstelStatussen,2500);
  }

  document.addEventListener('focusin',function(ev){
    if(ev.target && ev.target.id==='orderStatus') herstelStatussen();
  },true);
  document.addEventListener('click',function(ev){
    var nav=ev.target && ev.target.closest && ev.target.closest('[data-page="newOrder"]');
    if(nav) setTimeout(herstelStatussen,50);
  },true);

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
