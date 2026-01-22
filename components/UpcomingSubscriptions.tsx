import { Subscription, Wallet } from '@prisma/client'
import { format, differenceInDays } from 'date-fns'
import Link from 'next/link'
import { Calendar, AlertCircle } from 'lucide-react'

interface SubscriptionWithWallet extends Subscription {
  wallet: Wallet | null
}

interface UpcomingSubscriptionsProps {
  subscriptions: SubscriptionWithWallet[]
}

export default function UpcomingSubscriptions({ subscriptions }: UpcomingSubscriptionsProps) {
  const getDaysUntilDue = (date: Date) => {
    return differenceInDays(new Date(date), new Date())
  }

  const getUrgencyColor = (days: number) => {
    if (days <= 3) return 'text-red-600 bg-red-50'
    if (days <= 7) return 'text-yellow-600 bg-yellow-50'
    return 'text-blue-600 bg-blue-50'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Upcoming Subscriptions</h2>
        <Link href="/subscriptions" className="text-sm text-blue-600 hover:text-blue-800">
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {subscriptions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No upcoming subscriptions</p>
        ) : (
          subscriptions.map((subscription) => {
            const daysUntil = getDaysUntilDue(subscription.nextDueDate)
            return (
              <div
                key={subscription.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`p-2 rounded-full ${getUrgencyColor(daysUntil)}`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{subscription.serviceName}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(subscription.nextDueDate), 'MMM d, yyyy')}
                      {subscription.wallet && ` • ${subscription.wallet.name}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${subscription.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  {daysUntil <= 7 && (
                    <div className="flex items-center justify-end mt-1">
                      <AlertCircle className="w-3 h-3 text-red-500 mr-1" />
                      <p className="text-xs text-red-600">
                        {daysUntil === 0
                          ? 'Due today'
                          : daysUntil === 1
                          ? 'Due tomorrow'
                          : `${daysUntil} days`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
