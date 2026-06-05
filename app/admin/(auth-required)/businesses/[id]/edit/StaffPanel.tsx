'use client'

import { useState } from 'react'
import { createStaffMember } from './actions'
import { updateStaffMember } from './staff-actions'

type StaffMember = {
  id: string
  name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

export function StaffPanel({ staff, businessId }: { staff: StaffMember[]; businessId: string }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editResult, setEditResult] = useState<{ success?: boolean; message?: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const formData = new FormData(e.currentTarget)
    const response = await createStaffMember(businessId, formData)

    setLoading(false)
    setResult(response)

    if (response.success) {
      e.currentTarget.reset()
      setTimeout(() => {
        setShowAddForm(false)
        setResult(null)
        window.location.reload()
      }, 1500)
    }
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>, staffId: string) {
    e.preventDefault()
    setEditLoading(true)
    setEditResult(null)

    const formData = new FormData(e.currentTarget)
    const response = await updateStaffMember(staffId, formData)

    setEditLoading(false)
    setEditResult(response)

    if (response.success) {
      setTimeout(() => {
        setEditingId(null)
        setEditResult(null)
        window.location.reload()
      }, 1000)
    }
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Staff Members</p>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-2 py-1 rounded"
        >
          {showAddForm ? '✕' : '+'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="space-y-2">
          {result && (
            <div className={`p-2 rounded text-xs ${
              result.success
                ? 'bg-green-900/20 text-green-300 border border-green-800'
                : 'bg-red-900/20 text-red-300 border border-red-800'
            }`}>
              {result.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              name="staff_name"
              placeholder="Name"
              required
              disabled={loading}
              className="w-full bg-white/10 border border-white/10 rounded px-2 py-1.5 text-white text-xs"
            />
            <input
              name="staff_email"
              type="email"
              placeholder="Email"
              required
              disabled={loading}
              className="w-full bg-white/10 border border-white/10 rounded px-2 py-1.5 text-white text-xs"
            />
            <input
              name="staff_password"
              type="password"
              placeholder="Password (min 8 chars)"
              required
              minLength={8}
              disabled={loading}
              className="w-full bg-white/10 border border-white/10 rounded px-2 py-1.5 text-white text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                name="staff_role"
                required
                disabled={loading}
                className="bg-white/10 border border-white/10 rounded px-2 py-1.5 text-white text-xs"
              >
                <option value="staff" className="bg-gray-900">Staff</option>
                <option value="manager" className="bg-gray-900">Manager</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white text-xs px-2 py-1.5 rounded"
              >
                {loading ? '...' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff List */}
      <div className="space-y-2">
        {!staff || staff.length === 0 ? (
          <p className="text-xs text-gray-500">No staff members</p>
        ) : (
          staff.map((member) => (
            <div
              key={member.id}
              className="bg-white/5 border border-white/10 rounded p-2"
            >
              {editingId === member.id ? (
                // Edit Form
                <form onSubmit={(e) => handleEditSubmit(e, member.id)} className="space-y-2">
                  <input
                    name="name"
                    defaultValue={member.name}
                    required
                    disabled={editLoading}
                    placeholder="Name"
                    className="w-full bg-white/10 border border-white/10 rounded px-2 py-1 text-white text-xs"
                  />
                  <input
                    name="email"
                    type="email"
                    defaultValue={member.email}
                    required
                    disabled={editLoading}
                    placeholder="Email"
                    className="w-full bg-white/10 border border-white/10 rounded px-2 py-1 text-white text-xs"
                  />
                  <input
                    name="password"
                    type="password"
                    disabled={editLoading}
                    placeholder="New password (leave empty to keep current)"
                    className="w-full bg-white/10 border border-white/10 rounded px-2 py-1 text-white text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      name="role"
                      defaultValue={member.role}
                      required
                      disabled={editLoading}
                      className="bg-white/10 border border-white/10 rounded px-2 py-1 text-white text-xs"
                    >
                      <option value="staff" className="bg-gray-900">Staff</option>
                      <option value="manager" className="bg-gray-900">Manager</option>
                    </select>
                    <select
                      name="is_active"
                      defaultValue={member.is_active ? 'true' : 'false'}
                      required
                      disabled={editLoading}
                      className="bg-white/10 border border-white/10 rounded px-2 py-1 text-white text-xs"
                    >
                      <option value="true" className="bg-gray-900">Active</option>
                      <option value="false" className="bg-gray-900">Inactive</option>
                    </select>
                  </div>

                  {editResult && (
                    <p className={`text-xs ${editResult.success ? 'text-green-300' : 'text-red-300'}`}>
                      {editResult.message}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white text-xs px-2 py-1 rounded"
                    >
                      {editLoading ? '...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null)
                        setEditResult(null)
                      }}
                      disabled={editLoading}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs px-2 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // View Mode
                <div className="space-y-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{member.name}</p>
                      <p className="text-xs text-gray-400">{member.email}</p>
                      <p className="text-xs text-gray-500 uppercase">{member.role}</p>
                    </div>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${
                      member.is_active
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button
                    onClick={() => setEditingId(member.id)}
                    className="text-xs text-violet-400 hover:text-violet-300"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
