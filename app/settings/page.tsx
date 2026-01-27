import Layout from '@/components/Layout'
import UnifiedSettingsView from '@/components/UnifiedSettingsView'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage global preferences and tool-specific settings
          </p>
        </div>
        <UnifiedSettingsView />
      </div>
    </Layout>
  )
}
