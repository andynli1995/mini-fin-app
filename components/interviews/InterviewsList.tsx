'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { Edit, Trash2, ExternalLink, Calendar, Briefcase, User, Filter, X } from 'lucide-react'
import InterviewForm from './InterviewForm'
import ExpandableText from './ExpandableText'

const INTERVIEW_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
]

interface Company {
  id: string
  name: string
}

interface Profile {
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
  profile?: Profile | null
}

interface InterviewsListProps {
  interviews: Interview[]
  companies: Company[]
  profiles: Profile[]
}

export default function InterviewsList({ interviews, companies, profiles }: InterviewsListProps) {
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)
  const [profileId, setProfileId] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [companyId, setCompanyId] = useState<string>('')

  const filteredInterviews = useMemo(() => {
    return interviews.filter((i) => {
      if (profileId && (i.profile?.id ?? '') !== profileId) return false
      if (status && i.status !== status) return false
      if (companyId && i.companyId !== companyId) return false
      return true
    })
  }, [interviews, profileId, status, companyId])

  const hasActiveFilters = !!profileId || !!status || !!companyId

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
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700">
        <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        <select
          value={profileId}
          onChange={(e) => setProfileId(e.target.value)}
          className="text-sm rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400"
          aria-label="Filter by profile"
        >
          <option value="">All profiles</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-sm rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400"
          aria-label="Filter by status"
        >
          {INTERVIEW_STATUS_OPTIONS.map((o) => (
            <option key={o.value || 'all'} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="text-sm rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400"
          aria-label="Filter by company"
        >
          <option value="">All companies</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => { setProfileId(''); setStatus(''); setCompanyId('') }}
            className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <X className="w-3.5 h-3.5" /> Clear filters
          </button>
        )}
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
          {filteredInterviews.length} of {interviews.length}
        </span>
      </div>

      <div className="grid gap-4">
        {filteredInterviews.map((interview) => (
          <div
            key={interview.id}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5 border border-gray-200 dark:border-slate-700"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {interview.company.name}
                    {interview.profile && (
                      <span className="font-normal text-gray-500 dark:text-gray-400"> · {interview.profile.name}</span>
                    )}
                  </h3>
                  {interview.profile && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium">
                      <User className="w-3 h-3" />
                      {interview.profile.name}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-md ${getStatusColor(interview.status)}`}>
                    {interview.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {interview.role}
                </p>
                {interview.scheduledAt && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <Calendar className="w-3 h-3" />
                    <span>{format(interview.scheduledAt instanceof Date ? interview.scheduledAt : new Date(interview.scheduledAt), 'MMM d, yyyy h:mm a')}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                  {interview.interviewType && <span>Type: {interview.interviewType}</span>}
                  {interview.interviewer && <span>Interviewer: {interview.interviewer}</span>}
                </div>
                {interview.notes && (
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                    <ExpandableText text={interview.notes} maxLength={80} />
                  </div>
                )}
                {interview.referenceLink && (
                  <a
                    href={interview.referenceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Reference link
                  </a>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => setEditingInterview(interview)}
                  className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(interview.id)}
                  className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredInterviews.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700">
            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium">{hasActiveFilters ? 'No interviews match filters' : 'No interviews yet'}</p>
            <p className="text-sm mt-1">
              {hasActiveFilters ? 'Try clearing filters or add new interviews.' : 'Create your first interview to get started.'}
            </p>
          </div>
        )}
      </div>
      {editingInterview && (
        <InterviewForm
          interview={editingInterview}
          companies={companies}
          profiles={profiles}
          onClose={() => setEditingInterview(null)}
        />
      )}
    </div>
  )
}
