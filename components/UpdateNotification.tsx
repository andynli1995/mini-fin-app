'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, X } from 'lucide-react'

export default function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      let updateInterval: NodeJS.Timeout | null = null
      let registration: ServiceWorkerRegistration | null = null
      let handleUpdateFound: (() => void) | null = null
      let handleControllerChange: (() => void) | null = null

      // Check for updates every time the page loads
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          registration = reg
          setRegistration(reg)

          // Check for updates immediately
          reg.update()

          // Listen for updates
          handleUpdateFound = () => {
            const newWorker = reg.installing
            if (newWorker) {
              const handleStateChange = () => {
                // When the new service worker is installed and there's an active controller,
                // it means there's an update available
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setShowUpdate(true)
                }
              }
              newWorker.addEventListener('statechange', handleStateChange)
            }
          }
          reg.addEventListener('updatefound', handleUpdateFound)

          // Also check periodically (every 5 minutes)
          updateInterval = setInterval(() => {
            reg.update()
          }, 5 * 60 * 1000)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })

      // Listen for controller change (when a new service worker takes control)
      handleControllerChange = () => {
        // Reload the page to get the new version
        window.location.reload()
      }
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

      // Cleanup
      return () => {
        if (updateInterval) {
          clearInterval(updateInterval)
        }
        if (registration && handleUpdateFound) {
          registration.removeEventListener('updatefound', handleUpdateFound)
        }
        if (handleControllerChange) {
          navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
        }
      }
    }
  }, [])

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Tell the waiting service worker to skip waiting and activate
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    } else {
      // If no waiting worker, just reload
      window.location.reload()
    }
  }

  const handleDismiss = () => {
    setShowUpdate(false)
    // Don't show again for this session
    sessionStorage.setItem('update-dismissed', Date.now().toString())
  }

  // Don't show if dismissed in the last 5 minutes
  useEffect(() => {
    const dismissed = sessionStorage.getItem('update-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
      if (dismissedTime > fiveMinutesAgo) {
        setShowUpdate(false)
      }
    }
  }, [])

  if (!showUpdate) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[9999] animate-slide-up bg-blue-600 dark:bg-blue-700 text-white rounded-lg shadow-lg border border-blue-700 dark:border-blue-600 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw className="w-5 h-5" />
            <h3 className="font-semibold text-sm">Update Available</h3>
          </div>
          <p className="text-sm text-blue-100 dark:text-blue-200 mb-3">
            A new version of the app is available. Reload to get the latest features and improvements.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="flex-1 bg-white text-blue-600 dark:bg-blue-800 dark:text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-700 transition-colors"
            >
              Reload Now
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
