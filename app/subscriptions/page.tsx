import Layout from '@/components/Layout'
import SubscriptionsList from '@/components/SubscriptionsList'
import SubscriptionForm from '@/components/SubscriptionForm'
import Pagination from '@/components/Pagination'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface SubscriptionsPageProps {
  searchParams: {
    page?: string
  }
}

const ITEMS_PER_PAGE = 20

export default async function SubscriptionsPage({ searchParams }: SubscriptionsPageProps) {
  const currentPage = parseInt(searchParams.page || '1', 10)
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  // Get total count for pagination
  const totalCount = await prisma.subscription.count()

  // Get paginated subscriptions
  const subscriptions = await prisma.subscription.findMany({
    skip,
    take: ITEMS_PER_PAGE,
    orderBy: { nextDueDate: 'asc' },
    include: {
      wallet: true,
    },
  })

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

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

  type SubscriptionWithNumbers = {
    id: string
    serviceName: string
    amount: number
    period: string
    startDate: Date
    nextDueDate: Date
    paymentMethod: string | null
    walletId: string | null
    isActive: boolean
    note: string | null
    createdAt: Date
    updatedAt: Date
    wallet: {
      id: string
      name: string
      type: string
      balance: number
      currency: string
      createdAt: Date
      updatedAt: Date
    } | null
  }

  const subscriptionsWithNumbers: SubscriptionWithNumbers[] = subscriptions.map((subscription) => ({
    ...subscription,
    amount: Number(subscription.amount),
    wallet: subscription.wallet ? {
      ...subscription.wallet,
      balance: Number(subscription.wallet.balance),
    } : null,
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Subscriptions</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Manage your recurring subscriptions and payments
            </p>
          </div>
          <div className="flex-shrink-0">
            <SubscriptionForm wallets={walletsWithNumbers} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-slate-700">
          <SubscriptionsList subscriptions={subscriptionsWithNumbers} wallets={walletsWithNumbers} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={ITEMS_PER_PAGE}
            basePath="/subscriptions"
          />
        </div>
      </div>
    </Layout>
  )
}
