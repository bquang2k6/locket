// Service Worker for PWA
const CACHE_NAME = 'locket-wan-v5';
const STATIC_CACHE = 'locket-wan-static-v5';
const DYNAMIC_CACHE = 'locket-wan-dynamic-v5';

// Files to cache
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/locket-pro.png',
  '/images/apple-touch-icon.png',
  '/images/prvlocket.png'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker install failed:', error);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
      .catch(error => {
        console.error('Service Worker activate failed:', error);
      })
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Handle API requests differently
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
  
  // For static files, try cache first
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
self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'Có nội dung mới từ Locket Wan!',
    icon: '/images/locket-pro.png',
    badge: '/images/locket-pro.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Mở ứng dụng'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Locket Wan', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message event for debugging
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});