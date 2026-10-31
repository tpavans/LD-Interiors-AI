// LD Interiors Service Worker for PWA App Experience (v2.4.0)
const APP_VERSION = 'v2.4.0';
const CACHE_NAME = `ld-interiors-${APP_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png',
  '/logo.png',
  '/favicon.ico'
];

// Install event: Pre-cache essential offline shell and skip waiting immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up old cache versions & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Listen for manual update trigger messages from settings modal
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CHECK_VERSION') {
    event.ports[0]?.postMessage({ version: APP_VERSION });
  }
});

// Fetch event: Fast Cache-First for static assets, Stale-While-Revalidate for pages
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip caching for backend API and analytics calls
  if (
    url.pathname.startsWith('/api') ||
    url.hostname.includes('onrender.com') ||
    url.hostname.includes('analytics') ||
    url.hostname.includes('googletagmanager')
  ) {
    return;
  }

  // HTML / navigation requests: Fast Stale-While-Revalidate
  // Instant 0ms launch from cache, while updating fresh content in the background!
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('/').then((cached) => {
        const fetchPromise = fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/', clone));
          }
          return networkRes;
        }).catch(() => cached);

        // Return cached page instantly for 0ms open speed, or fallback to network
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Static images, icons, and assets: Stale-While-Revalidate with caching
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Default: Cache first with network fallback
  event.respondWith(
    caches.match(req).then((cached) => {
      return cached || fetch(req).catch(() => caches.match('/'));
    })
  );
});
