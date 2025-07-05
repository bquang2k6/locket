// Service Worker for PWA - No caching to avoid chrome-extension errors
const CACHE_NAME = 'locket-wan-v3';

// Install event - minimal setup
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Fetch event - no caching, just pass through
self.addEventListener('fetch', event => {
  // Skip all non-HTTP requests immediately
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip external resources
  try {
    const url = new URL(event.request.url);
    if (url.hostname !== location.hostname) {
      return;
    }
  } catch (error) {
    return;
  }
  
  // For same-origin requests, just fetch without caching
  event.respondWith(
    fetch(event.request)
      .catch(error => {
        console.log('Fetch failed:', error);
        return new Response('Network error', { 
          status: 503,
          statusText: 'Service Unavailable'
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
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Locket Wan', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});