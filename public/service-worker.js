// Service Worker for PWA
const CACHE_VERSION = 'v6.2'; // Tăng version để force update
const CACHE_NAME = `locket-wan-${CACHE_VERSION}`;
const STATIC_CACHE = `locket-wan-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `locket-wan-dynamic-${CACHE_VERSION}`;

// Files to cache
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/snowlocket.png',
  '/cammera.jpg'
];

// Install event
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching static files...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker install failed:', error);
      })
  );
});

// Activate event - Xóa cache cũ và claim clients
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Xóa tất cả cache cũ
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated successfully');
        return self.clients.claim();
      })
      .catch(error => {
        console.error('Service Worker activate failed:', error);
      })
  );
});

// Fetch event với cache strategy cải tiến
self.addEventListener('fetch', event => {
  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle API requests - không cache API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return new Response(JSON.stringify({ error: 'Network error' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Network first strategy cho HTML files
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful responses
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache first strategy cho static assets
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then(response => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              })
              .catch(error => {
                console.error('Cache put failed:', error);
              });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            return new Response('Network error', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
      .catch(error => {
        console.error('Fetch event failed:', error);
        return new Response('Service Worker error', {
          status: 500,
          statusText: 'Internal Server Error'
        });
      })
  );
});

// Push notification event
self.addEventListener('push', function (event) {
  let data = { title: 'Locket Wan', body: 'Bạn có thông báo mới!' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/locket-icon.png',
    badge: data.badge || '/locket-icon.png',
    image: data.image || null, // Ảnh lớn (nếu có)
    vibrate: [200, 100, 200],
    tag: data.tag || 'general-link', // Tránh hiện trùng lặp
    renotify: true,
    data: {
      url: data.url || data?.data?.url || '/',
      dateOfArrival: Date.now()
    },
    actions: data.actions || [
      { action: 'open', title: 'Xem ngay' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const url = event.notification?.data?.url || '/';

  event.waitUntil(
    clients.openWindow(url)
  );
});


// Message event for debugging và force update
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Thêm message để clear cache
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});