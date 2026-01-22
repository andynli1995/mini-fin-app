'use client'

import { useState, useEffect } from 'react'
import { Wallet, Subscription } from '@prisma/client'
import { Plus, X } from 'lucide-react'
import { addMonths, addWeeks, addDays, addYears } from 'date-fns'

interface SubscriptionWithWallet extends Omit<Subscription, 'amount'> {
  amount: number
  wallet: (Omit<Wallet, 'balance'> & { balance: number }) | null
}

interface WalletWithNumber extends Omit<Wallet, 'balance'> {
  balance: number
}

interface SubscriptionFormProps {
  wallets: WalletWithNumber[]
  subscription?: SubscriptionWithWallet
  onClose?: () => void
}

export default function SubscriptionForm({ wallets, subscription, onClose }: SubscriptionFormProps) {
  const [isOpen, setIsOpen] = useState(!!subscription)
  const [formData, setFormData] = useState({
    serviceName: '',
    amount: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    paymentMethod: '',
    walletId: '',
    note: '',
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (subscription) {
      setFormData({
        serviceName: subscription.serviceName,
        amount: subscription.amount.toString(),
        period: subscription.period,
        startDate: new Date(subscription.startDate).toISOString().split('T')[0],
        nextDueDate: new Date(subscription.nextDueDate).toISOString().split('T')[0],
        paymentMethod: subscription.paymentMethod || '',
        walletId: subscription.walletId || '',
        note: subscription.note || '',
        isActive: subscription.isActive,
      })
      setIsOpen(true)
    }
  }, [subscription])

  const calculateNextDueDate = (startDate: string, period: string) => {
    const start = new Date(startDate)
    switch (period) {
      case 'daily':
        return addDays(start, 1)
      case 'weekly':
        return addWeeks(start, 1)
      case 'monthly':
        return addMonths(start, 1)
      case 'yearly':
        return addYears(start, 1)
      default:
        return addMonths(start, 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.serviceName || !formData.amount) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const url = subscription ? `/api/subscriptions/${subscription.id}` : '/api/subscriptions'
      const method = subscription ? 'PUT' : 'POST'
      
      // For new subscriptions, calculate next due date. For edits, use the provided one.
      const nextDueDate = subscription && formData.nextDueDate
        ? new Date(formData.nextDueDate)
        : calculateNextDueDate(formData.startDate, formData.period)

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          startDate: new Date(formData.startDate).toISOString(),
          nextDueDate: nextDueDate.toISOString(),
          walletId: formData.walletId || null,
        }),
      })

      if (response.ok) {
        if (onClose) {
          onClose()
        }
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || `Failed to ${subscription ? 'update' : 'create'} subscription`)
      }
    } catch (error) {
      alert(`Failed to ${subscription ? 'update' : 'create'} subscription`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Subscription
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-md sm:w-96 shadow-lg rounded-md bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 m-4 sm:m-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{subscription ? 'Edit Subscription' : 'Add Subscription'}</h3>
          <button
            onClick={() => {
              setIsOpen(false)
              if (onClose) onClose()
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service Name</label>
            <input
              type="text"
              value={formData.serviceName}
              onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
              placeholder="e.g., Netflix, Spotify"
              className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Period</label>
            <select
              value={formData.period}
              onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          {subscription && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Next Due Date</label>
              <input
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
                className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
            <input
              type="text"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              placeholder="e.g., Credit Card, PayPal"
              className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wallet (optional)</label>
            <select
              value={formData.walletId}
              onChange={(e) => setFormData({ ...formData, walletId: e.target.value })}
              className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="">None</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Note (optional)</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
              className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          {subscription && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Active
              </label>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (subscription ? 'Updating...' : 'Saving...') : (subscription ? 'Update' : 'Save')}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                if (onClose) onClose()
              }}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
