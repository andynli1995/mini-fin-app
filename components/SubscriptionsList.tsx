'use client'

import { Subscription, Wallet } from '@prisma/client'
import { format, differenceInDays } from 'date-fns'
import { Calendar, AlertCircle, Trash2, CheckCircle } from 'lucide-react'

interface SubscriptionWithWallet extends Subscription {
  wallet: Wallet | null
}

interface SubscriptionsListProps {
  subscriptions: SubscriptionWithWallet[]
  wallets: Wallet[]
}

export default function SubscriptionsList({ subscriptions, wallets }: SubscriptionsListProps) {
  const getDaysUntilDue = (date: Date) => {
    return differenceInDays(new Date(date), new Date())
  }

  const getUrgencyColor = (days: number, isActive: boolean) => {
    if (!isActive) return 'text-gray-400 bg-gray-50'
    if (days <= 3) return 'text-red-600 bg-red-50'
    if (days <= 7) return 'text-yellow-600 bg-yellow-50'
    return 'text-blue-600 bg-blue-50'
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription?')) return

    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to delete subscription')
      }
    } catch (error) {
      alert('Failed to delete subscription')
    }
  }

  const handleMarkPaid = async (subscription: SubscriptionWithWallet) => {
    try {
      // Create a transaction for the subscription payment
      if (!subscription.walletId) {
        alert('Please assign a wallet to this subscription first')
        return
      }

      const response = await fetch('/api/subscriptions/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.id,
        }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to mark as paid')
      }
    } catch (error) {
      alert('Failed to mark as paid')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Due
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No subscriptions yet. Add your first subscription to get started.
                </td>
              </tr>
            ) : (
              subscriptions.map((subscription) => {
                const daysUntil = getDaysUntilDue(subscription.nextDueDate)
                const isOverdue = daysUntil < 0 && subscription.isActive
                return (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscription.serviceName}
                      </div>
                      {subscription.note && (
                        <div className="text-sm text-gray-500">{subscription.note}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${subscription.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {subscription.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {format(new Date(subscription.nextDueDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {isOverdue && (
                        <div className="flex items-center mt-1 text-xs text-red-600">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Overdue
                        </div>
                      )}
                      {!isOverdue && subscription.isActive && daysUntil <= 7 && (
                        <div className="flex items-center mt-1 text-xs text-yellow-600">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {daysUntil === 0
                            ? 'Due today'
                            : daysUntil === 1
                            ? 'Due tomorrow'
                            : `${daysUntil} days`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscription.paymentMethod || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          subscription.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {subscription.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {subscription.isActive && subscription.walletId && (
                          <button
                            onClick={() => handleMarkPaid(subscription)}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as paid"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(subscription.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
