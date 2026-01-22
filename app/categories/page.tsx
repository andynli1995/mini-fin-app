import Layout from '@/components/Layout'
import CategoriesList from '@/components/CategoriesList'
import CategoryForm from '@/components/CategoryForm'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { transactions: true },
      },
    },
  })

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Categories</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage categories for your transactions
            </p>
          </div>
          <div className="flex-shrink-0">
            <CategoryForm />
          </div>
        </div>
        <CategoriesList categories={categories} />
      </div>
    </Layout>
  )
}
