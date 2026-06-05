'use client'

import { useState, useEffect } from 'react'
import { updateStaff, deleteStaff } from './actions'
import { useTranslations } from '@/lib/hooks/useTranslations'

type StaffMember = {
  id: string
  name: string
  role: string
  is_active: boolean
  created_at: string
}

export function StaffTable({ staff }: { staff: StaffMember[] }) {
  const { tr, lang } = useTranslations()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Warn about unsaved changes when editing
  useEffect(() => {
    if (!editingId) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')

      if (link && link.href) {
        const confirmed = confirm('You have unsaved changes. Leave without saving?')
        if (!confirmed) {
          e.preventDefault()
          e.stopPropagation()
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('click', handleLinkClick, true)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('click', handleLinkClick, true)
    }
  }, [editingId])

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>, staffId: string) {
    e.preventDefault()

    setLoading(true)
    setResult(null)

    const formData = new FormData(e.currentTarget)
    const response = await updateStaff(staffId, formData)

    setLoading(false)
    setResult(response)

    if (response.success) {
      setTimeout(() => {
        setEditingId(null)
        setResult(null)
        window.location.reload()
      }, 1000)
    }
  }

  async function handleDelete(staffId: string, staffName: string) {
    if (!confirm(tr.dashboard.staff.confirmRemove[lang].replace("{name}", staffName))) {
      return
    }

    setLoading(true)
    setResult(null)

    const response = await deleteStaff(staffId)

    setLoading(false)
    setResult(response)

    if (response.success) {
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  return (
    <div>
      {result && (
        <div className={`mb-stack-md p-gutter border ${
          result.success
            ? 'border-primary bg-surface'
            : 'border-error bg-surface'
        }`}>
          <p className={`label-mono ${result.success ? 'text-primary' : 'text-error'}`}>
            {result.success ? '✓' : '✗'} {result.message}
          </p>
        </div>
      )}

      <div className="border border-outline-variant">
        <table className="w-full">
          <thead className="bg-surface border-b border-outline-variant">
            <tr>
              <th className="text-left px-gutter py-stack-md label-mono">{tr.dashboard.staff.name[lang]}</th>
              <th className="text-left px-gutter py-stack-md label-mono">{tr.dashboard.staff.role[lang]}</th>
              <th className="text-left px-gutter py-stack-md label-mono">{tr.dashboard.staff.status[lang]}</th>
              <th className="text-left px-gutter py-stack-md label-mono">{tr.dashboard.staff.added[lang]}</th>
              <th className="text-left px-gutter py-stack-md label-mono">{tr.dashboard.staff.actions[lang]}</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              editingId === member.id ? (
                // Edit Form Row
                <tr key={member.id} className="border-b border-outline-variant last:border-0 bg-surface">
                  <td colSpan={5} className="px-gutter py-stack-md">
                    <form onSubmit={(e) => handleUpdate(e, member.id)} className="space-y-stack-md">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                        <div>
                          <label className="label-mono block mb-stack-sm">{tr.dashboard.staff.name[lang]} *</label>
                          <input
                            type="text"
                            name="name"
                            defaultValue={member.name}
                            required
                            disabled={loading}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="label-mono block mb-stack-sm">{tr.dashboard.staff.role[lang]} *</label>
                          <select
                            name="role"
                            defaultValue={member.role}
                            required
                            disabled={loading}
                            className="input-field"
                          >
                            <option value="staff">{tr.dashboard.staff.staffRole[lang]}</option>
                            <option value="manager">{tr.dashboard.staff.managerRole[lang]}</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="flex items-center gap-stack-sm cursor-pointer">
                          <input
                            type="checkbox"
                            name="is_active"
                            defaultChecked={member.is_active}
                            disabled={loading}
                            className="w-4 h-4"
                          />
                          <span className="label-mono">{tr.dashboard.staff.active[lang]}</span>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-stack-sm">
                          <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                          >
                            {loading ? tr.dashboard.staff.saving[lang] : tr.dashboard.staff.saveChanges[lang]}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null)
                              setResult(null)
                            }}
                            disabled={loading}
                            className="btn-secondary"
                          >
                            {tr.common.cancel[lang]}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(member.id, member.name)}
                          disabled={loading}
                          className="label-mono text-error hover:underline text-sm"
                        >
                          {tr.dashboard.staff.removeStaffMember[lang]}
                        </button>
                      </div>
                    </form>
                  </td>
                </tr>
              ) : (
                // Normal Row
                <tr key={member.id} className="border-b border-outline-variant last:border-0">
                  <td className="px-gutter py-stack-md text-on-surface">{member.name}</td>
                  <td className="px-gutter py-stack-md text-on-surface capitalize">{member.role}</td>
                  <td className="px-gutter py-stack-md">
                    <span className={`label-mono text-xs px-2 py-1 rounded ${
                      member.is_active
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {member.is_active ? tr.dashboard.staff.active[lang] : tr.dashboard.staff.inactive[lang]}
                    </span>
                  </td>
                  <td className="px-gutter py-stack-md text-on-surface-variant">
                    {new Date(member.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-gutter py-stack-md">
                    <button
                      onClick={() => setEditingId(member.id)}
                      className="label-mono text-primary hover:underline text-sm py-2 px-3 -mx-3"
                    >
                      {tr.common.edit[lang]}
                    </button>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
