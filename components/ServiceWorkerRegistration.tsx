'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      let updateInterval: NodeJS.Timeout | null = null
      let registration: ServiceWorkerRegistration | null = null

      // Register service worker
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          registration = reg
          console.log('Service Worker registered:', reg)
          
          // Check for updates periodically (every 5 minutes)
          updateInterval = setInterval(() => {
            reg.update()
          }, 5 * 60 * 1000)

          // Also check when page becomes visible (user returns to app)
          const handleVisibilityChange = () => {
            if (!document.hidden) {
              reg.update()
            }
          }
          document.addEventListener('visibilitychange', handleVisibilityChange)

          // Cleanup function
          return () => {
            if (updateInterval) {
              clearInterval(updateInterval)
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange)
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })

      // Cleanup on unmount
      return () => {
        if (updateInterval) {
          clearInterval(updateInterval)
        }
      }
    }
  }, [])

  return null
}
