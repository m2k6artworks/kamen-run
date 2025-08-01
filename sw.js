// Service Worker for KamenRun PWA
const CACHE_NAME = 'kamenrun-v1.0.0';
const urlsToCache = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache resources:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(error => {
          console.error('Fetch failed:', error);
          
          // Return offline page for navigation requests
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
          
          throw error;
        });
      })
  );
});

// Push notification event
self.addEventListener('push', event => {
  console.log('Push notification received:', event);
  
  let title = 'KamenRun - Waktunya Berlari! 🏃‍♂️';
  let body = 'Jangan lupa menyelesaikan jadwal lari hari ini!';
  let icon = './icons/icon-192x192.png';
  let badge = './icons/icon-72x72.png';
  
  if (event.data) {
    const data = event.data.json();
    title = data.title || title;
    body = data.body || body;
    icon = data.icon || icon;
    badge = data.badge || badge;
  }
  
  const options = {
    body: body,
    icon: icon,
    badge: badge,
    tag: 'daily-reminder',
    renotify: true,
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'Lihat Jadwal',
        icon: './icons/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Tutup'
      }
    ],
    data: {
      url: './index.html'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('./index.html')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default click action
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        for (let client of clientList) {
          if (client.url === self.location.origin + '/index.html' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('./index.html');
        }
      })
    );
  }
  
  // Send message to client
  event.waitUntil(
    clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'NOTIFICATION_CLICK',
          action: event.action
        });
      });
    })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync-data') {
    event.waitUntil(
      syncData()
    );
  }
});

async function syncData() {
  try {
    // Get pending data from IndexedDB or localStorage
    const pendingData = await getPendingData();
    
    if (pendingData && pendingData.length > 0) {
      // Sync data with server when online
      for (const data of pendingData) {
        await syncToServer(data);
      }
      
      // Clear pending data after successful sync
      await clearPendingData();
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getPendingData() {
  // Implementation would depend on your data storage strategy
  // For now, return empty array as we're using localStorage
  return [];
}

async function syncToServer(data) {
  // Implementation for syncing data to server
  // For now, just log the data
  console.log('Syncing data:', data);
}

async function clearPendingData() {
  // Clear pending data after successful sync
  console.log('Pending data cleared');
}

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection in service worker:', event.reason);
  event.preventDefault();
});

// Handle errors
self.addEventListener('error', event => {
  console.error('Service worker error:', event.error);
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
  if (event.tag === 'daily-motivation') {
    event.waitUntil(
      sendDailyMotivation()
    );
  }
});

async function sendDailyMotivation() {
  const motivationalQuotes = [
    "Langkah pertama adalah yang tersulit. Kamu sudah melewatinya! 💪",
    "Hari ini sakit, besok jadi kuat. Terus berlari! 🏃‍♂️",
    "Jangan ragu saat lelah, ragulah saat kamu berhenti. 🎯",
    "Satu-satunya lari yang buruk adalah yang tidak kamu lakukan. ✨",
    "Berlari adalah tentang dirimu sendiri. Kamu vs Kamu. 🔥"
  ];
  
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  
  await self.registration.showNotification('KamenRun Daily Motivation 🌟', {
    body: randomQuote,
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-72x72.png',
    tag: 'daily-motivation',
    actions: [
      {
        action: 'view',
        title: 'Lihat Jadwal'
      }
    ]
  });
} 