import React from 'react'
import { Wallet, TrendingUp, Briefcase } from 'lucide-react'

export interface Tool {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  color: string
  getCriticalInfo?: () => Promise<ToolCriticalInfo | null>
  getSettingsComponent?: () => React.ComponentType<any> | null
}

export interface ToolCriticalInfo {
  primary?: {
    label: string
    value: string | number
    urgent?: boolean
    subtitle?: string
  }
  secondary?: {
    label: string
    value: string | number
    subtitle?: string
  }
  alerts?: Array<{
    label: string
    count: number
    urgent?: boolean
  }>
}

// Tools registry - easily extensible for new apps
export const tools: Tool[] = [
  {
    id: 'finance',
    name: 'Finance Manager',
    description: 'Manage expenses, income, subscriptions, and wallets',
    icon: Wallet,
    href: '/tools/finance',
    color: 'blue',
    getCriticalInfo: async () => {
      try {
        const response = await fetch('/api/tools/finance/critical-info')
        if (response.ok) {
          return await response.json()
        }
        return null
      } catch (error) {
        console.error('Error fetching finance info:', error)
        return null
      }
    },
  },
  {
    id: 'interviews',
    name: 'Interview Manager',
    description: 'Track job applications, interviews, and assessments',
    icon: Briefcase,
    href: '/tools/interviews',
    color: 'purple',
    getCriticalInfo: async () => {
      try {
        const response = await fetch('/api/tools/interviews/critical-info')
        if (response.ok) {
          return await response.json()
        }
        return null
      } catch (error) {
        console.error('Error fetching interview info:', error)
        return null
      }
    },
  },
  // Add more tools here as they're developed
]

export function getToolById(id: string): Tool | undefined {
  return tools.find(tool => tool.id === id)
}
