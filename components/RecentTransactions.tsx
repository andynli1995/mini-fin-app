import { Transaction, Category, Wallet } from '@prisma/client'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'

interface TransactionWithRelations extends Transaction {
  category: Category
  wallet: Wallet
}

interface RecentTransactionsProps {
  transactions: TransactionWithRelations[]
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600 bg-green-50'
      case 'expense':
        return 'text-red-600 bg-red-50'
      case 'lend':
        return 'text-yellow-600 bg-yellow-50'
      case 'rent':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
        <Link href="/transactions" className="text-sm text-blue-600 hover:text-blue-800">
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No transactions yet</p>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${getTypeColor(transaction.type)}`}>
                  {getTypeIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.category.name}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(transaction.date), 'MMM d, yyyy')} • {transaction.wallet.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
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
