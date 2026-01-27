import Layout from '@/components/Layout'
import SettingsView from '@/components/SettingsView'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your app preferences and security settings
          </p>
        </div>
        <SettingsView />
      </div>
    </Layout>
  )
}
