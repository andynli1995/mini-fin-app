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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isDirectConnection = errorMessage.includes(':5432')
    const isPoolerConnection = errorMessage.includes(':6543')
    
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
          <p className="text-red-700 mb-4">
            Unable to connect to the database. Please check your connection settings.
          </p>
          
          {isDirectConnection && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Using Direct Connection (Port 5432)</h3>
              <p className="text-sm text-yellow-700 mb-2">
                Your connection string is using the direct database connection (port 5432), which may not work on Vercel.
              </p>
              <p className="text-sm text-yellow-700 mb-2">
                <strong>Solution:</strong> Update your Vercel environment variable to use the connection pooler (port 6543):
              </p>
              <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-1 ml-2">
                <li>Go to Supabase Dashboard → Settings → Database → Connection Pooling</li>
                <li>Select &quot;Transaction&quot; mode</li>
                <li>Copy the connection string (it will use port 6543)</li>
                <li>Update <code className="bg-yellow-100 px-1 rounded">DATABASE_URL</code> in Vercel with this pooler URL</li>
                <li>Make sure it includes <code className="bg-yellow-100 px-1 rounded">?pgbouncer=true&amp;connection_limit=1</code></li>
                <li>Redeploy your Vercel project</li>
              </ol>
            </div>
          )}
          
          {(isPoolerConnection || errorMessage.includes('Circuit breaker')) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Circuit Breaker Open</h3>
              <p className="text-sm text-yellow-700 mb-2">
                Supabase has temporarily blocked connections due to too many failed attempts. This is a protection mechanism.
              </p>
              <p className="text-sm text-yellow-700 mb-3">
                <strong>Solutions:</strong>
              </p>
              <ol className="text-sm text-yellow-700 list-decimal list-inside space-y-2 ml-2">
                <li>
                  <strong>Wait 5-10 minutes</strong> for the circuit breaker to reset automatically, then refresh the page
                </li>
                <li>
                  <strong>Verify your connection string</strong> in Vercel:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Should use port <code className="bg-yellow-100 px-1 rounded">6543</code> (pooler), not 5432</li>
                    <li>Should include <code className="bg-yellow-100 px-1 rounded">?pgbouncer=true&amp;connection_limit=1</code></li>
                    <li>Username format: <code className="bg-yellow-100 px-1 rounded">postgres.[PROJECT-REF]</code></li>
                  </ul>
                </li>
                <li>
                  <strong>Get fresh connection string</strong> from Supabase Dashboard → Settings → Database → Connection Pooling → Transaction mode
                </li>
                <li>
                  <strong>Reduce connection attempts</strong> by ensuring <code className="bg-yellow-100 px-1 rounded">connection_limit=1</code> is in your URL
                </li>
              </ol>
            </div>
          )}
          
          <details className="mt-4">
            <summary className="text-sm text-red-600 cursor-pointer">Technical Details</summary>
            <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
              {errorMessage}
            </pre>
          </details>
        </div>
      </div>
    )
  }
}
