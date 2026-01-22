'use client'

'use client'

import { useState } from 'react'
import { Category } from '@prisma/client'
import { Trash2, Edit } from 'lucide-react'
import CategoryForm from './CategoryForm'

interface CategoryWithCount extends Category {
  _count: {
    transactions: number
  }
}

interface CategoriesListProps {
  categories: CategoryWithCount[]
}

export default function CategoriesList({ categories }: CategoriesListProps) {
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null)
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
        <div key={type} className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 capitalize">{type} Categories</h2>
          {groupedCategories[type] && groupedCategories[type].length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedCategories[type].map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{category.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {category._count.transactions} transaction{category._count.transactions !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                      title="Edit category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No {type} categories yet</p>
          )}
        </div>
      ))}
      {editingCategory && (
        <CategoryForm
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </div>
  )
}
