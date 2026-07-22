(function(){
  'use strict';
  var VERSION_FILE='version.json';
  var FALLBACK_VERSION='AMS-2026-07-22-V6';

  function setStatus(text, update){
    var el=document.getElementById('amsterdamVersionStatus');
    if(!el) return;
    el.textContent=text;
    el.style.background=update?'#ffedd5':'#e2e8f0';
    el.style.color=update?'#9a3412':'#334155';
  }

  async function cleanupOldRuntime(){
    try{
      if('serviceWorker' in navigator){
        var regs=await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(function(r){ return r.unregister(); }));
      }
    }catch(e){}
    try{
      if('caches' in window){
        var names=await caches.keys();
        await Promise.all(names.map(function(n){ return caches.delete(n); }));
      }
    }catch(e){}
  }

  async function getVersion(){
    var r=await fetch(VERSION_FILE+'?t='+Date.now(),{cache:'no-store'});
    if(!r.ok) throw new Error('version '+r.status);
    var data=await r.json();
    return String(data.version||FALLBACK_VERSION);
  }

  function loadApp(version){
    window.AMSTERDAM_EXPECTED_BUILD_ID=version;
    var s=document.createElement('script');
    s.src='app.js?v='+encodeURIComponent(version);
    s.async=false;
    s.onload=function(){
      var loaded=String(window.AMSTERDAM_BUILD_ID||'');
      var mismatch=loaded!==version;
      setStatus(mismatch?'Nieuwe update beschikbaar - klik hier':'App actueel: '+version,mismatch);
      var el=document.getElementById('amsterdamVersionStatus');
      if(el && mismatch){
        el.style.cursor='pointer';
        el.onclick=async function(){
          setStatus('Update wordt geladen...',false);
          await cleanupOldRuntime();
          location.reload();
        };
      }
    };
    s.onerror=function(){ setStatus('App kon niet worden geladen',true); };
    document.head.appendChild(s);
  }

  (async function start(){
    setStatus('Versie controleren...',false);
    await cleanupOldRuntime();
    var version=FALLBACK_VERSION;
    try{ version=await getVersion(); }
    catch(e){ console.warn('[Amsterdam loader] version.json niet bereikbaar; fallback gebruikt.',e); }
    loadApp(version);
  })();
})();
