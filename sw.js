// sw.js - Service Worker para Rservas.Roma

const CACHE_NAME = 'rservas-roma-v1';
const urlsToCache = [
  '/Rservas.Roma/',
  '/Rservas.Roma/index.html',
  '/Rservas.Roma/admin.html',
  '/Rservas.Roma/admin-login.html',
  '/Rservas.Roma/super-admin.html',
  '/Rservas.Roma/manifest.json',
  '/Rservas.Roma/icons/icon-72x72.png',
  '/Rservas.Roma/icons/icon-96x96.png',
  '/Rservas.Roma/icons/icon-128x128.png',
  '/Rservas.Roma/icons/icon-144x144.png',
  '/Rservas.Roma/icons/icon-152x152.png',
  '/Rservas.Roma/icons/icon-192x192.png',
  '/Rservas.Roma/icons/icon-384x384.png',
  '/Rservas.Roma/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  console.log('📦 Service Worker instalando...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Cache creado');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('🔄 Service Worker activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Ignorar peticiones que no sean http/https
self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // Ignorar peticiones a Supabase (API)
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  // Ignorar peticiones a ntfy.sh (notificaciones)
  if (event.request.url.includes('ntfy.sh')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              if (event.request.method === 'GET') {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
            }
            return networkResponse;
          })
          .catch(error => {
            console.log('Error fetching:', error);
            return cachedResponse;
          });

        return cachedResponse || fetchPromise;
      })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('✅ Service Worker de Rservas.Roma configurado');