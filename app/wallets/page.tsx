import Layout from '@/components/Layout'
import WalletsList from '@/components/WalletsList'
import WalletForm from '@/components/WalletForm'
import Pagination from '@/components/Pagination'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface WalletsPageProps {
  searchParams: {
    page?: string
  }
}

const ITEMS_PER_PAGE = 12 // 3 columns x 4 rows

export default async function WalletsPage({ searchParams }: WalletsPageProps) {
  const currentPage = parseInt(searchParams.page || '1', 10)
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  // Get total count for pagination
  const totalCount = await prisma.wallet.count()

  // Get paginated wallets
  const wallets = await prisma.wallet.findMany({
    skip,
    take: ITEMS_PER_PAGE,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { transactions: true },
      },
    },
  })

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  // Convert Decimal to number for Client Components
  type WalletWithCount = {
    id: string
    name: string
    type: string
    balance: number
    currency: string
    createdAt: Date
    updatedAt: Date
    _count: {
      transactions: number
    }
  }

  const walletsWithNumbers: WalletWithCount[] = wallets.map((wallet) => ({
    ...wallet,
    balance: Number(wallet.balance),
  }))

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Wallets</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Manage your virtual wallets and track balances
            </p>
          </div>
          <div className="flex-shrink-0">
            <WalletForm />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-slate-700">
          <div className="p-4 sm:p-6">
            <WalletsList wallets={walletsWithNumbers} />
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={ITEMS_PER_PAGE}
            basePath="/wallets"
          />
        </div>
      </div>
    </Layout>
  )
}
