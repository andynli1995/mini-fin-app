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
        const { prisma } = await import('@/lib/prisma')
        
        // Parallelize queries for better performance
        const now = new Date()
        const sevenDaysFromNow = new Date(now)
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
        
        const [wallets, overdueSubscriptions, upcomingSubscriptions] = await Promise.all([
          prisma.wallet.findMany(),
          // Overdue subscriptions (nextDueDate < now)
          prisma.subscription.findMany({
            where: {
              isActive: true,
              nextDueDate: {
                lt: now,
              },
            },
            select: { id: true }, // Only need count, not full data
          }),
          // Upcoming subscriptions (nextDueDate between now and 7 days)
          prisma.subscription.findMany({
            where: {
              isActive: true,
              nextDueDate: {
                gte: now,
                lte: sevenDaysFromNow,
              },
            },
            select: { id: true }, // Only need count, not full data
          }),
        ])
        
        // Calculate total balance
        const totalBalance = wallets.reduce((sum, wallet) => sum + Number(wallet.balance), 0)
        const currency = wallets[0]?.currency || 'USD'
        const hasMultipleCurrencies = new Set(wallets.map(w => w.currency)).size > 1
        
        // Build alerts array
        const alerts: Array<{ label: string; count: number; urgent?: boolean }> = []
        
        if (overdueSubscriptions.length > 0) {
          alerts.push({
            label: 'Overdue Payments',
            count: overdueSubscriptions.length,
            urgent: true,
          })
        }
        
        if (upcomingSubscriptions.length > 0) {
          alerts.push({
            label: 'Upcoming (7 days)',
            count: upcomingSubscriptions.length,
            urgent: false,
          })
        }
        
        return {
          primary: {
            label: 'Total Balance',
            value: new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency,
            }).format(totalBalance),
            subtitle: hasMultipleCurrencies ? 'Multiple currencies' : `${wallets.length} wallet${wallets.length !== 1 ? 's' : ''}`,
          },
          alerts: alerts.length > 0 ? alerts : undefined,
        }
      } catch (error) {
        console.error('Error fetching finance info:', error)
        return null
      }
    },
  },
  // Interview Manager - coming soon
  // {
  //   id: 'interviews',
  //   name: 'Interview Manager',
  //   description: 'Track job applications, interviews, and follow-ups',
  //   icon: Briefcase,
  //   href: '/tools/interviews',
  //   color: 'purple',
  // },
  // Add more tools here as they're developed
]

export function getToolById(id: string): Tool | undefined {
  return tools.find(tool => tool.id === id)
}
