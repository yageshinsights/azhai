// Azhai Boutique Service Worker
const CACHE_NAME = 'azhai-boutique-v3';

const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon.svg',
  '/logo-gold.png',
  '/logo-light.png',
  '/og-azhai.jpg',
  '/lotus.svg'
];

// Install Event - Pre-cache core brand icons & manifest
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('azhai-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network-First for Navigation & JS/CSS Bundles, Stale-While-Revalidate for Media/Fonts
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external APIs, Supabase, Cloudflare Workers, Payments
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('brevo.com') ||
    url.hostname.includes('payhere.lk') ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // 1. Navigation Requests & JS/CSS Bundles: Network-first with cache fallback
  const isCodeBundle =
    request.mode === 'navigate' ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    url.pathname.match(/\.(js|css)$/);

  if (isCodeBundle) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          if (request.mode === 'navigate') {
            const shell = await caches.match('/');
            return shell || new Response('Offline - Azhai Boutique', {
              headers: { 'Content-Type': 'text/html' }
            });
          }
          return new Response('', { status: 503 });
        })
    );
    return;
  }

  // 2. Static Media & Fonts (Images, Fonts): Stale-While-Revalidate
  const isStaticMedia =
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2|ttf)$/);

  if (isStaticMedia) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});
