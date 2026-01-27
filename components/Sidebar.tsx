'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wallet, Receipt, Calendar, BarChart3, Settings, Settings2, X, ArrowLeft, Grid3x3, Briefcase, FileText, User } from 'lucide-react'

const financeNavItems = [
  { href: '/tools/finance', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tools/finance/transactions', label: 'Transactions', icon: Receipt },
  { href: '/tools/finance/subscriptions', label: 'Subscriptions', icon: Calendar },
  { href: '/tools/finance/wallets', label: 'Wallets', icon: Wallet },
  { href: '/tools/finance/reports', label: 'Reports', icon: BarChart3 },
  { href: '/tools/finance/categories', label: 'Categories', icon: Settings },
]

const interviewNavItems = [
  { href: '/tools/interviews', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tools/interviews/interviews', label: 'Interviews', icon: Calendar },
  { href: '/tools/interviews/assessments', label: 'Assessments', icon: FileText },
  { href: '/tools/interviews/companies', label: 'Companies', icon: Briefcase },
  { href: '/tools/interviews/profiles', label: 'Profiles', icon: User },
]

// Legacy nav items for backward compatibility (redirect to finance routes)
const legacyNavItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
  { href: '/subscriptions', label: 'Subscriptions', icon: Calendar },
  { href: '/wallets', label: 'Wallets', icon: Wallet },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/categories', label: 'Categories', icon: Settings },
  { href: '/settings', label: 'Settings', icon: Settings2 },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const isFinanceRoute = pathname?.startsWith('/tools/finance') || pathname === '/transactions' || pathname === '/wallets' || pathname === '/subscriptions' || pathname === '/reports' || pathname === '/categories' || pathname === '/settings'
  const isInterviewRoute = pathname?.startsWith('/tools/interviews')
  
  let navItems: typeof financeNavItems = []
  if (isFinanceRoute) {
    navItems = financeNavItems
  } else if (isInterviewRoute) {
    navItems = interviewNavItems
  }

  // Only close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose()
    }
  }

  return (
    <>
      {/* Overlay for mobile - starts below header */}
      {isOpen && (
        <div
          className="fixed top-16 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 z-50 transform transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:fixed lg:top-16 lg:z-40 w-64 flex-shrink-0 ${
          !isOpen ? 'lg:hidden' : ''
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button for mobile */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-2">
              {/* Back to Tools link when in a tool */}
              {isFinanceRoute && (
                <Link
                  href="/"
                  onClick={handleLinkClick}
                  className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white mb-2 border-b border-gray-200 dark:border-slate-700 pb-2"
                >
                  <ArrowLeft className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Back to Tools</span>
                </Link>
              )}

              {/* Finance navigation items */}
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href === '/tools/finance' && pathname === '/tools/finance')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500 dark:border-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>
      </aside>
    </>
  )
}
