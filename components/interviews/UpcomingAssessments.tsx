'use client'

import { format, differenceInDays } from 'date-fns'
import { FileText, AlertCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Assessment {
  id: string
  title: string
  deadline: string | Date
  status: string
  company: {
    id: string
    name: string
  }
  referenceLink?: string | null
}

interface UpcomingAssessmentsProps {
  assessments: Assessment[]
  overdueAssessments: Assessment[]
}

export default function UpcomingAssessments({
  assessments,
  overdueAssessments,
}: UpcomingAssessmentsProps) {
  const getDaysUntil = (date: string | Date) => {
    const dateObj = date instanceof Date ? date : new Date(date)
    return differenceInDays(dateObj, new Date())
  }

  const getUrgencyColor = (days: number) => {
    if (days < 0) return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
    if (days <= 1) return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
    if (days <= 3) return 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30'
    return 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30'
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

  const allAssessments = [...overdueAssessments, ...assessments].slice(0, 5)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-6 border border-gray-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Upcoming Assessments
        </h2>
        <Link
          href="/tools/interviews/assessments"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          View all
        </Link>
      </div>
      {overdueAssessments.length > 0 && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-800 dark:text-red-300">
              {overdueAssessments.length} Overdue Assessment{overdueAssessments.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {allAssessments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No upcoming assessments
          </p>
        ) : (
          allAssessments.map((assessment) => {
            const daysUntil = getDaysUntil(assessment.deadline)
            return (
              <div
                key={assessment.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-full ${getUrgencyColor(daysUntil)}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {assessment.company.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {assessment.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Due: {format(assessment.deadline instanceof Date ? assessment.deadline : new Date(assessment.deadline), 'MMM d, yyyy')}
                      <span className={`ml-2 ${
                        daysUntil < 0 ? 'text-red-600 dark:text-red-400' :
                        daysUntil <= 1 ? 'text-red-600 dark:text-red-400' :
                        daysUntil <= 3 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-orange-600 dark:text-orange-400'
                      }`}>
                        {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` :
                         daysUntil === 0 ? 'Due today' :
                         daysUntil === 1 ? 'Due tomorrow' :
                         `in ${daysUntil} days`}
                      </span>
                    </p>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${getStatusColor(assessment.status)}`}>
                      {assessment.status}
                    </span>
                  </div>
                </div>
                {assessment.referenceLink && (
                  <a
                    href={assessment.referenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    title="View reference"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
