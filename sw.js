const CACHE_PREFIX='triptale-atelier:'+self.registration.scope+':';
const CACHE=CACHE_PREFIX+'tt2-v1.0.4.4';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./assets/mappe/sri-lanka-diorama.jpg'];
const STAGE_PHOTOS=[
  './assets/tappe/colombo-aeroporto.jpg',
  './assets/tappe/sigiriya.jpg',
  './assets/tappe/pidurangala.jpg',
  './assets/tappe/dambulla.jpg',
  './assets/tappe/kandy.jpg',
  './assets/tappe/ramboda.jpg',
  './assets/tappe/nuwara-eliya.jpg',
  './assets/tappe/nanu-oya.jpg',
  './assets/tappe/ella.jpg',
  './assets/tappe/ella-rock.jpg',
  './assets/tappe/diyaluma.jpg',
  './assets/tappe/mirissa.jpg',
  './assets/tappe/galle.jpg'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll([...SHELL,...STAGE_PHOTOS])).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
async function getBlob(id){const db=await new Promise((res,rej)=>{const r=indexedDB.open('tt2-assets',1);r.onupgradeneeded=()=>r.result.createObjectStore('blobs');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});try{return await new Promise((res,rej)=>{const q=db.transaction('blobs').objectStore('blobs').get(id);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})}finally{db.close()}}
async function navigation(req){const c=await caches.open(CACHE);const hit=await c.match('./index.html');if(hit)return hit;try{const r=await fetch(req);if(r.ok)return r}catch(e){}return new Response('TripTale non ancora disponibile offline. Apri con Internet.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})}
async function resource(req){const c=await caches.open(CACHE);const hit=await c.match(req);if(hit)return hit;try{const r=await fetch(req);if(r.ok){try{await c.put(req,r.clone())}catch(e){}}return r}catch(e){return new Response('',{status:503})}}
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET')return;if(u.origin===self.location.origin&&/^\/_blob\/[a-zA-Z0-9_-]+$/.test(u.pathname)){e.respondWith(getBlob(u.pathname.slice(7)).then(b=>b?new Response(b,{headers:{'Content-Type':b.type||'image/jpeg','Cache-Control':'no-store'}}):new Response('',{status:404})).catch(()=>new Response('',{status:404})));return}if(e.request.mode==='navigate'&&u.origin===self.location.origin&&u.href.startsWith(self.registration.scope)){e.respondWith(navigation(e.request));return}if(u.origin===self.location.origin&&u.href.startsWith(self.registration.scope)||u.origin==='https://cdnjs.cloudflare.com'&&/\/ajax\/libs\/(jspdf\/2\.5\.1|pdf\.js\/3\.11\.174)\//.test(u.pathname))e.respondWith(resource(e.request));});
