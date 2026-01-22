import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import WalletCard from './WalletCard'
import RecentTransactions from './RecentTransactions'
import UpcomingSubscriptions from './UpcomingSubscriptions'
import RemindersBanner from './RemindersBanner'

export default async function Dashboard() {
  try {
    const wallets = await prisma.wallet.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const totalBalance = wallets.reduce((sum, wallet) => sum + Number(wallet.balance), 0)

    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        category: true,
        wallet: true,
      },
    })

    const upcomingSubscriptions = await prisma.subscription.findMany({
      where: {
        isActive: true,
        nextDueDate: {
          gte: new Date(),
        },
      },
      include: {
        wallet: true,
      },
      orderBy: {
        nextDueDate: 'asc',
      },
      take: 5,
    })

    const allActiveSubscriptions = await prisma.subscription.findMany({
      where: {
        isActive: true,
      },
      include: {
        wallet: true,
      },
    })

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Overview of your financial status
          </p>
        </div>

        {/* Reminders Banner */}
        <RemindersBanner subscriptions={allActiveSubscriptions} />

        {/* Total Balance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
          <p className="text-blue-100 text-sm font-medium">Total Balance</p>
          <p className="text-4xl font-bold mt-2">
            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Wallets Grid */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Wallets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))}
            {wallets.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No wallets yet. Create your first wallet to get started.
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <RecentTransactions transactions={recentTransactions} />

          {/* Upcoming Subscriptions */}
          <UpcomingSubscriptions subscriptions={upcomingSubscriptions} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Database error:', error)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Overview of your financial status
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Database Connection Error</h2>
          <p className="text-red-700">
            Unable to connect to the database. Please check your connection settings.
          </p>
          <p className="text-sm text-red-600 mt-2">
            Error: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }
}
