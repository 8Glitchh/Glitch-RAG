// Offline support.
// Online: always fetch the latest files from the website (so new chapters show up straight away)
// and keep a copy. Offline: use the copy. No version number to bump when content changes.
const CACHE = 'glitch-rag';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE.map(u => new Request(u, { cache: 'reload' })));
    // The content files are listed in index.html; cache whatever it loads, so new modules work offline too.
    const html = await (await fetch('./index.html', { cache: 'reload' })).text();
    const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m => './' + m[1]);
    await cache.addAll(scripts.map(u => new Request(u, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  // The app's "has anything changed?" check must reach the website, not this cache.
  if (url.searchParams.has('v')) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = req.mode === 'navigate' ? './index.html' : req;
    try {
      const res = await fetch(req, { cache: 'no-cache' });
      if (res.ok) cache.put(key, res.clone());
      return res;
    } catch (err) {
      const hit = await cache.match(key, { ignoreSearch: true });
      if (hit) return hit;
      throw err;
    }
  })());
});
