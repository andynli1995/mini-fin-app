'use client'

import { useState, useEffect } from 'react'
import { Subscription, Wallet } from '@prisma/client'
import { differenceInDays, format } from 'date-fns'
import { AlertCircle, Bell } from 'lucide-react'
import Link from 'next/link'

interface SubscriptionWithWallet extends Subscription {
  wallet: Wallet | null
}

interface RemindersBannerProps {
  subscriptions: SubscriptionWithWallet[]
}

export default function RemindersBanner({ subscriptions }: RemindersBannerProps) {
  const [reminderDays, setReminderDays] = useState(7)

  useEffect(() => {
    // Fetch reminder days setting
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setReminderDays(data.reminderDays || 7)
        }
      } catch (error) {
        console.error('Error fetching reminder days:', error)
      }
    }
    fetchSettings()
  }, [])

  const now = new Date()
  const upcomingSubscriptions = subscriptions.filter((sub) => {
    if (!sub.isActive) return false
    const daysUntil = differenceInDays(new Date(sub.nextDueDate), now)
    return daysUntil <= reminderDays && daysUntil >= 0
  })

  const overdueSubscriptions = subscriptions.filter((sub) => {
    if (!sub.isActive) return false
    const daysUntil = differenceInDays(new Date(sub.nextDueDate), now)
    return daysUntil < 0
  })

  if (upcomingSubscriptions.length === 0 && overdueSubscriptions.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {overdueSubscriptions.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 p-4 rounded-r-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">
                {overdueSubscriptions.length} Overdue Subscription{overdueSubscriptions.length !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                {overdueSubscriptions.map((sub) => sub.serviceName).join(', ')}
              </p>
            </div>
            <Link
              href="/subscriptions"
              className="text-sm font-medium text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-200 transition-colors"
            >
              View →
            </Link>
          </div>
        </div>
      )}

      {upcomingSubscriptions.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-500 dark:border-yellow-400 p-4 rounded-r-lg">
          <div className="flex items-center">
            <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                {upcomingSubscriptions.length} Upcoming Subscription{upcomingSubscriptions.length !== 1 ? 's' : ''} (Next {reminderDays} Days)
              </h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-400 mt-1 space-y-1">
                {upcomingSubscriptions.map((sub) => {
                  const daysUntil = differenceInDays(new Date(sub.nextDueDate), now)
                  return (
                    <li key={sub.id}>
                      {sub.serviceName} - ${Number(sub.amount).toFixed(2)} due{' '}
                      {daysUntil === 0
                        ? 'today'
                        : daysUntil === 1
                        ? 'tomorrow'
                        : `in ${daysUntil} days`}{' '}
                      ({format(new Date(sub.nextDueDate), 'MMM d')})
                    </li>
                  )
                })}
              </ul>
            </div>
            <Link
              href="/subscriptions"
              className="text-sm font-medium text-yellow-800 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-200 transition-colors"
            >
              View →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
