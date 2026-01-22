'use client'

import { useState } from 'react'
import { Subscription, Wallet } from '@prisma/client'
import { format, differenceInDays } from 'date-fns'
import { Calendar, AlertCircle, Trash2, CheckCircle, Edit } from 'lucide-react'
import SubscriptionForm from './SubscriptionForm'

interface SubscriptionWithWallet extends Omit<Subscription, 'amount'> {
  amount: number
  wallet: (Omit<Wallet, 'balance'> & { balance: number }) | null
}

interface WalletWithNumber extends Omit<Wallet, 'balance'> {
  balance: number
}

interface SubscriptionsListProps {
  subscriptions: SubscriptionWithWallet[]
  wallets: WalletWithNumber[]
}

export default function SubscriptionsList({ subscriptions, wallets }: SubscriptionsListProps) {
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionWithWallet | null>(null)
  const getDaysUntilDue = (date: Date) => {
    return differenceInDays(new Date(date), new Date())
  }

  const getUrgencyColor = (days: number, isActive: boolean) => {
    if (!isActive) return 'text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700'
    if (days <= 3) return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
    if (days <= 7) return 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30'
    return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
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

  // Mobile card view
  const MobileCard = ({ subscription }: { subscription: SubscriptionWithWallet }) => {
    const daysUntil = getDaysUntilDue(subscription.nextDueDate)
    const isOverdue = daysUntil < 0 && subscription.isActive

    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-4 mb-4 border border-gray-200 dark:border-slate-700">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{subscription.serviceName}</h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  subscription.isActive
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                }`}
              >
                {subscription.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              ${Number(subscription.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mb-2">{subscription.period}</p>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{format(new Date(subscription.nextDueDate), 'MMM d, yyyy')}</span>
            </div>
            {isOverdue && (
              <div className="flex items-center text-xs text-red-600 dark:text-red-400 mb-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                Overdue
              </div>
            )}
            {!isOverdue && subscription.isActive && daysUntil <= 7 && (
              <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400 mb-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                {daysUntil === 0
                  ? 'Due today'
                  : daysUntil === 1
                  ? 'Due tomorrow'
                  : `${daysUntil} days`}
              </div>
            )}
            {subscription.paymentMethod && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{subscription.paymentMethod}</p>
            )}
            {subscription.note && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subscription.note}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <button
              onClick={() => setEditingSubscription(subscription)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
              title="Edit subscription"
            >
              <Edit className="w-5 h-5" />
            </button>
            {subscription.isActive && subscription.walletId && (
              <button
                onClick={() => handleMarkPaid(subscription)}
                className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors"
                title="Mark as paid"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => handleDelete(subscription.id)}
              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
              title="Delete subscription"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Next Due
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Payment Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {subscriptions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No subscriptions yet. Add your first subscription to get started.
                </td>
              </tr>
            ) : (
              subscriptions.map((subscription) => {
                const daysUntil = getDaysUntilDue(subscription.nextDueDate)
                const isOverdue = daysUntil < 0 && subscription.isActive
                return (
                  <tr key={subscription.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {subscription.serviceName}
                      </div>
                      {subscription.note && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">{subscription.note}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                      ${Number(subscription.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {subscription.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {format(new Date(subscription.nextDueDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {isOverdue && (
                        <div className="flex items-center mt-1 text-xs text-red-600 dark:text-red-400">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Overdue
                        </div>
                      )}
                      {!isOverdue && subscription.isActive && daysUntil <= 7 && (
                        <div className="flex items-center mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {daysUntil === 0
                            ? 'Due today'
                            : daysUntil === 1
                            ? 'Due tomorrow'
                            : `${daysUntil} days`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {subscription.paymentMethod || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          subscription.isActive
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {subscription.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingSubscription(subscription)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                          title="Edit subscription"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {subscription.isActive && subscription.walletId && (
                          <button
                            onClick={() => handleMarkPaid(subscription)}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors"
                            title="Mark as paid"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(subscription.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                          title="Delete subscription"
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

      {/* Mobile Card View */}
      <div className="md:hidden p-4">
        {subscriptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No subscriptions yet. Add your first subscription to get started.
          </div>
        ) : (
          subscriptions.map((subscription) => (
            <MobileCard key={subscription.id} subscription={subscription} />
          ))
        )}
      </div>
      {editingSubscription && (
        <SubscriptionForm
          wallets={wallets}
          subscription={editingSubscription}
          onClose={() => setEditingSubscription(null)}
        />
      )}
    </div>
  )
}
