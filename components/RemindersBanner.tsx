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
  const now = new Date()
  const upcomingSubscriptions = subscriptions.filter((sub) => {
    if (!sub.isActive) return false
    const daysUntil = differenceInDays(new Date(sub.nextDueDate), now)
    return daysUntil <= 7 && daysUntil >= 0
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
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">
                {overdueSubscriptions.length} Overdue Subscription{overdueSubscriptions.length !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {overdueSubscriptions.map((sub) => sub.serviceName).join(', ')}
              </p>
            </div>
            <Link
              href="/subscriptions"
              className="text-sm font-medium text-red-800 hover:text-red-900"
            >
              View →
            </Link>
          </div>
        </div>
      )}

      {upcomingSubscriptions.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
          <div className="flex items-center">
            <Bell className="w-5 h-5 text-yellow-600 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-800">
                {upcomingSubscriptions.length} Upcoming Subscription{upcomingSubscriptions.length !== 1 ? 's' : ''} (Next 7 Days)
              </h3>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                {upcomingSubscriptions.map((sub) => {
                  const daysUntil = differenceInDays(new Date(sub.nextDueDate), now)
                  return (
                    <li key={sub.id}>
                      {sub.serviceName} - ${sub.amount.toFixed(2)} due{' '}
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
              className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
            >
              View →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
