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

  // Get total count for pagination
  const totalCount = await prisma.transaction.count()

  // Get paginated transactions
  const transactions = await prisma.transaction.findMany({
    skip,
    take: ITEMS_PER_PAGE,
    orderBy: { date: 'desc' },
    include: {
      category: true,
      wallet: true,
    },
  })

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  const wallets = await prisma.wallet.findMany({
    orderBy: { name: 'asc' },
  })

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

  const transactionsWithNumbers = transactions.map((transaction) => ({
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
            basePath="/transactions"
          />
        </div>
      </div>
    </Layout>
  )
}
