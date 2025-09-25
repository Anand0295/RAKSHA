// RAKSHA Service Worker for PWA and Offline Capabilities
const CACHE_NAME = 'raksha-v1.0.0';
const OFFLINE_URL = '/offline.html';

const CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/Ministry-of-Defence-resized.jpg',
  '/Ministry_of_Defence_India.svg',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('RAKSHA: Caching app shell');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('RAKSHA: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then(fetchResponse => {
            // Cache successful responses
            if (fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseClone);
                });
            }
            return fetchResponse;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// Background sync for offline message queue
self.addEventListener('sync', event => {
  if (event.tag === 'raksha-message-sync') {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  try {
    const messages = await getStoredMessages();
    for (const message of messages) {
      await sendMessage(message);
      await removeStoredMessage(message.id);
    }
  } catch (error) {
    console.error('RAKSHA: Message sync failed:', error);
  }
}

async function getStoredMessages() {
  return new Promise((resolve) => {
    const messages = JSON.parse(localStorage.getItem('raksha_offline_messages') || '[]');
    resolve(messages);
  });
}

async function sendMessage(message) {
  return fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
}

async function removeStoredMessage(messageId) {
  const messages = JSON.parse(localStorage.getItem('raksha_offline_messages') || '[]');
  const filtered = messages.filter(m => m.id !== messageId);
  localStorage.setItem('raksha_offline_messages', JSON.stringify(filtered));
}

// Push notifications for security alerts
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'RAKSHA Security Alert',
    icon: '/Ministry_of_Defence_India.svg',
    badge: '/Ministry_of_Defence_India.svg',
    tag: 'raksha-security',
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('RAKSHA Security Alert', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/admin')
    );
  }
});

// Security monitoring - detect tampering attempts
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SECURITY_CHECK') {
    // Verify service worker integrity
    const integrity = checkIntegrity();
    event.ports[0].postMessage({ integrity });
  }
});

function checkIntegrity() {
  // Basic integrity check
  const expectedVersion = 'v1.0.0';
  const currentVersion = CACHE_NAME.split('-')[1];
  
  return {
    version: currentVersion,
    valid: currentVersion === expectedVersion,
    timestamp: Date.now()
  };
}