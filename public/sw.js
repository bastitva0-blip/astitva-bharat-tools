// BharatTools service worker — full offline support.
//
// Strategy:
//   /_next/static/  → cache-first (immutable hashed assets)
//   navigations     → network-first, cache fallback → /offline
//   everything else → network-first, cache fallback

const STATIC_CACHE = "bt-static-v1";
const PAGES_CACHE  = "bt-pages-v1";

// Pre-cache the offline fallback only; everything else is cached on first visit.
const PRECACHE_URLS = ["/offline"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(PAGES_CACHE)
      .then((c) => c.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  const keep = new Set([STATIC_CACHE, PAGES_CACHE]);
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Skip Next.js RSC / internal runtime pings.
  if (url.searchParams.has("_rsc")) return;
  if (url.pathname.startsWith("/api/")) return;

  // /_next/static/ — immutable hashed assets, cache-first forever.
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      })
    );
    return;
  }

  // Navigations and everything else — network-first, cache on success.
  e.respondWith(
    caches.open(PAGES_CACHE).then(async (cache) => {
      try {
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      } catch {
        const cached = await cache.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          return cache.match("/offline") ?? Response.error();
        }
        return Response.error();
      }
    })
  );
});
