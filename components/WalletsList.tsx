import { Wallet } from '@prisma/client'
import Link from 'next/link'
import { Trash2, Edit } from 'lucide-react'

interface WalletWithCount extends Wallet {
  _count: {
    transactions: number
  }
}

interface WalletsListProps {
  wallets: WalletWithCount[]
}

export default function WalletsList({ wallets }: WalletsListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wallet? All associated transactions will also be deleted.')) return

    try {
      const response = await fetch(`/api/wallets/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete wallet')
      }
    } catch (error) {
      alert('Failed to delete wallet')
    }
  }

  const totalBalance = wallets.reduce((sum, wallet) => sum + Number(wallet.balance), 0)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Total Balance Across All Wallets</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{wallet.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{wallet.type}</p>
              </div>
              <div className="flex space-x-2 flex-shrink-0 ml-2">
                <button
                  onClick={() => handleDelete(wallet.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {wallet.currency} {Number(wallet.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {wallet._count.transactions} transaction{wallet._count.transactions !== 1 ? 's' : ''}
              </p>
            </div>
            <Link
              href={`/wallets/${wallet.id}`}
              className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800"
            >
              View details →
            </Link>
          </div>
        ))}
        {wallets.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No wallets yet. Create your first wallet to get started.
          </div>
        )}
      </div>
    </div>
  )
}
