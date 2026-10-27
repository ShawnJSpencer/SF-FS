// SF-FS service worker: works offline in the basement, shows alerts.
const CACHE = 'sffs-v39';
const SHELL = ['./', 'index.html', 'app.js', 'insights.js', 'styles.js', 'reveals.js', 'config.js', 'seed.js', 'manifest.webmanifest', 'icons/tulip-180.png', 'icons/tulip-192.png', 'icons/tulip-512.png', 'icons/tulip-32.png'];

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// App files: network first (so updates arrive), cache as fallback. Fonts/libs/photos: cache first.
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // live data (database, sign-in, product lookups) always goes to the network; their pictures can be cached
  if (/firestore|googleapis\.com\/identitytoolkit|securetoken|world\.open(food|beauty|products)facts\.org|api\.upcitemdb/.test(url.href)) return;
  const sameOrigin = url.origin === location.origin;
  if (sameOrigin) {
    e.respondWith(fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
  } else if (req.mode === 'cors' && req.destination === '' && !/jsdelivr\.net/.test(url.href)) {
    return;   // the app copying a picture: go straight to the website (a saved no-cors copy can't be read)
  } else if (req.destination === 'image' || /fonts\.(googleapis|gstatic)|unpkg\.com|(cdn|fastly)\.jsdelivr\.net|gstatic\.com\/firebasejs|images\.open/.test(url.href)) {
    // pictures from any website: keep a copy on the phone after the first time
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r; })));
  }
});

self.addEventListener('push', e => {
  let d = {}; try { d = e.data.json(); } catch { d = { title: 'Food Storage', body: e.data?.text() }; }
  e.waitUntil(Promise.all([
    self.registration.showNotification(d.title || 'Food Storage', { body: d.body || '', icon: 'icons/tulip-192.png', badge: 'icons/tulip-32.png', tag: d.tag || 'sffs', data: { url: d.url || './' } }),
    d.badge != null && self.navigator.setAppBadge ? self.navigator.setAppBadge(d.badge).catch(() => {}) : null
  ]));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL(e.notification.data?.url || './', self.registration.scope).href;
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    const w = ws.find(w => w.url.startsWith(self.registration.scope));
    return w ? w.navigate(url).then(w => w.focus()) : clients.openWindow(url);
  }));
});
