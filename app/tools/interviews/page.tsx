import Layout from '@/components/Layout'
import InterviewDashboard from '@/components/interviews/InterviewDashboard'

export const dynamic = 'force-dynamic'

export default function InterviewsPage() {
  return (
    <Layout>
      <InterviewDashboard />
    </Layout>
  )
}
