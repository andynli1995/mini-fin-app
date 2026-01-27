'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Navigation from './Navigation'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const isSettingsPage = pathname === '/settings'
  const shouldShowSidebar = !isHomePage && !isSettingsPage

  // Initialize sidebar state - open on desktop by default, but not on home page
  useEffect(() => {
    setMounted(true)
    
    // Always close sidebar on home page and settings page
    if (isHomePage || isSettingsPage) {
      setSidebarOpen(false)
      return
    }
    
    // Check if there's a saved preference
    const savedState = localStorage.getItem('sidebar-open')
    if (savedState !== null) {
      setSidebarOpen(savedState === 'true')
    } else {
      // Default: open on desktop (lg+), closed on mobile
      setSidebarOpen(window.innerWidth >= 1024)
    }

    // Handle window resize
    const handleResize = () => {
      // On mobile, always close sidebar when resizing to mobile
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isHomePage, isSettingsPage])

  // Save sidebar state to localStorage when it changes (but not on home page or settings)
  useEffect(() => {
    if (mounted && shouldShowSidebar) {
      localStorage.setItem('sidebar-open', String(sidebarOpen))
    }
  }, [sidebarOpen, mounted, shouldShowSidebar])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col transition-colors">
      {/* Navigation header */}
      <Navigation onMenuClick={toggleSidebar} />

      <div className="flex flex-1 min-w-0 overflow-hidden">
        {/* Sidebar - hidden on home page and settings page */}
        {shouldShowSidebar && <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />}

        {/* Page content - add left margin on desktop when sidebar is open */}
        <main className={`flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-900 transition-all duration-300 ${
          shouldShowSidebar && sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
