'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (typeof window === 'undefined') return

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if app was previously installed
    if (localStorage.getItem('pwa-installed') === 'true') {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setCanInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Also set canInstall to true for manual install instructions
    setCanInstall(true)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const install = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
          localStorage.setItem('pwa-installed', 'true')
          setIsInstalled(true)
        }

        setDeferredPrompt(null)
        return outcome === 'accepted'
      } catch (error) {
        console.error('Error showing install prompt:', error)
        return false
      }
    } else {
      // Manual install instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const isAndroid = /Android/.test(navigator.userAgent)

      let message = ''
      if (isIOS) {
        message =
          'To install this app:\n\n' +
          '1. Tap the Share button (square with arrow)\n' +
          '2. Scroll down and tap "Add to Home Screen"\n' +
          '3. Tap "Add" to confirm'
      } else if (isAndroid) {
        message =
          'To install this app:\n\n' +
          '1. Tap the menu (3 dots) in your browser\n' +
          '2. Select "Install app" or "Add to Home screen"\n' +
          '3. Confirm the installation'
      } else {
        message =
          'To install this app:\n\n' +
          'Look for the install icon in your browser\'s address bar, or:\n' +
          '- Chrome/Edge: Click the install icon (⊕) in the address bar\n' +
          '- Firefox: Not supported\n' +
          '- Safari: Use File > Add to Dock (macOS)'
      }

      alert(message)
      return false
    }
  }

  return {
    install,
    canInstall: canInstall && !isInstalled,
    isInstalled,
    hasPrompt: !!deferredPrompt,
  }
}
