import { prisma } from '@/lib/prisma'
import WalletCard from './WalletCard'
import RecentTransactions from './RecentTransactions'
import UpcomingSubscriptions from './UpcomingSubscriptions'
import RemindersBanner from './RemindersBanner'
import BalanceDisplay from './BalanceDisplay'

export default async function Dashboard() {
  try {
    const wallets = await prisma.wallet.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Convert Decimal to number for Client Components
    const walletsWithNumbers = wallets.map((wallet) => ({
      ...wallet,
      balance: Number(wallet.balance),
    }))

    const totalBalance = walletsWithNumbers.reduce((sum, wallet) => sum + wallet.balance, 0)

    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        category: true,
        wallet: true,
      },
    })

    // Convert Decimal to number for Client Components
    const recentTransactionsWithNumbers = recentTransactions.map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount),
      wallet: transaction.wallet ? {
        ...transaction.wallet,
        balance: Number(transaction.wallet.balance),
      } : null,
    }))

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

    // Convert Decimal to number for Client Components
    const upcomingSubscriptionsWithNumbers = upcomingSubscriptions.map((subscription) => ({
      ...subscription,
      amount: Number(subscription.amount),
      wallet: subscription.wallet ? {
        ...subscription.wallet,
        balance: Number(subscription.wallet.balance),
      } : null,
    }))

    const allActiveSubscriptionsWithNumbers = allActiveSubscriptions.map((subscription) => ({
      ...subscription,
      amount: Number(subscription.amount),
      wallet: subscription.wallet ? {
        ...subscription.wallet,
        balance: Number(subscription.wallet.balance),
      } : null,
    }))

    // Get settings for default balance visibility
    const settings = await prisma.appSettings.findFirst()

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Overview of your financial status
          </p>
        </div>

        {/* Reminders Banner */}
        <RemindersBanner subscriptions={allActiveSubscriptionsWithNumbers} />

        {/* Total Balance Card */}
        <BalanceDisplay
          label="Total Balance"
          amount={totalBalance}
          defaultHidden={settings?.hideBalancesByDefault || false}
        />

        {/* Wallets Grid */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Wallets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {walletsWithNumbers.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                defaultHidden={settings?.hideBalancesByDefault || false}
              />
            ))}
            {walletsWithNumbers.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                No wallets yet. Create your first wallet to get started.
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <RecentTransactions transactions={recentTransactionsWithNumbers} />

          {/* Upcoming Subscriptions */}
          <UpcomingSubscriptions subscriptions={upcomingSubscriptionsWithNumbers} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Database error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isDirectConnection = errorMessage.includes(':5432')
    const isPoolerConnection = errorMessage.includes(':6543')
    const isTableMissing = errorMessage.includes('does not exist') || errorMessage.includes('table')
    const isCircuitBreaker = errorMessage.includes('Circuit breaker') || errorMessage.includes('Failed to retrieve database credentials')

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Overview of your financial status
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-red-800 mb-2">Database Connection Error</h3>
          <p className="text-sm text-red-700 mb-2">
            Unable to connect to the database. Please check your connection settings.
          </p>
          <p className="text-sm text-red-700 mb-3">
            <strong>Technical Details:</strong> {errorMessage}
          </p>
          
          {isCircuitBreaker && (
            <div className="bg-red-100 rounded p-3 mb-3">
              <p className="text-sm text-red-900 mb-2">
                <strong>Circuit Breaker Error:</strong> Too many failed connection attempts detected.
              </p>
              <p className="text-sm text-red-900 mb-2">
                <strong>Solutions:</strong>
              </p>
              <ol className="text-sm text-red-900 list-decimal list-inside space-y-1">
                <li>Wait 5-10 minutes for the circuit breaker to reset</li>
                <li>Verify your connection string includes <code className="bg-red-200 px-1 rounded">?pgbouncer=true&connection_limit=1</code></li>
                <li>Check that you&apos;re using the connection pooler URL (port 6543) for Vercel</li>
                <li>As a workaround, you can try using the direct connection (port 5432) temporarily</li>
              </ol>
            </div>
          )}

          {isTableMissing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">📋 Database Schema Not Created</h3>
              <p className="text-sm text-blue-700 mb-2">
                The database connection is working, but the tables haven&apos;t been created yet.
              </p>
              <p className="text-sm text-blue-700 mb-3">
                <strong>Solution:</strong> Run the following commands to create the database schema:
              </p>
              <div className="bg-blue-100 rounded p-3 mb-3">
                <code className="text-sm text-blue-900 block">
                  npx prisma generate
                </code>
                <code className="text-sm text-blue-900 block mt-2">
                  npx prisma db push
                </code>
              </div>
              <p className="text-sm text-blue-700">
                <strong>For Vercel:</strong> You can run these commands locally (they will connect to your Supabase database) or set up a migration workflow.
              </p>
            </div>
          )}
          
          {!isCircuitBreaker && !isTableMissing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">Troubleshooting Steps</h3>
              <ol className="text-sm text-yellow-900 list-decimal list-inside space-y-1">
                <li>Check your <code className="bg-yellow-200 px-1 rounded">DATABASE_URL</code> environment variable</li>
                {isDirectConnection && (
                  <li>For Vercel, use the connection pooler URL (port 6543) instead of direct connection (port 5432)</li>
                )}
                {isPoolerConnection && (
                  <li>Make sure your connection string includes <code className="bg-yellow-200 px-1 rounded">?pgbouncer=true&connection_limit=1</code></li>
                )}
                <li>Verify your Supabase project is active and not paused</li>
                <li>Check Supabase Dashboard → Settings → Database for the correct connection string</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    )
  }
}
