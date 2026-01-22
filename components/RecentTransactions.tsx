import { Transaction, Category, Wallet } from '@prisma/client'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'

interface TransactionWithRelations extends Omit<Transaction, 'amount'> {
  amount: number
  category: Category
  wallet: (Omit<Wallet, 'balance'> & { balance: number }) | null
}

interface RecentTransactionsProps {
  transactions: TransactionWithRelations[]
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
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

  const getTypeIcon = (type: string) => {
    return type === 'income' ? (
      <ArrowDownLeft className="w-4 h-4" />
    ) : (
      <ArrowUpRight className="w-4 h-4" />
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Transactions</h2>
        <Link href="/transactions" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No transactions yet</p>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${getTypeColor(transaction.type)}`}>
                  {getTypeIcon(transaction.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{transaction.category.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                    {format(new Date(transaction.date), 'MMM d, yyyy')} • {transaction.wallet.name}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p
                  className={`text-sm sm:text-base font-semibold ${
                    transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}$
                  {Math.abs(Number(transaction.amount)).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
