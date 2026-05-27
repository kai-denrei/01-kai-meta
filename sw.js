// sw.js — service worker for the kai-denrei catalogue.
//
// Caching is matched to the resource so the catalogue stays FRESH online and
// still works offline:
//   - HTML navigations + data/projects.json + bare js/css  -> network-first
//     (online users always see the latest cards; cache is the offline fallback)
//   - screenshots / cb-shapes / icons                       -> cache-first
//   - cross-origin fonts (Google Fonts)                     -> cache-first
//
// The cache name is keyed off the cb token carried in this worker's own URL
// (registered as ./sw.js?v=<token>). Bumping the token on deploy therefore
// rolls the cache AND makes the browser see a new worker -> the page surfaces a
// "New version available — Refresh" toast. We do NOT skipWaiting() on install;
// the swap happens only when the user accepts (or the badge triggers it).

const TOKEN = new URL(self.location.href).searchParams.get("v") || "dev";
const CACHE_NAME = `kai-meta-${TOKEN}`;

const BADGE_CELLS = /^[0-9a-f]{8}$/.test(TOKEN)
  ? [0, 1, 2].map(i => String(parseInt(TOKEN.slice(i * 2, i * 2 + 2), 16) % 64).padStart(2, "0"))
  : [];

// Critical shell only — screenshots are runtime-cached on demand (33+ of them).
const PRECACHE = [
  "./", "./?src=pwa", "./index.html",
  "./data/projects.json", `./data/projects.json?v=${TOKEN}`,
  "./cb-badge.js", `./cb-badge.js?v=${TOKEN}`,
  "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png",
  "./icons/maskable-192.png", "./icons/maskable-512.png", "./icons/apple-touch-icon.png",
  ...BADGE_CELLS.map(c => `./cb-shapes/${c}.svg`),
];

self.addEventListener("install", (event) => {
  // Resilient precache: a single 404 must not abort the whole install.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(PRECACHE.map((u) => cache.add(u)))
    )
  );
  // No skipWaiting() — wait for the user to accept the update.
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch (e) {}
    }
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function networkFirst(event, fallbackToShell) {
  const req = event.request;
  try {
    const preload = event.preloadResponse ? await event.preloadResponse : null;
    const fresh = preload || await fetch(req);
    caches.open(CACHE_NAME).then((c) => c.put(req, fresh.clone())).catch(() => {});
    return fresh;
  } catch (e) {
    const exact = await caches.match(req);
    if (exact) return exact;
    const loose = await caches.match(req, { ignoreSearch: true });
    if (loose) return loose;
    if (fallbackToShell) {
      const shell = (await caches.match("./?src=pwa")) || (await caches.match("./index.html")) || (await caches.match("./"));
      if (shell) return shell;
    }
    return new Response("offline", { status: 504, headers: { "Content-Type": "text/plain" } });
  }
}

async function cacheFirst(req) {
  const cached = await caches.match(req) || await caches.match(req, { ignoreSearch: true });
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh && (fresh.ok || fresh.type === "opaque")) {
      caches.open(CACHE_NAME).then((c) => c.put(req, fresh.clone())).catch(() => {});
    }
    return fresh;
  } catch (e) {
    return new Response("", { status: 504 });
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Cross-origin (Google Fonts css + font files) -> cache-first.
  if (!sameOrigin) {
    if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
      event.respondWith(cacheFirst(req));
    }
    return; // other cross-origin: let the browser handle it
  }

  // Static media -> cache-first.
  if (/\/(screenshots|cb-shapes|icons)\//.test(url.pathname) ||
      /\.(?:webp|png|svg|jpg|jpeg|gif|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Navigations, the data file, and bare code -> network-first (stay fresh).
  if (req.mode === "navigate" ||
      url.pathname.endsWith("/data/projects.json") ||
      /\.(?:js|mjs|css|json|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(networkFirst(event, req.mode === "navigate"));
    return;
  }

  // Default: network, fall back to any cached copy.
  event.respondWith((async () => {
    try { return await fetch(req); }
    catch (e) { return (await caches.match(req, { ignoreSearch: true })) || new Response("offline", { status: 504 }); }
  })());
});
