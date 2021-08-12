const cacheName = "timePWAcache";
const staticAssets = [
  "./",
  "./index.html",
  "./app.js",
  "./style.css",
  "./bell.mp3",
  "./clock.svg",
  "./clock.png",
  "./manifest.json",
];

self.addEventListener("install", async (event) => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
});

async function cacheFirst(req) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(req);
  return cachedResponse || fetch(req);
}

self.addEventListener("fetch", async (event) => {
  const req = event.request;
  event.respondWith(cacheFirst(req));
});
