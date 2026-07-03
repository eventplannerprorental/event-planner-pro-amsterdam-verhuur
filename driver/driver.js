/* Event Planner PRO Amsterdam verhuur - driver v50
   Tapwagen-achtige compacte telefoonindeling.
   Alleen Amsterdam RTDB: customers/amsterdam-verhuur.
*/
(function(){
  'use strict';
  var DB='https://epp-amsterdam-verhuur-default-rtdb.europe-west1.firebasedatabase.app';
  var BASE='customers/amsterdam-verhuur';
  var CONFIG={apiKey:'AIzaSyADMGcbgIP2KSsP_LPR4XIuycw4npUc1Vs',authDomain:'epp-amsterdam-verhuur.firebaseapp.com',databaseURL:DB,projectId:'epp-amsterdam-verhuur',storageBucket:'epp-amsterdam-verhuur.firebasestorage.app',messagingSenderId:'484128911122',appId:'1:484128911122:web:b2ba741c7a0a2511054dcb'};
  var app, db, users=[], orders=[], currentUser=null, currentSearch='';
  var LS_USER='epp-amsterdam-driver-user-v50';
  function E(id){return document.getElementById(id)}
  function T(v){return String(v==null?'':v).trim()}
  function esc(s){return T(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function vals(o){return o&&typeof o==='object'?Object.keys(o).map(function(k){var v=o[k];if(v&&typeof v==='object'){if(!v._key)v._key=k;if(!v.id)v.id=k;}return v;}):[]}
  function safeKey(s){return T(s).toLowerCase().replace(/[.$#\[\]\/]/g,'-').replace(/[^a-z0-9_-]/g,'-').replace(/-+/g,'-').slice(0,120)||('id-'+Date.now())}
  function now(){return new Date().toISOString()}
  function nice(d){if(!d)return '';var p=String(d).split('-');return p.length===3?p[2]+'-'+p[1]+'-'+p[0]:d}
  function setStatus(t,bad){var s=E('status');if(s){s.textContent=t;s.className='status '+(bad?'bad':'ok')}}
  function cust(o){return o.customer||{}}
  function loc(o){return o.location||{}}
  function title(o){return T(o.title||o.name||'Opdracht')}
  function orderKey(o){return o._key||safeKey(o.id||o.number||title(o))}
  function address(o){return [loc(o).street,loc(o).zip,loc(o).city].filter(Boolean).join(' ')||'Adres onbekend'}
  function phone(o){return T(cust(o).phone||loc(o).phone||o.customerPhone||o.phone)}
  function driverName(o){return T(o.driverName||o.driver||o.bezorger||o.bezorgerName||(o.driverNames||[]).join(', '))}
  function isOpen(o){var s=T(o.status).toLowerCase();return !/geannuleerd|uitgevoerd|afgemeld|deleted|verwijderd/.test(s)}
  function assignedTo(o,u){var n=T(u&&u.name).toLowerCase(), id=T(u&&u.id).toLowerCase(), pin=T(u&&u.pin);var arr=[driverName(o),o.driverId,o.bezorgerId,o.userId].concat(o.driverNames||[],o.bezorgerNames||[],o.driverIds||[],o.bezorgerIds||[],o.userIds||[]).map(function(x){return T(x).toLowerCase()});return arr.some(function(x){return x&&(x===n||x===id||x===pin||x.indexOf(n)>=0)})}
  function mats(o){var ms=o.materials||[];if(!ms.length)return 'Geen materialen';return ms.length+' artikelsoorten - '+ms.map(function(m){return (m.qty||1)+'x '+[m.code,m.name].filter(Boolean).join(' - ')}).join(', ')}
  function orderText(o){return [T(o.number)+' - '+title(o),'Datum: '+nice(o.start)+' t/m '+nice(o.end||o.start),'Klant: '+T(cust(o).name),'Locatie: '+T(loc(o).name),'Adres: '+address(o),'Materialen: '+mats(o),T(o.extra||o.bijzonderheden||'')?'Bijzonderheden: '+T(o.extra||o.bijzonderheden):''].filter(Boolean).join('\n')}
  async function initFirebase(){if(!window.firebase)throw new Error('Firebase scripts niet geladen');app=firebase.apps&&firebase.apps.length?firebase.app():firebase.initializeApp(CONFIG);db=firebase.database(app);try{await firebase.auth(app).signInAnonymously()}catch(e){}}
  function ref(p){return db.ref(BASE+'/'+p)}
  async function getPath(p){return (await ref(p).once('value')).val()}
  async function setPath(p,d){return ref(p).set(d)}
  async function updatePath(p,d){return ref(p).update(d)}
  async function loadData(){
    users=vals(await getPath('users')).filter(function(u){return u&&u.active!==false&&T(u.role).toLowerCase()==='bezorger'});
    orders=vals(await getPath('orders')).filter(isOpen);
    renderLogin(); renderOrders(); setStatus('Data geladen');
  }
  function renderLogin(){
    var sel=E('driverSelect'); if(!sel)return;
    sel.innerHTML='<option value="">Kies bezorger</option>'+users.map(function(u){return '<option value="'+esc(u.id||u._key)+'">'+esc(u.name)+'</option>'}).join('');
    var saved=localStorage.getItem(LS_USER); if(saved&&!currentUser){currentUser=users.find(function(u){return String(u.id||u._key)===saved||String(u._key)===saved})||null}
    if(currentUser)showOrdersCard();
    if(!users.length)setStatus('Geen bezorger gevonden',true);
  }
  function showOrdersCard(){E('loginCard')&&E('loginCard').classList.add('hidden');E('ordersCard')&&E('ordersCard').classList.remove('hidden');E('heroDriver')&&(E('heroDriver').textContent=(currentUser&&currentUser.name||'-')+' - Bezorger');renderOrders()}
  function doLogin(){var uid=E('driverSelect')&&E('driverSelect').value;var pin=E('pinInput')&&E('pinInput').value;var err=E('loginError');var u=users.find(function(x){return String(x.id||x._key)===String(uid)||String(x._key)===String(uid)});if(!u){err&&(err.textContent='Kies bezorger.',err.classList.remove('hidden'));return}if(T(u.pin)!==T(pin)){err&&(err.textContent='PIN klopt niet.',err.classList.remove('hidden'));return}currentUser=u;localStorage.setItem(LS_USER,String(u.id||u._key));showOrdersCard()}
  function mineOrders(){var q=T(currentSearch).toLowerCase();return orders.filter(function(o){return currentUser&&assignedTo(o,currentUser)}).filter(function(o){return !q||JSON.stringify(o).toLowerCase().indexOf(q)>=0}).sort(function(a,b){return String(a.start||'').localeCompare(String(b.start||''))})}
  function renderOrders(){var box=E('ordersList');if(!box)return;if(!currentUser){box.innerHTML='';return}var list=mineOrders();box.innerHTML=list.length?list.map(renderOrder).join(''):'<p class="status">Geen opdrachten</p>'}
  function renderOrder(o){return '<article class="order-card" data-order="'+esc(orderKey(o))+'">'+
    '<span class="order-no">'+esc(o.number||'')+'</span><h2>'+esc(title(o))+'</h2><span class="status-pill">'+esc(o.status||'Bevestigd')+'</span>'+
    '<div class="info-row"><span>📅</span><b>'+esc(nice(o.start))+' t/m '+esc(nice(o.end||o.start))+'</b></div>'+
    '<div class="info-row"><span>👤</span><b>'+esc(T(cust(o).name)||T(loc(o).contact)||'Klant onbekend')+'</b></div>'+
    '<div class="info-row"><span>📍</span><b>'+esc(address(o))+'</b></div>'+
    '<div class="info-row"><span>📦</span><b>'+esc(mats(o))+'</b></div>'+
    '<div class="actions compact-actions">'+
    '<button class="action-btn navy" data-act="open">Open opdracht</button>'+
    '<button class="action-btn blue" data-act="overview">Overzicht bestelling</button>'+
    '<button class="action-btn green" data-act="waze">Waze</button>'+
    '<button class="action-btn dark" data-act="maps">Maps</button>'+
    '<button class="action-btn cyan" data-act="call">Bel klant</button>'+
    '<button class="action-btn red" data-act="message-menu">Melding maken</button>'+
    '<button class="action-btn orange" data-act="offer">Offerte</button>'+
    '<button class="action-btn dark" data-act="done">Afmelden pas na einddatum</button>'+
    '<button class="action-btn dark" data-act="photo-menu">Foto / bewijs</button>'+
    '<button class="action-btn purple" data-act="signature">Handtekening klant</button>'+
    '</div></article>'}
  function findOrder(btn){var c=btn.closest('[data-order]');var k=c&&c.getAttribute('data-order');return orders.find(function(o){return String(orderKey(o))===String(k)})}
  function modal(html){var m=document.createElement('div');m.className='modal';m.innerHTML='<div class="modal-card">'+html+'</div>';document.body.appendChild(m);m.querySelectorAll('[data-close]').forEach(function(b){b.onclick=function(){m.remove()}});return m}
  function openMaps(o,maps){var q=encodeURIComponent(address(o));location.href=maps?'https://www.google.com/maps/search/?api=1&query='+q:'https://waze.com/ul?q='+q+'&navigate=yes'}
  function call(o){var p=phone(o);if(!p){alert('Geen telefoonnummer');return}location.href='tel:'+p.replace(/\s+/g,'')}
  function shareText(txt){if(navigator.share)navigator.share({text:txt}).catch(function(){});else{navigator.clipboard&&navigator.clipboard.writeText(txt);alert('Gekopieerd')}}
  async function addFile(o,file){var k=orderKey(o), id='m_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);file.id=id;file.orderId=k;file.orderNumber=o.number||'';file.driverName=currentUser&&currentUser.name||'';file.createdAt=now();await updatePath('orders/'+k+'/media/'+id,file);await updatePath('customerFiles/'+k+'/media/'+id,file)}
  async function createOwnAlert(o,type,msg){var id='a_'+Date.now()+'_'+Math.random().toString(36).slice(2,7);var names={algemeen:'Algemene melding',schade:'Schade',storing:'Storing / defect',vermissing:'Vermissing'};var alert={id:id,type:type,title:names[type]||'Melding',message:msg||'',orderId:orderKey(o),orderNumber:o.number||'',driverName:currentUser&&currentUser.name||'',createdAt:now(),resolved:false,source:'eigen-systeem'};await updatePath('alerts/'+id,alert);await addFile(o,{kind:'melding',type:type,title:alert.title,text:alert.message})}
  function askMessage(o,type){var names={algemeen:'Algemene melding',schade:'Schade',storing:'Storing / defect',vermissing:'Vermissing'};var m=modal('<h2>'+esc(names[type]||'Melding')+'</h2><textarea id="msgText" placeholder="Toelichting"></textarea><button class="action-btn red" id="sendMsg">Versturen</button><button class="action-btn dark" data-close>Annuleren</button>');m.querySelector('#sendMsg').onclick=async function(){await createOwnAlert(o,type,m.querySelector('#msgText').value||'');m.remove();setStatus('Melding verstuurd')}}
  function messageMenu(o){var m=modal('<h2>Melding maken</h2><button class="action-btn orange" data-m="algemeen">Algemene melding</button><button class="action-btn red" data-m="schade">Schade</button><button class="action-btn purple" data-m="storing">Storing</button><button class="action-btn red" data-m="vermissing">Vermissing</button><button class="action-btn dark" data-close>Annuleren</button>');m.querySelectorAll('[data-m]').forEach(function(b){b.onclick=function(){var t=b.getAttribute('data-m');m.remove();askMessage(o,t)}})}
  function compressImage(file){return new Promise(function(resolve,reject){var r=new FileReader();r.onerror=reject;r.onload=function(){var img=new Image();img.onload=function(){var max=1200,w=img.width,h=img.height;if(w>h&&w>max){h=Math.round(h*max/w);w=max}else if(h>max){w=Math.round(w*max/h);h=max}var c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);resolve(c.toDataURL('image/jpeg',0.72))};img.onerror=reject;img.src=r.result};r.readAsDataURL(file)})}
  async function takePhoto(o,type){var inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.capture='environment';inp.onchange=async function(){var f=inp.files&&inp.files[0];if(!f)return;var data=await compressImage(f);await addFile(o,{kind:'foto',type:type,title:type==='voor'?'Foto voor levering':'Foto na levering',imageData:data});setStatus('Foto opgeslagen')};inp.click()}
  function photoMenu(o){var m=modal('<h2>Foto / bewijs</h2><button class="action-btn dark" data-p="voor">Foto voor levering</button><button class="action-btn dark" data-p="na">Foto na levering</button><button class="action-btn dark" data-close>Annuleren</button>');m.querySelectorAll('[data-p]').forEach(function(b){b.onclick=function(){var t=b.getAttribute('data-p');m.remove();takePhoto(o,t)}})}
  function signature(o){var m=modal('<h2>Handtekening klant</h2><canvas class="sig" id="sigCanvas"></canvas><input id="sigName" placeholder="Naam klant"><button class="action-btn purple" id="sigSave">Opslaan</button><button class="action-btn dark" id="sigClear">Leegmaken</button><button class="action-btn dark" data-close>Annuleren</button>');var c=m.querySelector('#sigCanvas'),ctx=c.getContext('2d'),drawing=false;function resize(){var r=c.getBoundingClientRect();c.width=r.width*devicePixelRatio;c.height=r.height*devicePixelRatio;ctx.scale(devicePixelRatio,devicePixelRatio);ctx.lineWidth=3;ctx.lineCap='round'}setTimeout(resize,30);function pos(ev){var t=ev.touches&&ev.touches[0]||ev,r=c.getBoundingClientRect();return{x:t.clientX-r.left,y:t.clientY-r.top}}function start(ev){drawing=true;var p=pos(ev);ctx.beginPath();ctx.moveTo(p.x,p.y);ev.preventDefault()}function move(ev){if(!drawing)return;var p=pos(ev);ctx.lineTo(p.x,p.y);ctx.stroke();ev.preventDefault()}function end(){drawing=false}c.addEventListener('mousedown',start);c.addEventListener('mousemove',move);window.addEventListener('mouseup',end);c.addEventListener('touchstart',start,{passive:false});c.addEventListener('touchmove',move,{passive:false});c.addEventListener('touchend',end);m.querySelector('#sigClear').onclick=function(){ctx.clearRect(0,0,c.width,c.height)};m.querySelector('#sigSave').onclick=async function(){await addFile(o,{kind:'handtekening',type:'handtekening',title:'Handtekening klant',name:m.querySelector('#sigName').value||'',imageData:c.toDataURL('image/png')});m.remove();setStatus('Handtekening opgeslagen')}}
  async function overview(o){var k=orderKey(o), media=vals(await getPath('customerFiles/'+k+'/media'));var html='<h2>Overzicht bestelling</h2><pre>'+esc(orderText(o))+'</pre><h3>Klantmap</h3>'+(media.length?media.map(function(x){return '<div class="media-item"><b>'+esc(x.title||x.type||x.kind)+'</b><br><small>'+esc(x.createdAt||'')+'</small>'+(x.imageData?'<img src="'+x.imageData+'">':'')+'<div class="small-row"><button data-share="'+esc(x.id)+'">Deel</button><button data-del="'+esc(x.id)+'">Wis</button></div></div>'}).join(''):'<p>Leeg</p>')+'<button class="action-btn blue" id="shareOrder">Deel</button><button class="action-btn dark" data-close>Sluiten</button>';var m=modal(html);m.querySelector('#shareOrder').onclick=function(){shareText(orderText(o))};m.querySelectorAll('[data-share]').forEach(function(b){b.onclick=function(){shareText(orderText(o))}});m.querySelectorAll('[data-del]').forEach(function(b){b.onclick=async function(){var id=b.getAttribute('data-del');await setPath('customerFiles/'+k+'/media/'+id,null);await setPath('orders/'+k+'/media/'+id,null);m.remove();overview(o)}})}
  function openOrder(o){modal('<h2>Open opdracht</h2><pre>'+esc(orderText(o))+'</pre><button class="action-btn blue" data-close>Sluiten</button>')}
  async function done(o){var end=o.end||o.start,today=new Date().toISOString().slice(0,10);if(end&&today<end){alert('Afmelden kan pas na einddatum: '+nice(end));return}await updatePath('orders/'+orderKey(o),{status:'Uitgevoerd',driverStatus:'uitgevoerd',driverDoneAt:now(),driverDoneBy:currentUser.name});await loadData()}
  document.addEventListener('click',function(ev){var b=ev.target.closest('[data-act]');if(!b)return;var o=findOrder(b);if(!o)return;var a=b.getAttribute('data-act');Promise.resolve().then(function(){if(a==='open')openOrder(o);else if(a==='overview')overview(o);else if(a==='waze')openMaps(o,false);else if(a==='maps')openMaps(o,true);else if(a==='call')call(o);else if(a==='message-menu')messageMenu(o);else if(a==='offer')shareText(orderText(o));else if(a==='done')done(o);else if(a==='photo-menu')photoMenu(o);else if(a==='signature')signature(o)}).catch(function(e){setStatus('Fout: '+(e.message||e),true);alert('Fout: '+(e.message||e))})});
  function bind(){E('loginBtn')&&(E('loginBtn').onclick=doLogin);E('logoutBtn')&&(E('logoutBtn').onclick=function(){currentUser=null;localStorage.removeItem(LS_USER);location.reload()});E('resetDeviceBtn')&&(E('resetDeviceBtn').onclick=function(){currentUser=null;localStorage.removeItem(LS_USER);location.reload()});E('refreshBtn')&&(E('refreshBtn').onclick=loadData);E('clearSearchBtn')&&(E('clearSearchBtn').onclick=function(){currentSearch='';E('searchInput').value='';renderOrders()});E('searchInput')&&(E('searchInput').oninput=function(){currentSearch=this.value;renderOrders()})}
  async function boot(){bind();try{await initFirebase();await loadData();setInterval(loadData,15000)}catch(e){setStatus('Firebase fout: '+(e.message||e),true)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
