'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Receipt, Wallet, Tag, Calendar } from 'lucide-react'
import TransactionForm from './TransactionForm'
import { Category, Wallet as WalletType } from '@prisma/client'

interface WalletWithNumber extends Omit<WalletType, 'balance'> {
  balance: number
}

interface QuickActionsProps {
  categories: Category[]
  wallets: WalletWithNumber[]
}

export default function QuickActions({ categories, wallets }: QuickActionsProps) {
  const [showTransactionForm, setShowTransactionForm] = useState(false)

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-slate-700 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => setShowTransactionForm(true)}
            className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
          >
            <Receipt className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2 transition-colors" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Add Transaction
            </span>
          </button>

          <Link
            href="/tools/finance/wallets"
            className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
          >
            <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2 transition-colors" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Add Wallet
            </span>
          </Link>

          <Link
            href="/tools/finance/categories"
            className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
          >
            <Tag className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2 transition-colors" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Add Category
            </span>
          </Link>

          <Link
            href="/tools/finance/subscriptions"
            className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
          >
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2 transition-colors" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Add Subscription
            </span>
          </Link>
        </div>
      </div>

      {showTransactionForm && (
        <TransactionForm
          categories={categories}
          wallets={wallets}
          onClose={() => setShowTransactionForm(false)}
        />
      )}
    </>
  )
}
