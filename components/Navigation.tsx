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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          {/* Menu button for mobile and desktop */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Logo */}
          <Link href="/" className="flex items-center" title="Finance Manager">
            <Logo size={40} className="text-blue-600" />
          </Link>
        </div>

        {/* Lock button - always visible */}
        <button
          onClick={handleLock}
          className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          title="Lock App"
        >
          <Lock className="w-5 h-5" />
        </button>
      </div>
    </nav>
  )
}
