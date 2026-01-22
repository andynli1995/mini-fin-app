'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { useInstallPWA } from './useInstallPWA'

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const { install, canInstall, isInstalled, hasPrompt } = useInstallPWA()

  useEffect(() => {
    if (isInstalled) return

    // Show prompt after a delay if not dismissed
    const timer = setTimeout(() => {
      if (canInstall && !sessionStorage.getItem('pwa-prompt-dismissed')) {
        setShowPrompt(true)
      }
    }, 3000) // Show after 3 seconds

    return () => clearTimeout(timer)
  }, [canInstall, isInstalled])

  const handleInstallClick = async () => {
    await install()
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  // Don't show if already installed
  if (isInstalled) {
    return null
  }

  // Don't show if dismissed this session
  if (sessionStorage.getItem('pwa-prompt-dismissed') === 'true') {
    return null
  }

  // Show if we can install (either via prompt or manually)
  if (!showPrompt || !canInstall) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[9999] animate-slide-up">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Install Finance Manager
            </h3>
            <p className="text-xs text-gray-600">
              {hasPrompt
                ? 'Install this app on your device for quick access and a better experience.'
                : 'Add this app to your home screen for quick access.'}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            {hasPrompt ? 'Install' : 'Show Instructions'}
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
