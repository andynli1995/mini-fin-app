'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Lock, Sun, Moon, Monitor } from 'lucide-react'
import { usePinLock } from './PinLock'
import { useTheme } from './ThemeProvider'
import Logo from './Logo'

interface NavigationProps {
  onMenuClick: () => void
}

export default function Navigation({ onMenuClick }: NavigationProps) {
  const { lockApp } = usePinLock()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  const handleLock = () => {
    lockApp()
  }

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-30 transition-colors">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          {/* Menu button for mobile and desktop - hidden on home page */}
          {!isHomePage && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 mr-3 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          
          {/* Logo */}
          <Link href="/" className="flex items-center" title="Solo Entrepreneur Toolkit">
            <Logo size={40} className="text-blue-600 dark:text-blue-400" />
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          {/* Theme toggle buttons */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-md transition-colors ${
                theme === 'light'
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="Light theme"
              aria-label="Light theme"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-md transition-colors ${
                theme === 'dark'
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="Dark theme"
              aria-label="Dark theme"
            >
              <Moon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-md transition-colors ${
                theme === 'system'
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="System theme"
              aria-label="System theme"
            >
              <Monitor className="w-4 h-4" />
            </button>
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
      </div>
    </nav>
  )
}
