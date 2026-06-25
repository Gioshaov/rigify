'use client'

import { useState } from 'react'
import { createServiceAdmin, updateServiceAdmin, deleteServiceAdmin } from './services-actions'

type Service = {
  id: string
  name: string
  name_ka: string | null
  category: string | null
  duration_minutes: number
  price_min: number
  price_max: number | null
  is_active: boolean
}

const CATEGORY_OPTIONS = [
  { id: 'hair', label: 'Hair' },
  { id: 'nails', label: 'Nails' },
  { id: 'skin', label: 'Skin' },
  { id: 'massage', label: 'Massage' },
  { id: 'brows', label: 'Brows' },
  { id: 'makeup', label: 'Makeup' },
  { id: 'barber', label: 'Barbershop' },
]

const inputClass =
  'w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-[#d4a843]'
const labelClass = 'block text-[#888888] text-[10px] uppercase tracking-wider mb-1'

function ServiceFields({ svc }: { svc?: Service }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClass}>Name *</label>
          <input name="name" defaultValue={svc?.name ?? ''} required className={inputClass} data-testid="service-name-input" />
        </div>
        <div>
          <label className={labelClass}>Name (KA)</label>
          <input name="name_ka" defaultValue={svc?.name_ka ?? ''} className={inputClass} data-testid="service-nameka-input" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className={labelClass}>Category</label>
          <select name="category" defaultValue={svc?.category ?? ''} className={inputClass} data-testid="service-category-select">
            <option value="">—</option>
            {CATEGORY_OPTIONS.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Duration *</label>
          <input name="duration_minutes" type="number" min="1" defaultValue={svc?.duration_minutes ?? 60} required className={inputClass} data-testid="service-duration-input" />
        </div>
        <div>
          <label className={labelClass}>Active</label>
          <select name="is_active" defaultValue={svc ? String(svc.is_active) : 'true'} className={inputClass} data-testid="service-active-select">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={labelClass}>Price from (₾) *</label>
          <input name="price_min" type="number" min="0" step="0.01" defaultValue={svc?.price_min ?? ''} required className={inputClass} data-testid="service-pricemin-input" />
        </div>
        <div>
          <label className={labelClass}>Price to (₾)</label>
          <input name="price_max" type="number" min="0" step="0.01" defaultValue={svc?.price_max ?? ''} className={inputClass} data-testid="service-pricemax-input" />
        </div>
      </div>
    </>
  )
}

export function ServicesPanel({ services, businessId }: { services: Service[]; businessId: string }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true); setError(null)
    const res = await createServiceAdmin(businessId, new FormData(e.currentTarget))
    setBusy(false)
    if (res.success) { window.location.reload() } else { setError(res.message) }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>, serviceId: string) {
    e.preventDefault()
    setBusy(true); setError(null)
    const res = await updateServiceAdmin(serviceId, new FormData(e.currentTarget))
    setBusy(false)
    if (res.success) { window.location.reload() } else { setError(res.message) }
  }

  async function handleDelete(serviceId: string) {
    if (!window.confirm('Delete this service? This cannot be undone.')) return
    setBusy(true); setError(null)
    const res = await deleteServiceAdmin(serviceId)
    setBusy(false)
    if (res.success) { window.location.reload() } else { setError(res.message) }
  }

  return (
    <section data-testid="services-panel">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[#888888] text-[11px] uppercase tracking-widest">Services ({services.length})</h3>
        <button
          type="button"
          onClick={() => { setShowAdd((v) => !v); setEditingId(null); setError(null) }}
          data-testid="service-add-toggle-btn"
          className="text-[#d4a843] text-[11px] uppercase tracking-wider hover:underline"
        >
          {showAdd ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {error && (
        <p className="text-[#ef4444] text-xs mb-3" data-testid="services-panel-error">{error}</p>
      )}

      {showAdd && (
        <form onSubmit={handleAdd} className="space-y-2 mb-4 border border-[#2a2a2a] rounded p-3" data-testid="service-add-form">
          <ServiceFields />
          <button type="submit" disabled={busy} data-testid="service-add-submit-btn" className="w-full bg-[#d4a843] text-black text-xs font-bold uppercase tracking-wider py-1.5 rounded hover:brightness-110 disabled:opacity-50">
            {busy ? 'Saving…' : 'Add service'}
          </button>
        </form>
      )}

      {services.length === 0 && !showAdd && (
        <p className="text-[#888888] text-sm">No services yet</p>
      )}

      <div className="space-y-2">
        {services.map((svc) => (
          <div key={svc.id} className="border border-[#2a2a2a] rounded p-2.5" data-testid={`service-row-${svc.id}`}>
            {editingId === svc.id ? (
              <form onSubmit={(e) => handleEdit(e, svc.id)} className="space-y-2" data-testid={`service-edit-form-${svc.id}`}>
                <ServiceFields svc={svc} />
                <div className="flex gap-2">
                  <button type="submit" disabled={busy} data-testid={`service-save-btn-${svc.id}`} className="flex-1 bg-[#d4a843] text-black text-xs font-bold uppercase py-1.5 rounded hover:brightness-110 disabled:opacity-50">{busy ? 'Saving…' : 'Save'}</button>
                  <button type="button" onClick={() => setEditingId(null)} className="px-3 text-[#888888] text-xs hover:text-white">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-white text-sm truncate">
                    {svc.name}
                    {!svc.is_active && <span className="ml-2 text-[#888888] text-[10px] uppercase">inactive</span>}
                  </p>
                  <p className="text-[#888888] text-xs truncate">
                    {svc.category ? `${svc.category} · ` : ''}{svc.duration_minutes}min · ₾{svc.price_min}{svc.price_max ? `–${svc.price_max}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button type="button" onClick={() => { setEditingId(svc.id); setShowAdd(false); setError(null) }} data-testid={`service-edit-btn-${svc.id}`} className="text-[#888888] text-xs hover:text-white">Edit</button>
                  <button type="button" onClick={() => handleDelete(svc.id)} disabled={busy} data-testid={`service-delete-btn-${svc.id}`} className="text-[#ef4444] text-xs hover:brightness-125 disabled:opacity-50">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
