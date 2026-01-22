import Layout from '@/components/Layout'
import CategoriesList from '@/components/CategoriesList'
import CategoryForm from '@/components/CategoryForm'
import Pagination from '@/components/Pagination'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface CategoriesPageProps {
  searchParams: {
    page?: string
  }
}

const ITEMS_PER_PAGE = 30

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const currentPage = parseInt(searchParams.page || '1', 10)
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  // Get total count for pagination
  const totalCount = await prisma.category.count()

  // Get paginated categories
  const categories = await prisma.category.findMany({
    skip,
    take: ITEMS_PER_PAGE,
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: { transactions: true },
      },
    },
  })

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Categories</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Manage categories for your transactions
            </p>
          </div>
          <div className="flex-shrink-0">
            <CategoryForm />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-slate-700">
          <div className="p-4 sm:p-6">
            <CategoriesList categories={categories} />
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCount}
            itemsPerPage={ITEMS_PER_PAGE}
            basePath="/categories"
          />
        </div>
      </div>
    </Layout>
  )
}
