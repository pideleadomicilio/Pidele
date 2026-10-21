/* Pídele · Service worker: guarda la app para abrir rápido y muestra las notificaciones con la app cerrada. */
const VERSION = 'pidele-v1.4.1';
const BASE = ['./', './index.html', './manifest.json', './firebase-config.js', './icons/icon-192.png', './icons/icon-512.png'];

/* ---------- Notificaciones (Firebase Cloud Messaging) ---------- */
try {
  importScripts('./firebase-config.js');
  if (self.FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey) {
    importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
      'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
    firebase.initializeApp(FIREBASE_CONFIG);
    firebase.messaging().onBackgroundMessage(p => mostrar(p.data || {}));
  }
} catch (e) { /* sin Firebase: la app sigue funcionando con actualizaciones al abrirla */ }

function mostrar(d) {
  return self.registration.showNotification(d.titulo || 'Pídele', {
    body: d.cuerpo || '', icon: './icons/icon-192.png', badge: './icons/icon-192.png',
    tag: d.tag || undefined, renotify: !!d.tag, vibrate: [200, 100, 200], data: { url: d.url || './' }
  });
}

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => {
    const abierta = l.find(c => c.url.startsWith(self.registration.scope));
    if (abierta) { abierta.postMessage({ abrir: url }); return abierta.focus(); }
    return clients.openWindow(url);
  }));
});

/* ---------- Caché de la app ---------- */
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  const propio = u.origin === self.location.origin;
  const libreria = u.hostname === 'cdnjs.cloudflare.com';
  if (!propio && !libreria) return; // servidor, mapas, Firebase e imágenes: directo a la red
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r.ok) { const copia = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copia)); }
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
