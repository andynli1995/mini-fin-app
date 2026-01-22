'use client'

import { useState, useEffect } from 'react'
import Navigation from './Navigation'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize sidebar state - open on desktop by default
  useEffect(() => {
    setMounted(true)
    
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
  }, [])

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebar-open', String(sidebarOpen))
    }
  }, [sidebarOpen, mounted])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navigation header */}
        <Navigation onMenuClick={toggleSidebar} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
