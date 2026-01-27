'use client'

import { format, differenceInDays } from 'date-fns'
import { Calendar, AlertCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface Interview {
  id: string
  role: string
  scheduledAt: string | Date | null
  status: string
  company: {
    id: string
    name: string
  }
  profile?: { id: string; name: string } | null
  referenceLink?: string | null
}

interface UpcomingInterviewsProps {
  interviews: Interview[]
  overdueCount: number
}

export default function UpcomingInterviews({
  interviews,
  overdueCount,
}: UpcomingInterviewsProps) {
  const getDaysUntil = (date: string | Date | null) => {
    if (!date) return null
    const dateObj = date instanceof Date ? date : new Date(date)
    return differenceInDays(dateObj, new Date())
  }

  const getUrgencyColor = (days: number | null) => {
    if (days === null) return 'text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-700'
    if (days < 0) return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
    if (days <= 1) return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
    if (days <= 3) return 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30'
    return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
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
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg p-6 border border-gray-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Upcoming Interviews
        </h2>
        <Link
          href="/tools/interviews/interviews"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {interviews.length === 0 && overdueCount === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No upcoming interviews
          </p>
        ) : (
          <>
            {interviews.map((interview) => {
              const daysUntil = getDaysUntil(interview.scheduledAt)
              return (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-full ${getUrgencyColor(daysUntil)}`}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {interview.company.name}
                        {interview.profile?.name && (
                          <span className="ml-1.5 text-xs font-normal text-gray-500 dark:text-gray-400">
                            · {interview.profile.name}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {interview.role}
                      </p>
                      {interview.scheduledAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {format(interview.scheduledAt instanceof Date ? interview.scheduledAt : new Date(interview.scheduledAt), 'MMM d, yyyy h:mm a')}
                          {daysUntil !== null && (
                            <span className={`ml-2 ${
                              daysUntil < 0 ? 'text-red-600 dark:text-red-400' :
                              daysUntil <= 1 ? 'text-red-600 dark:text-red-400' :
                              daysUntil <= 3 ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-blue-600 dark:text-blue-400'
                            }`}>
                              {daysUntil < 0 ? `${Math.abs(daysUntil)} days ago` :
                               daysUntil === 0 ? 'Today' :
                               daysUntil === 1 ? 'Tomorrow' :
                               `in ${daysUntil} days`}
                            </span>
                          )}
                        </p>
                      )}
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${getStatusColor(interview.status)}`}>
                        {interview.status}
                      </span>
                    </div>
                  </div>
                  {interview.referenceLink && (
                    <a
                      href={interview.referenceLink}
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
            })}
          </>
        )}
      </div>
    </div>
  )
}
