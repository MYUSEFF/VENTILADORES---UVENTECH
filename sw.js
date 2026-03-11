// ============================================================
// UVENTECH S.A. — Service Worker
// Selector de Ventiladores Industriales
// © 2025 UVENTECH S.A. Todos los derechos reservados.
// ============================================================

// Incrementar VERSION cada vez que subís una actualización a GitHub
const VERSION = '1.0.2';
const CACHE_NAME = `uventech-ventiladores-v${VERSION}`;

const ASSETS = [
  './selector_ventiladores_MAA.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700;900&family=Barlow:wght@300;400;500&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js'
];

// Instalar: pre-cachear todos los assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()) // activar sin esperar cierre de pestaña
  );
});

// Activar: eliminar caches viejas y tomar control inmediato
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first para el HTML (siempre busca la versión más nueva),
// cache-first para recursos estáticos (fonts, librerías)
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isMainApp = url.pathname.endsWith('selector_ventiladores_MAA.html');

  if (isMainApp) {
    // Intenta bajar la versión más nueva; si no hay conexión usa la cache
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache-first para fonts y librerías
    event.respondWith(
      caches.match(event.request)
        .then(cached => cached || fetch(event.request)
          .then(response => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            return response;
          })
        )
        .catch(() => caches.match('./selector_ventiladores_MAA.html'))
    );
  }
});
