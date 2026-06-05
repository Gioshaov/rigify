'use client'

import { useState } from 'react'
import { updateStaffMember } from './staff-actions'

type Staff = {
  id: string
  name: string
  role: string
  is_active: boolean
  created_at: string
}

export function StaffEditRow({ staff }: { staff: Staff }) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateStaffMember(staff.id, formData)

    setLoading(false)

    if (result.success) {
      setMessage({ type: 'success', text: result.message })
      setIsEditing(false)
      // Refresh the page after a short delay
      setTimeout(() => window.location.reload(), 1000)
    } else {
      setMessage({ type: 'error', text: result.message })
    }
  }

  if (isEditing) {
    return (
      <tr className="border-b border-white/5 bg-white/5">
        <td colSpan={4} className="p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={staff.name}
                  required
                  className="w-full bg-white/10 border border-white/10 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Role</label>
                <select
                  name="role"
                  defaultValue={staff.role}
                  required
                  className="w-full bg-white/10 border border-white/10 rounded px-3 py-2 text-sm"
                >
                  <option value="staff" className="bg-gray-900">Staff</option>
                  <option value="manager" className="bg-gray-900">Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Status</label>
                <select
                  name="is_active"
                  defaultValue={staff.is_active ? 'true' : 'false'}
                  required
                  className="w-full bg-white/10 border border-white/10 rounded px-3 py-2 text-sm"
                >
                  <option value="true" className="bg-gray-900">Active</option>
                  <option value="false" className="bg-gray-900">Inactive</option>
                </select>
              </div>
            </div>

            {message && (
              <p className={`text-xs ${message.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                {message.text}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setMessage(null)
                }}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/5">
      <td className="px-4 py-3">{staff.name}</td>
      <td className="px-4 py-3 capitalize">{staff.role}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-0.5 rounded text-xs ${
          staff.is_active
            ? 'bg-green-900 text-green-300'
            : 'bg-gray-800 text-gray-400'
        }`}>
          {staff.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-400 flex items-center justify-between">
        <span>{new Date(staff.created_at).toLocaleDateString()}</span>
        <button
          onClick={() => setIsEditing(true)}
          className="text-violet-400 hover:text-violet-300 text-sm ml-4"
        >
          Edit
        </button>
      </td>
    </tr>
  )
}
