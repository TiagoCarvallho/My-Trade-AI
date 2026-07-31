// Service Worker para My Trade AI - Pro PWA
const CACHE_NAME = 'mytradeai-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo-novo.jpeg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable.png',
  '/icon-192.svg',
  '/icon-512.svg'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.log('SW cache addAll error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network First with Cache Fallback
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Ignore non-GET, API calls, browser extensions, or Vite HMR/@vite requests
  if (
    event.request.method !== 'GET' ||
    !url.startsWith('http') ||
    url.includes('/api/') ||
    url.includes('/@vite/') ||
    url.includes('/@react-refresh')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {});
          });
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        if (event.request.mode === 'navigate') {
          const indexResponse = await caches.match('/index.html');
          if (indexResponse) return indexResponse;
        }
        return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});
