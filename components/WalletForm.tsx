'use client'

import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'

interface Wallet {
  id: string
  name: string
  type: string
  currency: string
  balance: number
  _count?: {
    transactions: number
  }
  createdAt?: Date
  updatedAt?: Date
}

interface WalletFormProps {
  wallet?: Wallet
  onClose?: () => void
}

export default function WalletForm({ wallet, onClose }: WalletFormProps) {
  const [isOpen, setIsOpen] = useState(!!wallet)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    currency: 'USD',
    balance: '0',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (wallet) {
      setFormData({
        name: wallet.name,
        type: wallet.type,
        currency: wallet.currency,
        balance: wallet.balance.toString(),
      })
      setIsOpen(true)
    }
  }, [wallet])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.type) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const url = wallet ? `/api/wallets/${wallet.id}` : '/api/wallets'
      const method = wallet ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          balance: parseFloat(formData.balance) || 0,
        }),
      })

      if (response.ok) {
        if (onClose) {
          onClose()
        }
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || `Failed to ${wallet ? 'update' : 'create'} wallet`)
      }
    } catch (error) {
      alert(`Failed to ${wallet ? 'update' : 'create'} wallet`)
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
        Add Wallet
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-md sm:w-96 shadow-lg rounded-md bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 m-4 sm:m-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{wallet ? 'Edit Wallet' : 'Add Wallet'}</h3>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Payoneer, MEXC"
              className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="e.g., Digital Wallet, Bank, Cash"
              className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="CNY">CNY</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {wallet ? 'Current Balance' : 'Initial Balance'}
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
              {wallet 
                ? 'Manually adjust the balance. Future transactions will preserve this as the baseline.'
                : 'Set the starting balance for this wallet.'}
            </p>
            <input
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (wallet ? 'Updating...' : 'Saving...') : (wallet ? 'Update' : 'Save')}
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
