// Service Worker for Finance Manager PWA
const CACHE_NAME = 'finance-manager-v2'
const STATIC_CACHE_NAME = 'finance-manager-static-v2'

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

  // Skip non-GET requests
  if (request.method !== 'GET') {
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
