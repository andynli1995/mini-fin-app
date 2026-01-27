'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { Edit, Trash2, ExternalLink, FileText, User, Filter, X } from 'lucide-react'
import AssessmentForm from './AssessmentForm'
import ExpandableText from './ExpandableText'

const ASSESSMENT_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'expired', label: 'Expired' },
]

interface Company {
  id: string
  name: string
}

interface Profile {
  id: string
  name: string
}

interface Assessment {
  id: string
  companyId: string
  title: string
  description: string | null
  deadline: string | Date
  status: string
  referenceLink: string | null
  notes: string | null
  submittedAt: string | Date | null
  reminderDays: number | null
  company: Company
  profile?: Profile | null
}

interface AssessmentsListProps {
  assessments: Assessment[]
  companies: Company[]
  profiles: Profile[]
}

export default function AssessmentsList({ assessments, companies, profiles }: AssessmentsListProps) {
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null)
  const [profileId, setProfileId] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [companyId, setCompanyId] = useState<string>('')
  const [overdueOnly, setOverdueOnly] = useState(false)

  const filteredAssessments = useMemo(() => {
    const isOverdueCheck = (a: Assessment) => {
      const d = a.deadline instanceof Date ? a.deadline : new Date(a.deadline)
      return d < new Date() && !['completed', 'submitted'].includes(a.status)
    }
    return assessments.filter((a) => {
      if (profileId && (a.profile?.id ?? '') !== profileId) return false
      if (status && a.status !== status) return false
      if (companyId && a.companyId !== companyId) return false
      if (overdueOnly && !isOverdueCheck(a)) return false
      return true
    })
  }, [assessments, profileId, status, companyId, overdueOnly])

  const hasActiveFilters = !!profileId || !!status || !!companyId || overdueOnly

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
          {ASSESSMENT_STATUS_OPTIONS.map((o) => (
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
        <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={(e) => setOverdueOnly(e.target.checked)}
            className="rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
          />
          Overdue only
        </label>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => { setProfileId(''); setStatus(''); setCompanyId(''); setOverdueOnly(false) }}
            className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <X className="w-3.5 h-3.5" /> Clear filters
          </button>
        )}
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
          {filteredAssessments.length} of {assessments.length}
        </span>
      </div>

      <div className="grid gap-4">
        {filteredAssessments.map((assessment) => {
          const overdue = isOverdue(assessment.deadline) && !['completed', 'submitted'].includes(assessment.status)
          return (
            <div
              key={assessment.id}
              className={`bg-white dark:bg-slate-800 rounded-xl border shadow-sm hover:shadow-md transition-shadow ${
                overdue
                  ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10'
                  : 'border-gray-200 dark:border-slate-700'
              }`}
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {assessment.company.name}
                        {assessment.profile && (
                          <span className="font-normal text-gray-500 dark:text-gray-400"> · {assessment.profile.name}</span>
                        )}
                      </h3>
                      {assessment.profile && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium">
                          <User className="w-3 h-3" />
                          {assessment.profile.name}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-md ${getStatusColor(assessment.status)}`}>
                        {assessment.status}
                      </span>
                      {overdue && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium">
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {assessment.title}
                    </p>
                    {assessment.description && (
                      <div className="mb-2">
                        <ExpandableText
                          text={assessment.description}
                          maxLength={120}
                          className="text-gray-600 dark:text-gray-400"
                        />
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        Due: {format(assessment.deadline instanceof Date ? assessment.deadline : new Date(assessment.deadline), 'MMM d, yyyy')}
                      </span>
                      {assessment.submittedAt && (
                        <span className="text-green-600 dark:text-green-400">
                          Submitted {format(assessment.submittedAt instanceof Date ? assessment.submittedAt : new Date(assessment.submittedAt), 'MMM d')}
                        </span>
                      )}
                    </div>
                    {assessment.notes && (
                      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                        <ExpandableText text={assessment.notes} maxLength={80} />
                      </div>
                    )}
                    {assessment.referenceLink && (
                      <a
                        href={assessment.referenceLink}
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
                      onClick={() => setEditingAssessment(assessment)}
                      className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(assessment.id)}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {filteredAssessments.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="font-medium">{hasActiveFilters ? 'No assessments match filters' : 'No assessments yet'}</p>
            <p className="text-sm mt-1">
              {hasActiveFilters ? 'Try clearing filters or add new assessments.' : 'Create your first assessment to get started.'}
            </p>
          </div>
        )}
      </div>
      {editingAssessment && (
        <AssessmentForm
          assessment={editingAssessment}
          companies={companies}
          profiles={profiles}
          onClose={() => setEditingAssessment(null)}
        />
      )}
    </div>
  )
}
