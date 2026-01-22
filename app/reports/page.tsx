import Layout from '@/components/Layout'
import ReportsView from '@/components/ReportsView'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const transactions = await prisma.transaction.findMany({
    include: {
      category: true,
      wallet: true,
    },
    orderBy: { date: 'desc' },
  })

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  const wallets = await prisma.wallet.findMany({
    orderBy: { name: 'asc' },
  })

  // Convert Decimal to number for Client Components
  type TransactionWithNumbers = {
    id: string
    type: string
    amount: number
    date: Date
    note: string | null
    walletId: string
    categoryId: string
    createdAt: Date
    updatedAt: Date
    category: {
      id: string
      name: string
      type: string
      color: string | null
      icon: string | null
      createdAt: Date
      updatedAt: Date
    }
    wallet: {
      id: string
      name: string
      type: string
      balance: number
      currency: string
      createdAt: Date
      updatedAt: Date
    }
  }

  type WalletWithNumber = {
    id: string
    name: string
    type: string
    balance: number
    currency: string
    createdAt: Date
    updatedAt: Date
  }

  const transactionsWithNumbers: TransactionWithNumbers[] = transactions.map((transaction) => ({
    ...transaction,
    amount: Number(transaction.amount),
    wallet: {
      ...transaction.wallet,
      balance: Number(transaction.wallet.balance),
    },
  }))

  const walletsWithNumbers: WalletWithNumber[] = wallets.map((wallet) => ({
    ...wallet,
    balance: Number(wallet.balance),
  }))

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Analyze your financial data with categorized reports and charts
          </p>
        </div>
        <ReportsView
          transactions={transactionsWithNumbers}
          categories={categories}
          wallets={walletsWithNumbers}
        />
      </div>
    </Layout>
  )
}
