'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import ProfileForm from './ProfileForm'

export default function AddProfileButton() {
  const [showForm, setShowForm] = useState(false)
  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Profile
      </button>
      {showForm && <ProfileForm onClose={() => setShowForm(false)} />}
    </>
  )
}
