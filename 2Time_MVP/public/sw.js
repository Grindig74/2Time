self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('2time-cache-v1').then((cache) => cache.addAll(['/','/index.html','/manifest.json']))
  );
});
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
