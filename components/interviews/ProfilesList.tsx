'use client'

import { useState } from 'react'
import { Edit, Trash2, User } from 'lucide-react'
import ProfileForm from './ProfileForm'

interface Profile {
  id: string
  name: string
  _count?: {
    interviews: number
    assessments: number
  }
}

interface ProfilesListProps {
  profiles: Profile[]
}

export default function ProfilesList({ profiles }: ProfilesListProps) {
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this profile? Interviews and assessments linked to it will keep their data but the link will be removed.')) return
    try {
      const res = await fetch(`/api/profiles/${id}`, { method: 'DELETE' })
      if (res.ok) window.location.reload()
      else alert('Failed to delete profile')
    } catch {
      alert('Failed to delete profile')
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 sm:p-5 border border-gray-200 dark:border-slate-700"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {profile.name}
                  </h3>
                  {profile._count && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {profile._count.interviews} interview{profile._count.interviews !== 1 ? 's' : ''} · {profile._count.assessments} assessment{profile._count.assessments !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => setEditingProfile(profile)}
                  className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(profile.id)}
                  className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {profiles.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700">
          <User className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No profiles yet</p>
          <p className="text-sm mt-1">Create profiles (e.g. Larry, Andy) to tag which applicant each application is for.</p>
        </div>
      )}
      {editingProfile && (
        <ProfileForm profile={editingProfile} onClose={() => setEditingProfile(null)} />
      )}
    </div>
  )
}
