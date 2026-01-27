import Layout from '@/components/Layout'
import ProfilesList from '@/components/interviews/ProfilesList'
import AddProfileButton from '@/components/interviews/AddProfileButton'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function ProfilesPage() {
  const profiles = await prisma.profile.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { interviews: true, assessments: true },
      },
    },
  })

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Profiles
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Manage applicant profiles (e.g. Larry, Andy) to tag which profile each application belongs to
            </p>
          </div>
          <div className="flex-shrink-0">
            <AddProfileButton />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 sm:p-6">
            <ProfilesList profiles={profiles} />
          </div>
        </div>
      </div>
    </Layout>
  )
}
