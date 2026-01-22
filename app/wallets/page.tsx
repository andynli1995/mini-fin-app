import Layout from '@/components/Layout'
import WalletsList from '@/components/WalletsList'
import WalletForm from '@/components/WalletForm'
import { prisma } from '@/lib/prisma'

export default async function WalletsPage() {
  const wallets = await prisma.wallet.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { transactions: true },
      },
    },
  })

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wallets</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your virtual wallets and track balances
            </p>
          </div>
          <WalletForm />
        </div>
        <WalletsList wallets={wallets} />
      </div>
    </Layout>
  )
}
