/* Event Planner PRO Amsterdam verhuur - driver v48
   Volledige bezorgtelefoon in Tapwagen-stijl met rubrieken, maar alle data naar Amsterdam RTDB:
   customers/amsterdam-verhuur/users, orders, alerts en customerFiles.
*/
(function(){
  'use strict';
  var DB = 'https://epp-amsterdam-verhuur-default-rtdb.europe-west1.firebasedatabase.app';
  var BASE = 'customers/amsterdam-verhuur';
  var CONFIG = {
    apiKey: 'AIzaSyADMGcbgIP2KSsP_LPR4XIuycw4npUc1Vs',
    authDomain: 'epp-amsterdam-verhuur.firebaseapp.com',
    databaseURL: DB,
    projectId: 'epp-amsterdam-verhuur',
    storageBucket: 'epp-amsterdam-verhuur.firebasestorage.app',
    messagingSenderId: '484128911122',
    appId: '1:484128911122:web:b2ba741c7a0a2511054dcb'
  };
  var app, db;
  var users = [], orders = [];
  var currentUser = null;
  var LS_USER = 'epp-amsterdam-driver-user-v48';

  function E(id){ return document.getElementById(id); }
  function T(v){ return String(v == null ? '' : v).trim(); }
  function esc(s){ return T(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function vals(o){ return o && typeof o === 'object' ? Object.keys(o).map(function(k){ var v=o[k]; if(v && typeof v==='object' && !v._key) v._key=k; if(v && typeof v==='object' && !v.id) v.id=k; return v; }) : []; }
  function key(s){ return T(s).toLowerCase().replace(/[.$#\[\]\/]/g,'-').replace(/[^a-z0-9_-]/g,'-').replace(/-+/g,'-').slice(0,120) || ('id-' + Date.now()); }
  function now(){ return new Date().toISOString(); }
  function money(n){ n=Number(n||0); return '€ '+n.toFixed(2).replace('.',','); }
  function status(t,bad){ var s=E('status'); if(s){s.textContent=t; s.className='status '+(bad?'bad':'ok');} }
  function niceDate(d){ if(!d) return ''; var p=String(d).split('-'); return p.length===3 ? p[2]+'-'+p[1]+'-'+p[0] : d; }
  function driverName(o){ return T(o.driverName || o.driver || o.bezorger || o.bezorgerName || (o.driverNames||[]).join(', ')); }
  function assignedTo(o,u){ var n=T(u && u.name).toLowerCase(), id=T(u && u.id).toLowerCase(), pin=T(u && u.pin); var all=[driverName(o), o.driverId, o.bezorgerId, o.userId].concat(o.driverNames||[], o.bezorgerNames||[], o.driverIds||[], o.bezorgerIds||[], o.userIds||[]).map(function(x){return T(x).toLowerCase();}); return all.some(function(x){return x && (x===n || x===id || x===pin || x.indexOf(n)>=0);}); }
  function isOpenOrder(o){ var s=T(o.status).toLowerCase(); return !/geannuleerd|uitgevoerd|afgemeld|deleted|verwijderd/.test(s); }
  function orderAddress(o){ var l=o.location||{}; return [l.street,l.zip,l.city].filter(Boolean).join(' '); }
  function customerPhone(o){ return T((o.customer||{}).phone || o.customerPhone || (o.location||{}).phone); }
  function orderTitle(o){ return [o.number, o.title].filter(Boolean).join(' - '); }
  function orderText(o){
    var mats=(o.materials||[]).map(function(m){ return [m.qty||1+'x', m.code, m.name].filter(Boolean).join(' '); }).join(', ');
    return orderTitle(o)+'\nDatum: '+niceDate(o.start)+' t/m '+niceDate(o.end || o.start)+'\nKlant: '+T((o.customer||{}).name)+'\nLocatie: '+orderAddress(o)+'\nMaterialen: '+mats+'\nBijzonderheden: '+T(o.extra || o.bijzonderheden || '');
  }

  function injectCss(){
    if(document.getElementById('eppDriverV48Css')) return;
    var css=document.createElement('style'); css.id='eppDriverV48Css';
    css.textContent = '\nbody{background:#eef4fb!important;font-family:system-ui,-apple-system,Segoe UI,sans-serif!important;color:#102033}.hero{background:linear-gradient(135deg,#0b74d1,#074e93)!important;color:#fff!important;padding:22px 16px!important;border-radius:0 0 24px 24px!important;box-shadow:0 10px 28px rgba(5,57,107,.22)}.hero h1{margin:0;font-size:26px}.hero p{margin:4px 0 0;opacity:.9}.wrap{max-width:760px;margin:14px auto;padding:0 12px}.card{background:#fff!important;border-radius:20px!important;padding:16px!important;margin:14px 0!important;box-shadow:0 10px 30px rgba(15,23,42,.13)!important;border:1px solid #dbe7f5}.status{margin:12px 0;padding:10px 14px;border-radius:14px;background:#dbeafe;font-weight:800}.status.bad{background:#fee2e2;color:#991b1b}.status.ok{background:#dcfce7;color:#14532d}.hidden{display:none!important}label{font-weight:800;margin-top:10px;display:block}input,select,textarea{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:12px;padding:12px;font-size:16px;margin:6px 0 12px}.primary,.secondary,button{border:0;border-radius:14px;padding:12px 14px;font-weight:900;font-size:15px}.primary{background:#0b74d1;color:#fff}.secondary{background:#334155;color:#fff}.order{border-left:8px solid #16a34a}.order-head{display:flex;gap:12px;align-items:flex-start}.datebox{background:#111827;color:#fff;border-radius:16px;padding:12px;font-weight:900;text-align:center;min-width:72px}.order-main{flex:1}.badge{display:inline-block;border-radius:999px;background:#dcfce7;color:#166534;font-weight:900;padding:5px 10px;font-size:13px}.muted{color:#64748b}.btn-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.btn-grid button{color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.12)}.btn-waze{background:#16a34a}.btn-call{background:#0284c7}.btn-photo{background:#7c3aed}.btn-sign{background:#f97316}.btn-done{background:#16a34a;grid-column:1/-1}.btn-alert{background:#dc2626}.btn-overview{background:#2563eb;grid-column:1/-1}.driver-sections{margin-top:14px;display:grid;gap:12px}.driver-group{border:1px solid #dbe7f5;border-radius:18px;padding:12px;background:#f8fbff}.driver-group h4{margin:0 0 6px;font-size:16px}.group-alert{border-color:#fecaca;background:#fff7f7}.group-media{border-color:#ddd6fe;background:#faf7ff}.group-route{border-color:#bbf7d0;background:#f7fff9}.group-overview{border-color:#bfdbfe;background:#f8fbff}.driver-group .muted{font-size:13px;margin:0 0 8px}.media-list{background:#f8fafc;border-radius:14px;padding:10px;margin-top:10px}.media-item{border-bottom:1px solid #e5e7eb;padding:8px 0}.media-item:last-child{border-bottom:0}.small-actions{display:flex;gap:8px;margin-top:6px;flex-wrap:wrap}.small-actions button{padding:7px 10px;font-size:13px}.delete{background:#475569;color:#fff}.share{background:#0ea5e9;color:#fff}.modal{position:fixed;inset:0;background:rgba(15,23,42,.62);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px}.modal-card{background:#fff;border-radius:18px;padding:16px;width:min(680px,96vw);max-height:88vh;overflow:auto}.sig{border:2px dashed #94a3b8;border-radius:14px;width:100%;height:220px;touch-action:none;background:#fff}.toprow{display:flex;justify-content:space-between;gap:12px;align-items:center}@media(max-width:520px){.btn-grid{grid-template-columns:1fr}.order-head{align-items:stretch}.datebox{min-width:58px}}';
    document.head.appendChild(css);
  }

  async function initFirebase(){
    if(window.firebase){
      app = firebase.apps && firebase.apps.length ? firebase.app() : firebase.initializeApp(CONFIG);
      db = firebase.database(app);
      try{ if(firebase.auth) await firebase.auth(app).signInAnonymously(); }catch(e){ console.warn('Anonieme auth niet actief; probeer open rules.', e); }
      return;
    }
    throw new Error('Firebase scripts niet geladen');
  }
  async function ref(path){ return db.ref(BASE + '/' + path); }
  async function getPath(path){ var r=await ref(path); return (await r.once('value')).val(); }
  async function setPath(path, data){ var r=await ref(path); return r.set(data); }
  async function updatePath(path, data){ var r=await ref(path); return r.update(data); }
  async function pushPath(path, data){ var r=await ref(path); return r.push(data); }

  async function loadData(){
    users = vals(await getPath('users')).filter(function(u){ return u && u.active !== false && T(u.role).toLowerCase()==='bezorger'; });
    orders = vals(await getPath('orders')).filter(isOpenOrder);
    renderLogin();
    renderOrders();
    status('Online');
  }

  function renderLogin(){
    var sel=E('driverSelect'); if(!sel) return;
    sel.innerHTML = '<option value="">Kies bezorger</option>' + users.map(function(u){return '<option value="'+esc(u.id || u._key)+'">'+esc(u.name)+'</option>';}).join('');
    var saved = localStorage.getItem(LS_USER);
    if(saved){
      currentUser = users.find(function(u){ return String(u.id||u._key)===saved || String(u._key)===saved; }) || currentUser;
      if(currentUser){ showLocked(); }
    }
    if(!users.length) status('Geen bezorger gevonden. Maak eerst een bezorger aan in Admin.', true);
  }
  function showLocked(){
    var nb=E('nameBlock'), lb=E('lockedBlock'), ln=E('lockedName');
    if(nb) nb.classList.add('hidden'); if(lb) lb.classList.remove('hidden'); if(ln) ln.textContent=currentUser.name || '-';
  }
  function showOrdersCard(){
    E('loginCard')&&E('loginCard').classList.add('hidden');
    E('ordersCard')&&E('ordersCard').classList.remove('hidden');
    E('driverInfo')&&(E('driverInfo').textContent='Ingelogd als '+(currentUser.name||''));
    renderOrders();
  }
  function doLogin(){
    var sel=E('driverSelect'), pin=E('pinInput'), err=E('loginError');
    var uid = currentUser ? (currentUser.id || currentUser._key) : (sel && sel.value);
    var u = currentUser || users.find(function(x){return String(x.id||x._key)===String(uid) || String(x._key)===String(uid);});
    if(!u){ if(err){err.textContent='Kies een bezorger.'; err.classList.remove('hidden');} return; }
    if(T(u.pin) !== T(pin && pin.value)){ if(err){err.textContent='PIN klopt niet.'; err.classList.remove('hidden');} return; }
    currentUser = u; localStorage.setItem(LS_USER, String(u.id || u._key)); showLocked(); showOrdersCard();
  }

  function renderOrders(){
    var box=E('ordersList'); if(!box) return;
    if(!currentUser){ box.innerHTML=''; return; }
    var mine = orders.filter(function(o){ return assignedTo(o,currentUser); }).sort(function(a,b){ return String(a.start||'').localeCompare(String(b.start||'')); });
    if(!mine.length){ box.innerHTML='<p class="muted">Geen opdrachten voor '+esc(currentUser.name)+'.</p>'; return; }
    box.innerHTML = mine.map(renderOrder).join('');
  }
  function renderOrder(o){
    var addr=orderAddress(o), tel=customerPhone(o), extra=T(o.extra || o.bijzonderheden || '');
    var mats=(o.materials||[]).map(function(m){ return '<span class="badge">'+esc(m.code || m.name || 'materiaal')+'</span>'; }).join(' ');
    return '<section class="card order" data-order="'+esc(o._key || key(o.id||o.number))+'">'+
      '<div class="order-head"><div class="datebox">'+esc(niceDate(o.start).slice(0,5))+'<br>'+esc(String(o.start||'').slice(0,4))+'</div><div class="order-main">'+
      '<h3>'+esc(orderTitle(o))+'</h3><div><b>Klant:</b> '+esc((o.customer||{}).name)+'</div><div><b>Locatie:</b> '+esc(addr)+'</div><div><b>Materialen:</b> '+mats+'</div>'+
      (extra?'<div><b>Bijzonderheden:</b> '+esc(extra)+'</div>':'')+
      '<div class="muted">Totaal: '+esc(o.pricing&&o.pricing.grand?money(o.pricing.grand):'')+'</div></div></div>'+
      '<div class="driver-sections">'+
      '<section class="driver-group group-route"><h4>Route en contact</h4><div class="btn-grid">'+
      '<button class="btn-waze" data-act="waze">Waze / route</button>'+
      '<button class="btn-call" data-act="call" '+(!tel?'disabled':'')+'>Klant bellen</button>'+
      '</div></section>'+ 
      '<section class="driver-group group-media"><h4>Foto\'s en handtekening</h4><p class="muted">Gaat naar klantmap / overzicht bestelling, zonder systeemmelding.</p><div class="btn-grid">'+
      '<button class="btn-photo" data-act="photo-before">Foto voor levering</button>'+
      '<button class="btn-photo" data-act="photo-after">Foto na levering</button>'+ 
      '<button class="btn-sign" data-act="signature">Handtekening klant</button>'+ 
      '</div></section>'+ 
      '<section class="driver-group group-alert"><h4>Meldingen</h4><p class="muted">Schade, vermissing en defect gaan naar de planner als rode systeemmelding.</p><div class="btn-grid">'+
      '<button class="btn-alert" data-act="schade">Schade melden</button>'+ 
      '<button class="btn-alert" data-act="vermissing">Vermissing melden</button>'+ 
      '<button class="btn-alert" data-act="defect">Defect / storing melden</button>'+ 
      '</div></section>'+ 
      '<section class="driver-group group-overview"><h4>Overzicht bestelling</h4><div class="btn-grid">'+
      '<button class="btn-overview" data-act="overview">Overzicht bestelling / klantmap</button>'+ 
      '<button class="btn-done" data-act="done">Afmelden / uitgevoerd</button>'+ 
      '</div></section>'+ 
      '</div></section>';
  }
  function findOrderFromBtn(btn){ var card=btn.closest('[data-order]'); var k=card&&card.getAttribute('data-order'); return orders.find(function(o){ return String(o._key)===String(k) || String(key(o.id||o.number))===String(k); }); }
  async function getOrderKey(o){ return o._key || key(o.id || o.number); }
  async function saveOrderUpdate(o, data){ var k=await getOrderKey(o); await updatePath('orders/'+k, data); Object.assign(o,data); }
  async function addOrderMedia(o, media){
    var k=await getOrderKey(o); var id='m_'+Date.now()+'_'+Math.random().toString(36).slice(2,7); media.id=id; media.orderId=k; media.orderNumber=o.number||''; media.driverName=currentUser&&currentUser.name||''; media.createdAt=now();
    await updatePath('orders/'+k+'/media/'+id, media);
    await updatePath('customerFiles/'+k+'/media/'+id, media);
    return id;
  }
  async function createSystemAlert(o, type, msg){
    var id='a_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);
    var title = type==='schade'?'Schade gemeld':(type==='vermissing'?'Vermissing gemeld':(type==='defect'?'Defect gemeld':'Storing gemeld'));
    var alert={id:id,type:type,title:title,message:msg||title,orderId:await getOrderKey(o),orderNumber:o.number||'',driverName:currentUser&&currentUser.name||'',createdAt:now(),resolved:false,source:'bezorgtelefoon'};
    await updatePath('alerts/'+id, alert);
    await addOrderMedia(o, {kind:'system-alert',type:type,title:title,text:msg||title});
  }
  function askText(title){ return prompt(title+'\nTyp een korte toelichting:', '') || ''; }
  function openMaps(o){ var q=encodeURIComponent(orderAddress(o)); if(q) location.href='https://waze.com/ul?q='+q+'&navigate=yes'; }
  function callCustomer(o){ var p=customerPhone(o); if(p) location.href='tel:'+p.replace(/\s+/g,''); }
  async function handleAlert(o,type){ var msg=askText(type.charAt(0).toUpperCase()+type.slice(1)+' melden'); await createSystemAlert(o,type,msg); status('Systeemmelding verstuurd'); alert('Systeemmelding verstuurd naar planner.'); }
  async function done(o){ await saveOrderUpdate(o,{status:'Uitgevoerd',driverStatus:'uitgevoerd',driverDoneAt:now(),driverDoneBy:currentUser.name}); await loadData(); alert('Opdracht afgemeld.'); }

  function compressImage(file){
    return new Promise(function(resolve,reject){
      var r=new FileReader(); r.onerror=reject; r.onload=function(){
        var img=new Image(); img.onload=function(){
          var max=1200, w=img.width, h=img.height; if(w>h && w>max){h=Math.round(h*max/w);w=max;} else if(h>max){w=Math.round(w*max/h);h=max;}
          var c=document.createElement('canvas'); c.width=w; c.height=h; var ctx=c.getContext('2d'); ctx.drawImage(img,0,0,w,h); resolve(c.toDataURL('image/jpeg',0.72));
        }; img.onerror=reject; img.src=r.result;
      }; r.readAsDataURL(file);
    });
  }
  async function takePhoto(o, type){
    var inp=document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.capture='environment';
    inp.onchange=async function(){ var f=inp.files&&inp.files[0]; if(!f) return; status('Foto opslaan...'); var data=await compressImage(f); await addOrderMedia(o,{kind:'photo',type:type,title:type==='photo-before'?'Foto voor levering':'Foto na levering',imageData:data}); status('Foto opgeslagen'); alert('Foto opgeslagen in overzicht bestelling.'); };
    inp.click();
  }
  function signatureModal(o){
    var m=document.createElement('div'); m.className='modal'; m.innerHTML='<div class="modal-card"><h2>Handtekening klant</h2><canvas class="sig" id="sigCanvas"></canvas><label>Naam klant<input id="sigName" placeholder="Naam klant"></label><div class="small-actions"><button class="primary" id="sigSave">Opslaan</button><button class="secondary" id="sigClear">Leegmaken</button><button class="delete" id="sigClose">Sluiten</button></div></div>'; document.body.appendChild(m);
    var c=E('sigCanvas'), ctx=c.getContext('2d'), drawing=false; function resize(){ var r=c.getBoundingClientRect(); c.width=r.width*devicePixelRatio; c.height=r.height*devicePixelRatio; ctx.scale(devicePixelRatio,devicePixelRatio); ctx.lineWidth=3; ctx.lineCap='round'; ctx.strokeStyle='#111827'; } setTimeout(resize,20);
    function pos(ev){ var t=ev.touches&&ev.touches[0]||ev; var r=c.getBoundingClientRect(); return {x:t.clientX-r.left,y:t.clientY-r.top}; }
    function start(ev){ drawing=true; var p=pos(ev); ctx.beginPath(); ctx.moveTo(p.x,p.y); ev.preventDefault(); }
    function move(ev){ if(!drawing) return; var p=pos(ev); ctx.lineTo(p.x,p.y); ctx.stroke(); ev.preventDefault(); }
    function end(){ drawing=false; }
    c.addEventListener('mousedown',start); c.addEventListener('mousemove',move); window.addEventListener('mouseup',end); c.addEventListener('touchstart',start,{passive:false}); c.addEventListener('touchmove',move,{passive:false}); c.addEventListener('touchend',end);
    E('sigClear').onclick=function(){ ctx.clearRect(0,0,c.width,c.height); };
    E('sigClose').onclick=function(){ m.remove(); };
    E('sigSave').onclick=async function(){ await addOrderMedia(o,{kind:'signature',type:'signature',title:'Handtekening klant',name:E('sigName').value||'',imageData:c.toDataURL('image/png')}); m.remove(); status('Handtekening opgeslagen'); alert('Handtekening opgeslagen in overzicht bestelling.'); };
  }
  async function overview(o){
    var k=await getOrderKey(o); var media=vals(await getPath('customerFiles/'+k+'/media'));
    var m=document.createElement('div'); m.className='modal';
    m.innerHTML='<div class="modal-card"><h2>Overzicht bestelling</h2><pre style="white-space:pre-wrap;background:#f8fafc;border-radius:12px;padding:10px">'+esc(orderText(o))+'</pre><h3>Klantmap</h3><div class="media-list">'+(media.length?media.map(function(x){return '<div class="media-item"><b>'+esc(x.title||x.type||x.kind)+'</b><br><small>'+esc(new Date(x.createdAt||'').toLocaleString('nl-NL'))+'</small>'+(x.imageData?'<br><img src="'+x.imageData+'" style="max-width:100%;border-radius:10px;margin-top:6px">':'')+'<div class="small-actions"><button class="share" data-share="'+esc(x.id)+'">Deel</button><button class="delete" data-del="'+esc(x.id)+'">Wis</button></div></div>';}).join(''):'Nog geen foto’s of handtekeningen.')+'</div><div class="small-actions"><button class="share" id="shareOrder">Deel opdracht</button><button class="secondary" id="closeOverview">Sluiten</button></div></div>';
    document.body.appendChild(m); E('closeOverview').onclick=function(){m.remove();}; E('shareOrder').onclick=function(){ shareText(orderText(o)); };
    m.querySelectorAll('[data-share]').forEach(function(b){ b.onclick=function(){ var item=media.find(function(x){return x.id===b.getAttribute('data-share');}); shareText((item&&item.title||'Bestand')+'\n'+orderText(o)); }; });
    m.querySelectorAll('[data-del]').forEach(function(b){ b.onclick=async function(){ var id=b.getAttribute('data-del'); if(confirm('Wissen uit klantmap?')){ await setPath('customerFiles/'+k+'/media/'+id,null); await setPath('orders/'+k+'/media/'+id,null); m.remove(); overview(o); } }; });
  }
  function shareText(txt){ if(navigator.share) navigator.share({text:txt}).catch(function(){}); else { navigator.clipboard&&navigator.clipboard.writeText(txt); alert('Tekst gekopieerd om te delen.'); } }

  document.addEventListener('click', function(ev){
    var b=ev.target.closest('[data-act]'); if(!b) return; var o=findOrderFromBtn(b); if(!o) return; var act=b.getAttribute('data-act');
    ev.preventDefault();
    Promise.resolve().then(function(){
      if(act==='waze') return openMaps(o);
      if(act==='call') return callCustomer(o);
      if(act==='photo-before' || act==='photo-after') return takePhoto(o,act);
      if(act==='signature') return signatureModal(o);
      if(act==='schade' || act==='vermissing' || act==='defect') return handleAlert(o,act);
      if(act==='done') return done(o);
      if(act==='overview') return overview(o);
    }).catch(function(e){ console.error(e); status('Fout: '+(e.message||e), true); alert('Fout:\n'+(e.message||e)); });
  });

  function bind(){
    E('loginBtn')&&(E('loginBtn').onclick=doLogin);
    E('logoutBtn')&&(E('logoutBtn').onclick=function(){ currentUser=null; localStorage.removeItem(LS_USER); location.reload(); });
    E('resetDeviceBtn')&&(E('resetDeviceBtn').onclick=function(){ currentUser=null; localStorage.removeItem(LS_USER); location.reload(); });
  }
  async function boot(){
    injectCss(); bind();
    try{ await initFirebase(); await loadData(); setInterval(loadData,15000); }
    catch(e){ console.error(e); status('Firebase fout: '+(e.message||e), true); }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
