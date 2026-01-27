import Layout from '@/components/Layout'
import AssessmentsList from '@/components/interviews/AssessmentsList'
import AddAssessmentButton from '@/components/interviews/AddAssessmentButton'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AssessmentsListPage() {
  const [assessments, companies] = await Promise.all([
    prisma.assessment.findMany({
      include: {
        company: true,
      },
      orderBy: { deadline: 'asc' },
    }),
    prisma.company.findMany({
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Assessments
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Track company assessments and deadlines
            </p>
          </div>
          <div className="flex-shrink-0">
            <AddAssessmentButton companies={companies} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-slate-700">
          <div className="p-4 sm:p-6">
            <AssessmentsList assessments={assessments} companies={companies} />
          </div>
        </div>
      </div>
    </Layout>
  )
}
