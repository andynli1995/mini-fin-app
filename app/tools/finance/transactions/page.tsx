import Layout from '@/components/Layout'
import TransactionsList from '@/components/TransactionsList'
import TransactionForm from '@/components/TransactionForm'
import Pagination from '@/components/Pagination'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface TransactionsPageProps {
  searchParams: {
    page?: string
  }
}

const ITEMS_PER_PAGE = 20

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const currentPage = parseInt(searchParams.page || '1', 10)
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  // Parallelize queries for better performance
  const [totalCount, transactions, categories, wallets] = await Promise.all([
    prisma.transaction.count(),
    prisma.transaction.findMany({
      skip,
      take: ITEMS_PER_PAGE,
      orderBy: { date: 'desc' },
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
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.wallet.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  // Convert Decimal to number for Client Components
  type WalletWithNumber = {
    id: string
    name: string
    type: string
    balance: number
    currency: string
    createdAt: Date
    updatedAt: Date
  }

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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Record and manage your financial transactions
            </p>
          </div>
          <div className="flex-shrink-0">
            <TransactionForm categories={categories} wallets={walletsWithNumbers} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-slate-700">
          <TransactionsList 
            transactions={transactionsWithNumbers} 
            categories={categories}
            wallets={walletsWithNumbers}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={ITEMS_PER_PAGE}
            basePath="/tools/finance/transactions"
          />
        </div>
      </div>
    </Layout>
  )
}
