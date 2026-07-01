/* Amsterdam v29 SAFE: geen admin-materiaal wijzigingen; alleen datum, overzicht, personeel extra bescherming */
(function(){
  'use strict';
  if(window.__AMS_V29_SAFE_PATCHES__) return; window.__AMS_V29_SAFE_PATCHES__=true;
  function E(id){return document.getElementById(id);} function T(v){return String(v==null?'':v).trim();}
  function isoToday(){var d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10);}
  function addDaysISO(v,n){var d=v?new Date(String(v).slice(0,10)+'T00:00:00'):new Date();if(isNaN(d))d=new Date();d.setDate(d.getDate()+Number(n||0));d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10);}
  function patchDate(){
    var map={startMinus:['dateStart',-1],startPlus:['dateStart',1],endMinus:['dateEnd',-1],endPlus:['dateEnd',1]};
    Object.keys(map).forEach(function(id){var b=E(id); if(!b||b.dataset.amsv29)return; b.dataset.amsv29='1'; b.addEventListener('click',function(ev){var ds=E('dateStart'),de=E('dateEnd'),inp=E(map[id][0]); if(!ds||!de||!inp)return; ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation)ev.stopImmediatePropagation(); if(!ds.value)ds.value=isoToday(); if(!de.value)de.value=ds.value; inp.value=addDaysISO(inp.value||isoToday(),map[id][1]); if(de.value<ds.value)de.value=ds.value; try{if(typeof summaryRender==='function')summaryRender();}catch(e){} return false;},true);});
  }
  function patchOverview(){document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button,a');if(!b)return;var txt=String(b.textContent||'').toLowerCase();if(txt.indexOf('overzicht bestelling')<0&&txt.indexOf('overzicht maken')<0)return;setTimeout(function(){try{if(typeof openOverview==='function')openOverview();}catch(e){}},80);},true);}
  function patchUsers(){document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button'); if(!b||!/opslaan gebruiker/i.test(b.textContent||''))return; var pane=b.closest('#adminUsers,.adminPane,.panel,section')||document; var name=E('adminUserName')||pane.querySelector('input[placeholder*="Naam"],input[id*="Name"]'); var pin=E('adminUserPin')||pane.querySelector('input[placeholder*="PIN"],input[id*="Pin"]'); var role=E('adminUserRole')||pane.querySelector('select'); if(!name||!pin||!T(name.value)||!T(pin.value)||T(pin.value)==='1111')return; ev.preventDefault(); ev.stopPropagation(); if(ev.stopImmediatePropagation)ev.stopImmediatePropagation(); window.state=window.state||{}; state.users=Array.isArray(state.users)?state.users:[]; state.users.push({id:'u_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,6), name:T(name.value), pin:T(pin.value), role:T(role&&role.value)||'Bezorger', active:true}); try{if(typeof save==='function')save();}catch(e){} name.value='';pin.value='';alert('Gebruiker opgeslagen.'); return false;},true);}
  patchDate(); patchOverview(); patchUsers(); setInterval(patchDate,700);
  console.info('[Amsterdam v29] SAFE patches geladen. Admin materiaal blijft volledig uit app.js-copy.');
})();
