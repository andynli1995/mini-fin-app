import Layout from '@/components/Layout'
import SubscriptionsList from '@/components/SubscriptionsList'
import SubscriptionForm from '@/components/SubscriptionForm'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function SubscriptionsPage() {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { nextDueDate: 'asc' },
    include: {
      wallet: true,
    },
  })

  const wallets = await prisma.wallet.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your recurring subscriptions and payments
            </p>
          </div>
          <SubscriptionForm wallets={wallets} />
        </div>
        <SubscriptionsList subscriptions={subscriptions} wallets={wallets} />
      </div>
    </Layout>
  )
}
