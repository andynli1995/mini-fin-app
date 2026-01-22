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

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-2 text-sm text-gray-600">
            Analyze your financial data with categorized reports and charts
          </p>
        </div>
        <ReportsView
          transactions={transactions}
          categories={categories}
          wallets={wallets}
        />
      </div>
    </Layout>
  )
}
