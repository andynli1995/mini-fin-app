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
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl dark:shadow-2xl border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Install Finance Manager
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {hasPrompt
                ? 'Install this app on your device for quick access and a better experience.'
                : 'Add this app to your home screen for quick access.'}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 ml-2 flex-shrink-0 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            {hasPrompt ? 'Install' : 'Show Instructions'}
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-slate-800 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
