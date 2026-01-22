'use client'

import Link from 'next/link'
import { Menu, Lock } from 'lucide-react'
import { usePinLock } from './PinLock'
import Logo from './Logo'

interface NavigationProps {
  onMenuClick: () => void
}

export default function Navigation({ onMenuClick }: NavigationProps) {
  const { lockApp } = usePinLock()

  const handleLock = () => {
    lockApp()
  }

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-30 transition-colors">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          {/* Menu button for mobile and desktop */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 mr-3 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Logo */}
          <Link href="/" className="flex items-center" title="Finance Manager">
            <Logo size={40} className="text-blue-600 dark:text-blue-400" />
          </Link>
        </div>

        {/* Lock button - always visible */}
        <button
          onClick={handleLock}
          className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 transition-colors"
          title="Lock App"
        >
          <Lock className="w-5 h-5" />
        </button>
      </div>
    </nav>
  )
}
