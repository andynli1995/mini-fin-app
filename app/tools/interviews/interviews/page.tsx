import Layout from '@/components/Layout'
import InterviewsList from '@/components/interviews/InterviewsList'
import AddInterviewButton from '@/components/interviews/AddInterviewButton'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function InterviewsListPage() {
  const [interviews, companies, profiles] = await Promise.all([
    prisma.interview.findMany({
      include: {
        company: true,
        profile: true,
      },
      orderBy: { scheduledAt: 'desc' },
    }),
    prisma.company.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.profile.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Interviews
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Manage interview schedule and track by profile (e.g. Larry, Andy)
            </p>
          </div>
          <div className="flex-shrink-0">
            <AddInterviewButton companies={companies} profiles={profiles} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 sm:p-6">
            <InterviewsList interviews={interviews} companies={companies} profiles={profiles} />
          </div>
        </div>
      </div>
    </Layout>
  )
}
