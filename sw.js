// Guarda la app en el teléfono para que abra sin conexión.
// Con conexión siempre carga la versión más nueva. Si agregas o quitas
// archivos de la app, actualiza APP_FILES y sube este número de versión.
const VERSION = 'v10';
const APP_CACHE = `volver-a-ti-${VERSION}`;
const FONT_CACHE = 'volver-a-ti-fonts';

const APP_FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'js/app.js',
  'js/astro.js',
  'js/calendar.js',
  'js/cycle.js',
  'js/data.js',
  'js/db.js',
  'js/lecturas.js',
  'js/lineart.js',
  'js/lock.js',
  'js/meds.js',
  'js/ui.js',
  'js/screens/biblioteca.js',
  'js/screens/bienvenida.js',
  'js/screens/carta.js',
  'js/screens/checkin.js',
  'js/screens/ciclo.js',
  'js/screens/cierre.js',
  'js/screens/cita.js',
  'js/screens/cuidado.js',
  'js/screens/diario.js',
  'js/screens/entrada.js',
  'js/screens/hoy.js',
  'js/screens/lectura.js',
  'js/screens/mapa.js',
  'js/screens/medicamento.js',
  'js/screens/movimiento.js',
  'js/screens/nutricion.js',
  'js/screens/pausa.js',
  'js/screens/perfil.js',
  'js/screens/registro.js',
  'js/screens/resumen.js',
  'js/screens/rituales.js',
  'js/screens/semana.js',
  'js/screens/universo.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(APP_CACHE).then((cache) => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== APP_CACHE && k !== FONT_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request).then((res) => { cache.put(request, res.clone()); return res; }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Primero la red, preguntando siempre si hay una versión nueva (sin esperar
  // los 10 minutos de caché de GitHub Pages); sin conexión, la copia guardada.
  event.respondWith(
    fetch(request, { cache: 'no-cache' })
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(APP_CACHE).then((cache) => cache.put(request, copy));
        }
        return res;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('index.html')))
  );
});
