'use client'

import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'

interface Category {
  id: string
  name: string
  type: string
}

interface CategoryFormProps {
  category?: Category
  onClose?: () => void
}

export default function CategoryForm({ category, onClose }: CategoryFormProps) {
  const [isOpen, setIsOpen] = useState(!!category)
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        type: category.type,
      })
      setIsOpen(true)
    }
  }, [category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      alert('Please enter a category name')
      return
    }

    setIsSubmitting(true)
    try {
      const url = category ? `/api/categories/${category.id}` : '/api/categories'
      const method = category ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        if (onClose) {
          onClose()
        }
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || `Failed to ${category ? 'update' : 'create'} category`)
      }
    } catch (error) {
      alert(`Failed to ${category ? 'update' : 'create'} category`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Category
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-md sm:w-96 shadow-lg rounded-md bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 m-4 sm:m-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{category ? 'Edit Category' : 'Add Category'}</h3>
          <button
            onClick={() => {
              setIsOpen(false)
              if (onClose) onClose()
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Food, Salary, Rent"
              className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mt-1 block w-full px-4 py-3 text-base rounded-md border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
              required
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="lend">Lend</option>
              <option value="rent">Rent</option>
            </select>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (category ? 'Updating...' : 'Saving...') : (category ? 'Update' : 'Save')}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                if (onClose) onClose()
              }}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
