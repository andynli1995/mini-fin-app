'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Edit, Trash2, ExternalLink, FileText } from 'lucide-react'
import AssessmentForm from './AssessmentForm'

interface Company {
  id: string
  name: string
}

interface Assessment {
  id: string
  title: string
  description: string | null
  deadline: string | Date
  status: string
  referenceLink: string | null
  notes: string | null
  submittedAt: string | Date | null
  company: Company
}

interface AssessmentsListProps {
  assessments: Assessment[]
  companies: Company[]
}

export default function AssessmentsList({ assessments, companies }: AssessmentsListProps) {
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assessment?')) return

    try {
      const response = await fetch(`/api/assessments/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to delete assessment')
      }
    } catch (error) {
      alert('Failed to delete assessment')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      'in-progress': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      submitted: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
      expired: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    }
    return colors[status] || colors.pending
  }

  const isOverdue = (deadline: string | Date) => {
    const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline)
    return deadlineDate < new Date()
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {assessments.map((assessment) => {
          const overdue = isOverdue(assessment.deadline) && !['completed', 'submitted'].includes(assessment.status)
          return (
            <div
              key={assessment.id}
              className={`bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-4 border ${
                overdue
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
                  : 'border-gray-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {assessment.company.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(assessment.status)}`}>
                      {assessment.status}
                    </span>
                    {overdue && (
                      <span className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                        Overdue
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {assessment.title}
                  </p>
                  {assessment.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {assessment.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Deadline: {format(assessment.deadline instanceof Date ? assessment.deadline : new Date(assessment.deadline), 'MMM d, yyyy h:mm a')}
                  </p>
                  {assessment.submittedAt && (
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">
                      Submitted: {format(assessment.submittedAt instanceof Date ? assessment.submittedAt : new Date(assessment.submittedAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  )}
                  {assessment.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {assessment.notes}
                    </p>
                  )}
                  {assessment.referenceLink && (
                    <a
                      href={assessment.referenceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Reference
                    </a>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setEditingAssessment(assessment)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                    title="Edit assessment"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(assessment.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                    title="Delete assessment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        {assessments.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No assessments yet. Create your first assessment to get started.
          </div>
        )}
      </div>
      {editingAssessment && (
        <AssessmentForm
          assessment={editingAssessment}
          companies={companies}
          onClose={() => setEditingAssessment(null)}
        />
      )}
    </div>
  )
}
