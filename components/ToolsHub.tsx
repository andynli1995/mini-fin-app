'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { tools, type ToolCriticalInfo } from '@/lib/tools-registry'
import { ArrowRight, Sparkles, AlertCircle, Bell, Eye, EyeOff } from 'lucide-react'

interface ToolCardProps {
  tool: typeof tools[0]
  criticalInfo: ToolCriticalInfo | null
  loading: boolean
  hideBalancesByDefault?: boolean
}

function ToolCard({ tool, criticalInfo, loading, hideBalancesByDefault = false }: ToolCardProps) {
  const Icon = tool.icon
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300',
    orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  }

  const iconColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    green: 'text-green-600 dark:text-green-400',
    orange: 'text-orange-600 dark:text-orange-400',
  }

  const colorClass = colorClasses[tool.color as keyof typeof colorClasses] || colorClasses.blue
  const iconColorClass = iconColorClasses[tool.color as keyof typeof iconColorClasses] || iconColorClasses.blue

  // Check if there are urgent alerts
  const hasUrgentAlerts = criticalInfo?.alerts?.some(alert => alert.urgent) || false
  const hasAlerts = (criticalInfo?.alerts?.length || 0) > 0
  const urgentCount = criticalInfo?.alerts?.filter(alert => alert.urgent).reduce((sum, alert) => sum + alert.count, 0) || 0
  const totalAlertCount = criticalInfo?.alerts?.reduce((sum, alert) => sum + alert.count, 0) || 0

  // Check if the primary value is a balance (contains currency symbols)
  const isBalanceValue = criticalInfo?.primary?.value && 
    (typeof criticalInfo.primary.value === 'string' && 
     (criticalInfo.primary.value.includes('$') || 
      criticalInfo.primary.value.match(/[A-Z]{3}\s*[\d,]+/))) // Currency code + number pattern

  // State for balance visibility toggle (only for finance tool)
  const [isBalanceHidden, setIsBalanceHidden] = useState(() => {
    if (tool.id === 'finance' && isBalanceValue) {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('hideBalances')
        if (stored !== null) {
          return stored === 'true'
        }
      }
      return hideBalancesByDefault
    }
    return false
  })

  useEffect(() => {
    if (tool.id === 'finance' && isBalanceValue) {
      setIsBalanceHidden(hideBalancesByDefault)
      localStorage.setItem('hideBalances', hideBalancesByDefault ? 'true' : 'false')
    }
  }, [hideBalancesByDefault, tool.id, isBalanceValue])

  const toggleBalanceVisibility = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (tool.id === 'finance' && isBalanceValue) {
      const newHidden = !isBalanceHidden
      setIsBalanceHidden(newHidden)
      localStorage.setItem('hideBalances', newHidden ? 'true' : 'false')
    }
  }

  return (
    <Link
      href={tool.href}
      className={`group relative block p-6 rounded-xl border-2 transition-all duration-200 ${colorClass} transform hover:scale-[1.02] hover:shadow-lg ${
        hasUrgentAlerts 
          ? 'ring-2 ring-red-500 dark:ring-red-400 ring-offset-2 dark:ring-offset-slate-900 border-red-300 dark:border-red-700' 
          : hasAlerts 
          ? 'ring-1 ring-yellow-400 dark:ring-yellow-500 border-yellow-300 dark:border-yellow-700'
          : ''
      }`}
    >
      {/* Urgent Alert Badge */}
      {hasUrgentAlerts && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500 dark:bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
          <AlertCircle className="w-3 h-3" />
          <span>{urgentCount}</span>
        </div>
      )}
      
      {/* Alert Badge (non-urgent) */}
      {hasAlerts && !hasUrgentAlerts && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-yellow-500 dark:bg-yellow-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
          <Bell className="w-3 h-3" />
          <span>{totalAlertCount}</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-white dark:bg-slate-800 ${iconColorClass} relative`}>
          <Icon className="w-8 h-8" />
        </div>
        <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
        {tool.name}
      </h3>
      <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">
        {tool.description}
      </p>

      {loading ? (
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
        </div>
      ) : criticalInfo ? (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {/* Primary Info */}
          {criticalInfo.primary && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {criticalInfo.primary.label}
                </div>
                {tool.id === 'finance' && isBalanceValue && (
                  <button
                    onClick={toggleBalanceVisibility}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-0.5"
                    aria-label={isBalanceHidden ? 'Show balance' : 'Hide balance'}
                  >
                    {isBalanceHidden ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
              <div className={`text-2xl font-bold ${
                criticalInfo.primary.urgent 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-900 dark:text-gray-100'
              }`}>
                {tool.id === 'finance' && isBalanceValue && isBalanceHidden
                  ? '••••••'
                  : criticalInfo.primary.value}
              </div>
              {criticalInfo.primary.subtitle && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {criticalInfo.primary.subtitle}
                </div>
              )}
            </div>
          )}
          
          {/* Secondary Info */}
          {criticalInfo.secondary && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {criticalInfo.secondary.label}
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {criticalInfo.secondary.value}
              </div>
              {criticalInfo.secondary.subtitle && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {criticalInfo.secondary.subtitle}
                </div>
              )}
            </div>
          )}
          
          {/* Alerts - More prominent display */}
          {criticalInfo.alerts && criticalInfo.alerts.length > 0 && (
            <div className="pt-3 border-t-2 border-gray-300 dark:border-gray-600 space-y-2">
              {criticalInfo.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2.5 rounded-lg ${
                    alert.urgent
                      ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 shadow-sm'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {alert.urgent ? (
                      <AlertCircle className={`w-4 h-4 ${
                        alert.urgent
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`} />
                    ) : (
                      <Bell className={`w-4 h-4 ${
                        alert.urgent
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-yellow-600 dark:text-yellow-400'
                      }`} />
                    )}
                    <span className={`text-xs font-semibold ${
                      alert.urgent
                        ? 'text-red-800 dark:text-red-200'
                        : 'text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {alert.label}
                    </span>
                  </div>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                    alert.urgent
                      ? 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100'
                      : 'bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100'
                  }`}>
                    {alert.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </Link>
  )
}

export default function ToolsHub() {
  const [toolsData, setToolsData] = useState<Map<string, ToolCriticalInfo | null>>(new Map())
  const [loading, setLoading] = useState<Map<string, boolean>>(new Map())
  const [hideBalancesByDefault, setHideBalancesByDefault] = useState(false)

  useEffect(() => {
    // Load settings to check hideBalancesByDefault
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setHideBalancesByDefault(data.hideBalancesByDefault || false)
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }

    loadSettings()
  }, [])

  useEffect(() => {
    const loadCriticalInfo = async () => {
      const newToolsData = new Map<string, ToolCriticalInfo | null>()
      const newLoading = new Map<string, boolean>()

      // Set all tools to loading
      tools.forEach(tool => {
        if (tool.getCriticalInfo) {
          newLoading.set(tool.id, true)
        }
      })
      setLoading(new Map(newLoading))

      // Load all tools in parallel for better performance
      const toolPromises = tools.map(async (tool) => {
        if (tool.getCriticalInfo) {
          try {
            const info = await tool.getCriticalInfo()
            return { toolId: tool.id, info }
          } catch (error) {
            console.error(`Error loading info for ${tool.id}:`, error)
            return { toolId: tool.id, info: null }
          }
        }
        return { toolId: tool.id, info: null }
      })

      const results = await Promise.all(toolPromises)
      
      // Update data
      results.forEach(({ toolId, info }) => {
        newToolsData.set(toolId, info)
        newLoading.set(toolId, false)
      })

      setToolsData(newToolsData)
      setLoading(new Map(newLoading))
    }

    loadCriticalInfo()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Solo Entrepreneur Toolkit
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          All-in-one platform to manage your business, finances, and productivity tools
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            criticalInfo={toolsData.get(tool.id) || null}
            loading={loading.get(tool.id) || false}
            hideBalancesByDefault={hideBalancesByDefault}
          />
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          More tools coming soon...
        </p>
      </div>
    </div>
  )
}
