import Layout from '@/components/Layout'
import TransactionsList from '@/components/TransactionsList'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface WalletDetailPageProps {
  params: {
    id: string
  }
}

export default async function WalletDetailPage({ params }: WalletDetailPageProps) {
  try {
    if (!params?.id) {
      notFound()
    }

    const wallet = await prisma.wallet.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    })

    if (!wallet) {
      notFound()
    }

    const transactions = await prisma.transaction.findMany({
      where: { walletId: params.id },
      include: {
        category: true,
        wallet: true,
      },
      orderBy: { date: 'desc' },
    })

    // Convert Decimal to number for Client Components
    const transactionsWithNumbers = transactions.map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount),
      wallet: {
        ...transaction.wallet,
        balance: Number(transaction.wallet.balance),
      },
    }))

    const formattedBalance = Number(wallet.balance).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    return (
      <Layout>
        <div className="space-y-6">
          {/* Back button */}
          <Link
            href="/wallets"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Wallets
          </Link>

          {/* Wallet Header */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{wallet.name}</h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{wallet.type}</p>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {wallet._count.transactions} transaction{wallet._count.transactions !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {wallet.currency} {formattedBalance}
                </p>
              </div>
            </div>
          </div>

          {/* Transactions Section */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Transactions</h2>
            <TransactionsList transactions={transactionsWithNumbers} />
          </div>
        </div>
      </Layout>
    )
  } catch (error) {
    console.error('Error loading wallet:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return (
      <Layout>
        <div className="space-y-6">
          <Link
            href="/wallets"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Wallets
          </Link>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">Error Loading Wallet</h2>
            <p className="text-sm text-red-700 dark:text-red-400 mb-2">
              Unable to load wallet details. Please try again later.
            </p>
            <p className="text-xs text-red-600 dark:text-red-500">
              {errorMessage}
            </p>
          </div>
        </div>
      </Layout>
    )
  }
}
