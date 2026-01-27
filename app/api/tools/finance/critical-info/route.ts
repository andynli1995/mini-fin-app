import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
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
    
    return NextResponse.json({
      primary: {
        label: 'Total Balance',
        value: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
        }).format(totalBalance),
        subtitle: hasMultipleCurrencies ? 'Multiple currencies' : `${wallets.length} wallet${wallets.length !== 1 ? 's' : ''}`,
      },
      alerts: alerts.length > 0 ? alerts : undefined,
    })
  } catch (error) {
    console.error('Error fetching finance info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch finance info' },
      { status: 500 }
    )
  }
}
