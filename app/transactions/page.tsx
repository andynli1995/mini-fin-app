import Layout from '@/components/Layout'
import TransactionsList from '@/components/TransactionsList'
import TransactionForm from '@/components/TransactionForm'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function TransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
    include: {
      category: true,
      wallet: true,
    },
  })

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  const wallets = await prisma.wallet.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="mt-2 text-sm text-gray-600">
              Record and manage your financial transactions
            </p>
          </div>
          <div className="flex-shrink-0">
            <TransactionForm categories={categories} wallets={wallets} />
          </div>
        </div>
        <TransactionsList transactions={transactions} />
      </div>
    </Layout>
  )
}
