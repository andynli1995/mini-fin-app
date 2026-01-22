import Layout from '@/components/Layout'
import Dashboard from '@/components/Dashboard'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <Layout>
      <Dashboard />
    </Layout>
  )
}
