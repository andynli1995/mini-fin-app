'use client'

import { useState } from 'react'
import { Edit, Trash2, ExternalLink, Building2 } from 'lucide-react'
import CompanyForm from './CompanyForm'

interface Company {
  id: string
  name: string
  website: string | null
  logo: string | null
  industry: string | null
  size: string | null
  location: string | null
  notes: string | null
  _count?: {
    interviews: number
    assessments: number
  }
}

interface CompaniesListProps {
  companies: Company[]
}

export default function CompaniesList({ companies }: CompaniesListProps) {
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company? All associated interviews and assessments will also be deleted.')) return

    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to delete company')
      }
    } catch (error) {
      alert('Failed to delete company')
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map((company) => (
          <div
            key={company.id}
            className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-4 border border-gray-200 dark:border-slate-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Building2 className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {company.name}
                </h3>
              </div>
              <div className="flex gap-2 ml-2">
                <button
                  onClick={() => setEditingCompany(company)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                  title="Edit company"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(company.id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                  title="Delete company"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {company.industry && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {company.industry}
              </p>
            )}
            {company.size && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Size: {company.size}
              </p>
            )}
            {company.location && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {company.location}
              </p>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2"
              >
                <ExternalLink className="w-3 h-3" />
                Website
              </a>
            )}
            {company._count && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700 flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>{company._count.interviews} interview{company._count.interviews !== 1 ? 's' : ''}</span>
                <span>{company._count.assessments} assessment{company._count.assessments !== 1 ? 's' : ''}</span>
              </div>
            )}
            {company.notes && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {company.notes}
              </p>
            )}
          </div>
        ))}
        {companies.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
            No companies yet. Create your first company to get started.
          </div>
        )}
      </div>
      {editingCompany && (
        <CompanyForm company={editingCompany} onClose={() => setEditingCompany(null)} />
      )}
    </div>
  )
}
