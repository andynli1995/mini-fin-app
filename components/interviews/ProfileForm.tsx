'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface Profile {
  id: string
  name: string
}

interface ProfileFormProps {
  profile?: Profile | null
  onClose: () => void
}

export default function ProfileForm({ profile, onClose }: ProfileFormProps) {
  const [name, setName] = useState(profile?.name ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const url = profile ? `/api/profiles/${profile.id}` : '/api/profiles'
      const method = profile ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (res.ok) {
        window.location.reload()
      } else {
        const data = await res.json()
        setError(data.error ?? 'Failed to save profile')
      }
    } catch {
      setError('Failed to save profile')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {profile ? 'Edit Profile' : 'Add Profile'}
          </h2>
          <button type="button" onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
              placeholder="e.g. Larry, Andy"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Use this to identify which applicant/person each application is for.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Saving...' : profile ? 'Update' : 'Add Profile'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
