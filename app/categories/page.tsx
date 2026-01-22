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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage categories for your transactions
            </p>
          </div>
          <CategoryForm />
        </div>
        <CategoriesList categories={categories} />
      </div>
    </Layout>
  )
}
