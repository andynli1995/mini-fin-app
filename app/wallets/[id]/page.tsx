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
          <TransactionsList transactions={transactions} />
        </div>
      </div>
    </Layout>
  )
}
