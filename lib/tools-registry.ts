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
}

export interface ToolCriticalInfo {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
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
        const { prisma } = await import('@/lib/prisma')
        const wallets = await prisma.wallet.findMany()
        const totalBalance = wallets.reduce((sum, wallet) => sum + Number(wallet.balance), 0)
        const currency = wallets[0]?.currency || 'USD'
        const hasMultipleCurrencies = new Set(wallets.map(w => w.currency)).size > 1
        
        return {
          label: 'Total Balance',
          value: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
          }).format(totalBalance),
          subtitle: hasMultipleCurrencies ? 'Multiple currencies' : `${wallets.length} wallet${wallets.length !== 1 ? 's' : ''}`,
        }
      } catch (error) {
        console.error('Error fetching finance info:', error)
        return null
      }
    },
  },
  {
    id: 'interviews',
    name: 'Interview Manager',
    description: 'Track job applications, interviews, and follow-ups',
    icon: Briefcase,
    href: '/tools/interviews',
    color: 'purple',
    // getCriticalInfo will be implemented when the interviews app is built
  },
  // Add more tools here as they're developed
]

export function getToolById(id: string): Tool | undefined {
  return tools.find(tool => tool.id === id)
}
