import { Category } from '@prisma/client'
import { Trash2 } from 'lucide-react'

interface CategoryWithCount extends Category {
  _count: {
    transactions: number
  }
}

interface CategoriesListProps {
  categories: CategoryWithCount[]
}

export default function CategoriesList({ categories }: CategoriesListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All associated transactions will also be deleted.')) return

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete category')
      }
    } catch (error) {
      alert('Failed to delete category')
    }
  }

  const groupedCategories = categories.reduce((acc, cat) => {
    if (!acc[cat.type]) {
      acc[cat.type] = []
    }
    acc[cat.type].push(cat)
    return acc
  }, {} as Record<string, CategoryWithCount[]>)

  return (
    <div className="space-y-6">
      {['expense', 'income', 'lend', 'rent'].map((type) => (
        <div key={type} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">{type} Categories</h2>
          {groupedCategories[type] && groupedCategories[type].length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedCategories[type].map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {category._count.transactions} transaction{category._count.transactions !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No {type} categories yet</p>
          )}
        </div>
      ))}
    </div>
  )
}
