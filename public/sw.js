importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

const CACHE_NAME = 'turnos-peluqueria-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Registro de Background Sync
const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin('syncTurnos', {
  maxRetentionTime: 24 * 60 // Reintentar hasta por 24 horas
});

// Cachear assets estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Estrategia de red con fallback a caché y Background Sync para mutaciones
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Solo aplicar Background Sync a peticiones POST/PATCH/DELETE (mutaciones)
  if (request.method !== 'GET') {
    event.respondWith(
      fetch(request).catch((err) => {
        bgSyncPlugin.fetchDidFail({ request });
        throw err;
      })
    );
    return;
  }

  // Para GET, usar Cache First o Network First
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});

// Soporte para Notificaciones Push (100% Gratis)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Nuevo Mensaje', body: 'Tienes una actualización en tu turno.' };
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: { url: data.url || '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
