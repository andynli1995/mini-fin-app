'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { toLocalDatetimeLocalString } from '@/lib/datetime-local'

interface Company {
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
  profileId?: string | null
  profile?: { id: string; name: string } | null
}

interface Profile {
  id: string
  name: string
}

interface AssessmentFormProps {
  assessment?: Assessment | null
  companies: Company[]
  profiles: Profile[]
  onClose: () => void
}

export default function AssessmentForm({ assessment, companies, profiles, onClose }: AssessmentFormProps) {
  const [formData, setFormData] = useState({
    companyId: assessment?.companyId || '',
    profileId: assessment?.profileId ?? assessment?.profile?.id ?? '',
    title: assessment?.title || '',
    description: assessment?.description || '',
    deadline: assessment?.deadline
      ? toLocalDatetimeLocalString(new Date(assessment.deadline))
      : '',
    status: assessment?.status || 'pending',
    referenceLink: assessment?.referenceLink || '',
    notes: assessment?.notes || '',
    submittedAt: assessment?.submittedAt
      ? toLocalDatetimeLocalString(new Date(assessment.submittedAt))
      : '',
    reminderDays: assessment?.reminderDays?.toString() ?? '1',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const url = assessment
        ? `/api/assessments/${assessment.id}`
        : '/api/assessments'
      const method = assessment ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
          submittedAt: formData.submittedAt ? new Date(formData.submittedAt).toISOString() : null,
          reminderDays: formData.reminderDays ? parseInt(formData.reminderDays) : 1,
          profileId: formData.profileId || null,
        }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save assessment')
      }
    } catch (error) {
      setError('Failed to save assessment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {assessment ? 'Edit Assessment' : 'Add Assessment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company *
              </label>
              <select
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                className="block w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="">Select company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Profile (applicant)
              </label>
              <select
                value={formData.profileId}
                onChange={(e) => setFormData({ ...formData, profileId: e.target.value })}
                className="block w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">None</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                e.g. Larry, Andy — which profile this application is for
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="block w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="block w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              placeholder="Assessment description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Deadline *
              </label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="block w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                required
                aria-describedby="deadline-timezone-hint"
              />
              <p id="deadline-timezone-hint" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {typeof Intl !== 'undefined'
                  ? `Your local time · ${Intl.DateTimeFormat().resolvedOptions().timeZone}`
                  : 'Your local time'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="block w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="submitted">Submitted</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reminder (Days Before Deadline)
            </label>
            <input
              type="number"
              min="0"
              value={formData.reminderDays}
              onChange={(e) => setFormData({ ...formData, reminderDays: e.target.value })}
              className="block w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              placeholder="1"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Days before deadline to send reminder (default: 1)
            </p>
          </div>

          {formData.status === 'submitted' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Submitted At
              </label>
              <input
                type="datetime-local"
                value={formData.submittedAt}
                onChange={(e) => setFormData({ ...formData, submittedAt: e.target.value })}
                className="block w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                aria-describedby="submitted-at-timezone-hint"
              />
              <p id="submitted-at-timezone-hint" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {typeof Intl !== 'undefined'
                  ? `Your local time · ${Intl.DateTimeFormat().resolvedOptions().timeZone}`
                  : 'Your local time'}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reference Link
            </label>
            <input
              type="url"
              value={formData.referenceLink}
              onChange={(e) => setFormData({ ...formData, referenceLink: e.target.value })}
              className="block w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="block w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Saving...' : assessment ? 'Update Assessment' : 'Add Assessment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
