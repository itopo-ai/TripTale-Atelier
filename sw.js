/* TripTale service worker: funziona offline e serve le foto salvate sul telefono */
const CACHE = "tt2-v2";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("tt2-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open("tt2-assets", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("blobs");
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function getBlob(id) {
  const db = await idb();
  return new Promise((res, rej) => {
    const q = db.transaction("blobs").objectStore("blobs").get(id);
    q.onsuccess = () => res(q.result);
    q.onerror = () => rej(q.error);
  });
}

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (url.origin === self.location.origin && url.pathname.includes("/_blob/")) {
    const id = decodeURIComponent(url.pathname.split("/_blob/")[1] || "");
    e.respondWith(getBlob(id)
      .then(b => b ? new Response(b, { headers: { "Content-Type": b.type || "image/jpeg", "Cache-Control": "no-store" } }) : new Response("", { status: 404 }))
      .catch(() => new Response("", { status: 404 })));
    return;
  }
  if (e.request.method !== "GET") return;
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request)
      .then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", cp)); return r; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok || r.type === "opaque") { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
    return r;
  })));
});
