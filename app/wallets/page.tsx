import Layout from '@/components/Layout'
import WalletsList from '@/components/WalletsList'
import WalletForm from '@/components/WalletForm'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function WalletsPage() {
  const wallets = await prisma.wallet.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { transactions: true },
      },
    },
  })

  // Convert Decimal to number for Client Components
  const walletsWithNumbers = wallets.map((wallet) => ({
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
        <WalletsList wallets={walletsWithNumbers} />
      </div>
    </Layout>
  )
}
