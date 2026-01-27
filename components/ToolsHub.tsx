'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { tools, type ToolCriticalInfo } from '@/lib/tools-registry'
import { ArrowRight, Sparkles } from 'lucide-react'

interface ToolCardProps {
  tool: typeof tools[0]
  criticalInfo: ToolCriticalInfo | null
  loading: boolean
}

function ToolCard({ tool, criticalInfo, loading }: ToolCardProps) {
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

  return (
    <Link
      href={tool.href}
      className={`group relative block p-6 rounded-xl border-2 transition-all duration-200 ${colorClass} transform hover:scale-[1.02] hover:shadow-lg`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg bg-white dark:bg-slate-800 ${iconColorClass}`}>
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
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            {criticalInfo.label}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {criticalInfo.value}
          </div>
          {criticalInfo.subtitle && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {criticalInfo.subtitle}
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

  useEffect(() => {
    const loadCriticalInfo = async () => {
      const newToolsData = new Map<string, ToolCriticalInfo | null>()
      const newLoading = new Map<string, boolean>()

      for (const tool of tools) {
        if (tool.getCriticalInfo) {
          newLoading.set(tool.id, true)
          setLoading(new Map(newLoading))

          try {
            const info = await tool.getCriticalInfo()
            newToolsData.set(tool.id, info)
          } catch (error) {
            console.error(`Error loading info for ${tool.id}:`, error)
            newToolsData.set(tool.id, null)
          } finally {
            newLoading.set(tool.id, false)
            setLoading(new Map(newLoading))
          }
        } else {
          newToolsData.set(tool.id, null)
        }
      }

      setToolsData(newToolsData)
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
