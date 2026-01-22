// Service Worker for Finance Manager PWA
const CACHE_NAME = 'finance-manager-v3'
const STATIC_CACHE_NAME = 'finance-manager-static-v3'

// Static assets to cache on install
const staticAssets = [
  '/logo.svg',
  '/manifest.json',
]

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(staticAssets).catch((err) => {
        console.log('Cache addAll failed:', err)
      })
    })
  )
  // Force activation of new service worker
  self.skipWaiting()
})

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Explicitly forward non-GET requests (PUT, POST, DELETE, etc.) to network
  // This ensures API routes work correctly in production
  if (request.method !== 'GET') {
    // For API routes, always go to network
    if (url.pathname.startsWith('/api/')) {
      event.respondWith(fetch(request))
      return
    }
    // For other non-GET requests, let them pass through
    return
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // Network-first strategy for Next.js chunks and API routes
  if (
    url.pathname.startsWith('/_next/static/chunks/') ||
    url.pathname.startsWith('/_next/static/css/') ||
    url.pathname.startsWith('/api/')
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request)
        })
    )
    return
  }

  // Cache-first strategy for static assets
  if (
    url.pathname.startsWith('/logo.svg') ||
    url.pathname.startsWith('/manifest.json') ||
    url.pathname.startsWith('/icon-')
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          if (fetchResponse.status === 200) {
            const responseToCache = fetchResponse.clone()
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          return fetchResponse
        })
      })
    )
    return
  }

  // Network-first for HTML pages
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(request)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME
          })
          .map((cacheName) => caches.delete(cacheName))
      )
    })
  )
  // Take control of all clients immediately
  return self.clients.claim()
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url.includes('/subscriptions') && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/subscriptions')
      }
    })
  )
})

// Periodic background sync for subscription reminders (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-subscriptions') {
    event.waitUntil(checkSubscriptions())
  }
})

// Function to check subscriptions and send notifications
async function checkSubscriptions() {
  try {
    const response = await fetch('/api/subscriptions/check-reminders')
    if (response.ok) {
      const data = await response.json()
      if (data.subscriptions && data.subscriptions.length > 0) {
        data.subscriptions.forEach((sub) => {
          self.registration.showNotification(sub.title, {
            body: sub.body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: `subscription-${sub.id}`,
            requireInteraction: false,
            data: {
              url: '/subscriptions',
              subscriptionId: sub.id,
            },
          })
        })
      }
    }
  } catch (error) {
    console.error('Error checking subscriptions:', error)
  }
}

// Check subscriptions on service worker startup
checkSubscriptions()

// Set up periodic checks (every hour)
setInterval(() => {
  checkSubscriptions()
}, 60 * 60 * 1000) // 1 hour
