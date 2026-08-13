// BharatTools service worker — offline shell caching.
// Strategy: cache-first for navigation, network-first for API/data.
const CACHE = "bt-shell-v1";

const PRECACHE = ["/", "/tools", "/form-guides", "/offline"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Only handle same-origin requests.
  if (url.origin !== self.location.origin) return;

  // Skip Next.js internal routes and API routes.
  if (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/api/")) return;

  e.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((res) => {
        // Cache navigations to make them available offline.
        if (request.mode === "navigate" && res.ok) {
          caches.open(CACHE).then((c) => c.put(request, res.clone()));
        }
        return res;
      }).catch(() => {
        // Network failed — return cached version or offline page.
        if (request.mode === "navigate") {
          return caches.match("/offline") || Response.error();
        }
        return Response.error();
      });

      // For navigations: try network first (get fresh), fall back to cache.
      // For assets: serve cache instantly, refresh in background.
      return request.mode === "navigate" ? network.catch(() => cached || Response.error()) : (cached || network);
    })
  );
});
