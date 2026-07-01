/* Event Planner PRO license gate. Bij lokaal file-testen wordt de gate overgeslagen. */
(function(){
  'use strict';
  if(window.__EPP_LICENSE_GATE_V33__) return;
  window.__EPP_LICENSE_GATE_V33__ = true;
  var cfg = window.EPP_CUSTOMER_CONFIG || {};
  function load(src, cb){ var s=document.createElement('script'); s.src=src; s.onload=function(){ if(cb) cb(); }; s.onerror=function(){ document.body.innerHTML='<h2>Bestand niet geladen</h2><p>'+src+'</p>'; }; document.body.appendChild(s); }
  function boot(){ load('app.js?v=330', function(){ load('amsterdam-fix.js?v=330'); }); }
  function showBlocked(msg){ document.body.innerHTML='<section style="font-family:Arial;padding:30px;max-width:760px;margin:auto"><h1>Licentie niet actief</h1><p>'+String(msg||'Controleer uw licentie en neem contact op.')+'</p><small>amsterdam-verhuur · v33</small></section>'; }
  if(location.protocol === 'file:'){ boot(); return; }
  var fb = cfg.firebaseConfig || {};
  var path = cfg.licensePath || 'customers/amsterdam-verhuur/license';
  var url = String(fb.databaseURL||'').replace(/\/$/,'') + '/' + path + '.json?ts=' + Date.now();
  fetch(url, {cache:'no-store'}).then(function(r){ return r.json(); }).then(function(lic){
    if(!lic) return showBlocked('Licentie ontbreekt.');
    var blocked = lic.blocked === true || String(lic.status||'').toLowerCase()==='blocked' || lic.active === false || lic.paid === false;
    var until = lic.validUntil || lic.paidUntil || '';
    if(until){
      var parts=String(until).split('-');
      var norm = parts[0].length===4 ? String(until) : (parts[2]+'-'+parts[1]+'-'+parts[0]);
      var today = new Date(); today.setHours(0,0,0,0);
      var end = new Date(norm+'T23:59:59');
      if(!isNaN(end) && end < today) blocked = true;
    }
    if(blocked) return showBlocked(lic.blockText || 'Deze licentie is geblokkeerd of verlopen.');
    boot();
  }).catch(function(){ showBlocked('Licentiecontrole kon niet worden uitgevoerd.'); });
})();
