import Layout from '@/components/Layout'
import CompaniesList from '@/components/interviews/CompaniesList'
import AddCompanyButton from '@/components/interviews/AddCompanyButton'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function CompaniesListPage() {
  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          interviews: true,
          assessments: true,
        },
      },
    },
  })

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Companies
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Manage company information and details
            </p>
          </div>
          <div className="flex-shrink-0">
            <AddCompanyButton />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-slate-700">
          <div className="p-4 sm:p-6">
            <CompaniesList companies={companies} />
          </div>
        </div>
      </div>
    </Layout>
  )
}
