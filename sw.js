const CACHE_NAME = 'zero-api-v2';
const ASSETS = [
    './',
    './index.html',
    './manifest.json'
];

// Install - simpan aset ke cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate - hapus cache lama
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch - ambil dari cache dulu, kalau ga ada baru fetch internet
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cached) => {
                // Return cached atau fetch baru
                return cached || fetch(event.request)
                    .then((response) => {
                        // Simpan response baru ke cache
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                        return response;
                    });
            })
            .catch(() => {
                // Kalau offline & ga ada cache
                return new Response(
                    '<html><body style="background:#0f172a;color:white;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;text-align:center"><div><h1>📡</h1><h2>Kamu Offline</h2><p>Cek koneksi internet kamu ya</p></div></body></html>',
                    {
                        status: 503,
                        statusText: 'Offline',
                        headers: { 'Content-Type': 'text/html' }
                    }
                );
            })
    );
});
