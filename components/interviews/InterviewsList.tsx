'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Edit, Trash2, ExternalLink, Calendar, Briefcase } from 'lucide-react'
import InterviewForm from './InterviewForm'

interface Company {
  id: string
  name: string
}

interface Interview {
  id: string
  companyId: string
  role: string
  status: string
  scheduledAt: string | Date | null
  referenceLink: string | null
  notes: string | null
  interviewer: string | null
  interviewType: string | null
  reminderDays: number | null
  reminderHours: number | null
  company: Company
}

interface InterviewsListProps {
  interviews: Interview[]
  companies: Company[]
}

export default function InterviewsList({ interviews, companies }: InterviewsListProps) {
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this interview?')) return

    try {
      const response = await fetch(`/api/interviews/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Failed to delete interview')
      }
    } catch (error) {
      alert('Failed to delete interview')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      applied: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      screening: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      interview: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
      offer: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      rejected: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
      withdrawn: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    }
    return colors[status] || colors.applied
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {interviews.map((interview) => (
          <div
            key={interview.id}
            className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-4 border border-gray-200 dark:border-slate-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {interview.company.name}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(interview.status)}`}>
                    {interview.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {interview.role}
                </p>
                {interview.scheduledAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{format(interview.scheduledAt instanceof Date ? interview.scheduledAt : new Date(interview.scheduledAt), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                )}
                {interview.interviewType && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Type: {interview.interviewType}
                  </p>
                )}
                {interview.interviewer && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Interviewer: {interview.interviewer}
                  </p>
                )}
                {interview.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {interview.notes}
                  </p>
                )}
                {interview.referenceLink && (
                  <a
                    href={interview.referenceLink}
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
                  onClick={() => setEditingInterview(interview)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                  title="Edit interview"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(interview.id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                  title="Delete interview"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {interviews.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No interviews yet. Create your first interview to get started.
          </div>
        )}
      </div>
      {editingInterview && (
        <InterviewForm
          interview={editingInterview}
          companies={companies}
          onClose={() => setEditingInterview(null)}
        />
      )}
    </div>
  )
}
