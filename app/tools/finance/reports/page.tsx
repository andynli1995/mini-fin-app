import Layout from '@/components/Layout'
import ReportsView from '@/components/ReportsView'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  // Parallelize queries for better performance
  // Limit transactions to last 1000 for performance (reports can filter client-side)
  const [transactions, categories, wallets] = await Promise.all([
    prisma.transaction.findMany({
      take: 1000, // Limit to most recent 1000 transactions for performance
      include: {
        category: true,
        wallet: true,
        relatedTransaction: {
          include: {
            category: true,
            wallet: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.wallet.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  // Convert Decimal to number for Client Components
  type TransactionWithNumbers = {
    id: string
    type: string
    amount: number
    date: Date
    note: string | null
    walletId: string
    categoryId: string
    cleared: boolean
    isReturn: boolean
    relatedTransactionId: string | null
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
    relatedTransaction: {
      id: string
      type: string
      amount: number
      date: Date
      note: string | null
      walletId: string
      categoryId: string
      cleared: boolean
      isReturn: boolean
      relatedTransactionId: string | null
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
    } | null
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
    relatedTransaction: transaction.relatedTransaction
      ? {
          id: transaction.relatedTransaction.id,
          type: transaction.relatedTransaction.type,
          amount: Number(transaction.relatedTransaction.amount),
          date: transaction.relatedTransaction.date,
          note: transaction.relatedTransaction.note,
          walletId: transaction.relatedTransaction.walletId,
          categoryId: transaction.relatedTransaction.categoryId,
          cleared: transaction.relatedTransaction.cleared,
          isReturn: transaction.relatedTransaction.isReturn,
          relatedTransactionId: transaction.relatedTransaction.relatedTransactionId,
          createdAt: transaction.relatedTransaction.createdAt,
          updatedAt: transaction.relatedTransaction.updatedAt,
          category: transaction.relatedTransaction.category,
          wallet: {
            ...transaction.relatedTransaction.wallet,
            balance: Number(transaction.relatedTransaction.wallet.balance),
          },
        }
      : null,
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
