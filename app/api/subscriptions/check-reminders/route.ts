import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { differenceInDays } from 'date-fns'

export async function GET() {
  try {
    // Get notification settings
    const settings = await prisma.appSettings.findFirst()
    const enableNotifications = settings?.enableNotifications ?? true
    const reminderDays = settings?.reminderDays || 7

    if (!enableNotifications) {
      return NextResponse.json({ subscriptions: [] })
    }

    // Get all active subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: {
        isActive: true,
      },
      include: {
        wallet: true,
      },
    })

    const now = new Date()
    const notifications: Array<{ id: string; title: string; body: string }> = []

    subscriptions.forEach((subscription) => {
      const daysUntil = differenceInDays(new Date(subscription.nextDueDate), now)

      // Check if subscription is due within reminder days
      if (daysUntil >= 0 && daysUntil <= reminderDays) {
        let title = ''
        let body = ''

        if (daysUntil === 0) {
          title = 'Subscription Due Today!'
          body = `${subscription.serviceName} - $${Number(subscription.amount).toFixed(2)} is due today`
        } else if (daysUntil === 1) {
          title = 'Subscription Due Tomorrow'
          body = `${subscription.serviceName} - $${Number(subscription.amount).toFixed(2)} is due tomorrow`
        } else if (daysUntil <= 3) {
          title = 'Subscription Due Soon'
          body = `${subscription.serviceName} - $${Number(subscription.amount).toFixed(2)} is due in ${daysUntil} days`
        } else {
          title = 'Upcoming Subscription'
          body = `${subscription.serviceName} - $${Number(subscription.amount).toFixed(2)} is due in ${daysUntil} days`
        }

        notifications.push({
          id: subscription.id,
          title,
          body,
        })
      } else if (daysUntil < 0) {
        // Overdue subscription
        notifications.push({
          id: subscription.id,
          title: 'Overdue Subscription!',
          body: `${subscription.serviceName} - $${Number(subscription.amount).toFixed(2)} is ${Math.abs(daysUntil)} day(s) overdue`,
        })
      }
    })

    return NextResponse.json({ subscriptions: notifications })
  } catch (error) {
    console.error('Error checking subscription reminders:', error)
    return NextResponse.json(
      { error: 'Failed to check reminders' },
      { status: 500 }
    )
  }
}
