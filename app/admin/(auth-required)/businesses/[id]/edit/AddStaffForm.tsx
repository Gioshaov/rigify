'use client'

import { useState } from 'react'
import { createStaffMember } from './actions'

export function AddStaffForm({ businessId }: { businessId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const formData = new FormData(e.currentTarget)
    const response = await createStaffMember(businessId, formData)

    setLoading(false)
    setResult(response)

    if (response.success) {
      // Reset form and close
      e.currentTarget.reset()
      setTimeout(() => {
        setIsOpen(false)
        setResult(null)
        // Reload page to show new staff member
        window.location.reload()
      }, 1500)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
      >
        + Add Staff Member
      </button>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Add New Staff Member</h3>
        <button
          onClick={() => {
            setIsOpen(false)
            setResult(null)
          }}
          className="text-gray-400 hover:text-white"
        >
          ✕ Cancel
        </button>
      </div>

      {result && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            result.success
              ? 'bg-green-900/20 text-green-300 border border-green-800'
              : 'bg-red-900/20 text-red-300 border border-red-800'
          }`}
        >
          {result.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              name="staff_name"
              required
              disabled={loading}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
              placeholder="Full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              name="staff_email"
              required
              disabled={loading}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
              placeholder="staff@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password *</label>
            <input
              type="password"
              name="staff_password"
              required
              minLength={8}
              disabled={loading}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
              placeholder="Min 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role *</label>
            <select
              name="staff_role"
              required
              disabled={loading}
              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
            >
              <option value="staff" className="bg-gray-900 text-white">Staff</option>
              <option value="manager" className="bg-gray-900 text-white">Manager</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Specialty</label>
          <input
            type="text"
            name="staff_specialty"
            disabled={loading}
            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm disabled:opacity-50"
            placeholder="e.g. Hair stylist, Nail technician..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {loading ? 'Creating...' : 'Create Staff Member'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              setResult(null)
            }}
            disabled={loading}
            className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
