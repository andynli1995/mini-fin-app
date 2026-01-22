'use client'

import { useEffect, useState } from 'react'

export default function NotificationService() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true)
      setPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    if (!isSupported || permission !== 'granted') return

    // Request notification permission if not granted
    if (permission === 'default') {
      Notification.requestPermission().then((result) => {
        setPermission(result)
      })
    }

    // Set up periodic subscription checks
    const checkSubscriptions = async () => {
      try {
        const response = await fetch('/api/subscriptions/check-reminders')
        if (response.ok) {
          const data = await response.json()
          if (data.subscriptions && data.subscriptions.length > 0) {
            // Check if we've already shown notifications for these today
            const today = new Date().toDateString()
            const lastCheck = localStorage.getItem('lastNotificationCheck')
            
            if (lastCheck !== today) {
              data.subscriptions.forEach((sub: any) => {
                // Check if we've already notified for this subscription today
                const notificationKey = `notified-${sub.id}-${today}`
                if (!localStorage.getItem(notificationKey)) {
                  new Notification(sub.title, {
                    body: sub.body,
                    icon: '/icon-192.png',
                    badge: '/icon-192.png',
                    tag: `subscription-${sub.id}`,
                    requireInteraction: false,
                  })
                  localStorage.setItem(notificationKey, 'true')
                }
              })
              localStorage.setItem('lastNotificationCheck', today)
            }
          }
        }
      } catch (error) {
        console.error('Error checking subscriptions:', error)
      }
    }

    // Check immediately
    checkSubscriptions()

    // Set up interval to check every hour
    const interval = setInterval(checkSubscriptions, 60 * 60 * 1000)

    // Also check when page becomes visible (user returns to app)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkSubscriptions()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isSupported, permission])

  return null // This component doesn't render anything
}
