'use client'

import { useState } from 'react'
import { Transaction, Category, Wallet } from '@prisma/client'
import { format } from 'date-fns'
import { ArrowUpRight, ArrowDownLeft, Trash2, Edit } from 'lucide-react'
import TransactionForm from './TransactionForm'

interface TransactionWithRelations extends Transaction {
  category: Category
  wallet: Wallet
}

interface TransactionsListProps {
  transactions: TransactionWithRelations[]
  categories?: Category[]
  wallets?: Wallet[]
}

export default function TransactionsList({ transactions, categories = [], wallets = [] }: TransactionsListProps) {
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithRelations | null>(null)
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
      case 'expense':
        return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
      case 'lend':
        return 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30'
      case 'rent':
        return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
      default:
        return 'text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-700'
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to delete transaction')
      }
    } catch (error) {
      alert('Failed to delete transaction')
    }
  }

  // Mobile card view
  const MobileCard = ({ transaction }: { transaction: TransactionWithRelations }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-4 mb-4 border border-gray-200 dark:border-slate-700">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                transaction.type
              )}`}
            >
              {transaction.type === 'income' ? (
                <ArrowDownLeft className="w-3 h-3 mr-1" />
              ) : (
                <ArrowUpRight className="w-3 h-3 mr-1" />
              )}
              {transaction.type}
            </span>
          </div>
          <p className="font-medium text-gray-900 dark:text-gray-100">{transaction.category.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {format(new Date(transaction.date), 'MMM d, yyyy')} • {transaction.wallet.name}
          </p>
          {transaction.note && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{transaction.note}</p>
          )}
        </div>
        <div className="text-right ml-4">
          <p
            className={`text-lg font-semibold ${
              transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {transaction.type === 'income' ? '+' : '-'}$
            {Math.abs(Number(transaction.amount)).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <div className="flex space-x-2 mt-2">
            {categories.length > 0 && wallets.length > 0 && (
              <button
                onClick={() => setEditingTransaction(transaction)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                title="Edit transaction"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleDelete(transaction.id)}
              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
              title="Delete transaction"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Wallet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Note
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No transactions yet. Add your first transaction to get started.
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                        transaction.type
                      )}`}
                    >
                      {transaction.type === 'income' ? (
                        <ArrowDownLeft className="w-3 h-3 mr-1" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                      )}
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {transaction.category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {transaction.wallet.name}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}$
                    {Math.abs(Number(transaction.amount)).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {transaction.note || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {categories.length > 0 && wallets.length > 0 && (
                        <button
                          onClick={() => setEditingTransaction(transaction)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                          title="Edit transaction"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden p-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No transactions yet. Add your first transaction to get started.
          </div>
        ) : (
          transactions.map((transaction) => (
            <MobileCard key={transaction.id} transaction={transaction} />
          ))
        )}
      </div>
      {editingTransaction && categories.length > 0 && wallets.length > 0 && (
        <TransactionForm
          categories={categories}
          wallets={wallets}
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  )
}
