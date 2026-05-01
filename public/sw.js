const CACHE_NAME = 'pandastore-v1';
const STATIC_CACHE = 'pandastore-static-v1';
const IMAGE_CACHE = 'pandastore-images-v1';
const API_CACHE = 'pandastore-api-v1';

// Assets that should be cached immediately
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/paw-logo.png',
  '/panda-logo.png',
  '/globals.css'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  // Cleanup old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![STATIC_CACHE, IMAGE_CACHE, API_CACHE].includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. API Calls (Network First, fallback to Cache)
  if (url.hostname.includes('pandas-store-api') || url.pathname.startsWith('/api/')) {
    if (event.request.method !== 'GET') return; // Don't cache POST/PUT/DELETE
    
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(API_CACHE).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 2. Images & Media (Stale-While-Revalidate)
  if (event.request.destination === 'image' || url.hostname.includes('cloudinary') || url.hostname.includes('unsplash') || url.hostname.includes('youtube')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          caches.open(IMAGE_CACHE).then((cache) => cache.put(event.request, networkResponse.clone()));
          return networkResponse;
        }).catch(() => null);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Next.js Static Assets (_next/static) (Cache First)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, networkResponse.clone()));
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. Default: Network First for HTML pages
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }
});
