'use client'

import { useState, useEffect } from 'react'
import { onboardBusiness } from './actions'
import { useUnsavedChanges } from '@/lib/hooks/useUnsavedChanges'

export default function OnboardForm() {
  const [result, setResult] = useState<{ success: boolean; message: string; subdomain?: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  // Warn about unsaved changes
  useUnsavedChanges(isDirty && !loading && !result)

  // Track any input change
  useEffect(() => {
    const handleInput = () => setIsDirty(true)
    const form = document.querySelector('form')
    if (form) {
      form.addEventListener('input', handleInput)
      return () => form.removeEventListener('input', handleInput)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await onboardBusiness(formData)
    setResult(res)
    setLoading(false)
    if (res.success) {
      setIsDirty(false) // Reset after success
    }
  }

  if (result?.success) {
    return (
      <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-6">
        <h2 className="text-green-400 font-bold text-lg mb-2">✓ Business Created</h2>
        <p className="text-gray-300 text-sm whitespace-pre-wrap">{result.message}</p>
        {result.subdomain && (
          <p className="text-white font-mono mt-3 text-sm">
            Dashboard: <span className="text-violet-400">{result.subdomain}.rigify.ge/dashboard</span>
          </p>
        )}
        <button
          onClick={() => setResult(null)}
          className="mt-4 text-sm text-gray-400 hover:text-white underline"
        >
          Onboard another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Business Details */}
      <div className="bg-white/5 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Business Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Business Name *</label>
            <input name="name" required className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500" placeholder="Mitte Beauty Salon" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Subdomain * (no spaces, lowercase)</label>
            <input name="subdomain" required pattern="[a-z0-9\-]+" className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500" placeholder="mitte" />
            <p className="text-xs text-gray-500 mt-1">Will become: mitte.rigify.ge</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Category *</label>
            <select name="category" required className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
              <option value="" className="bg-gray-900 text-white">Select...</option>
              <option value="hair" className="bg-gray-900 text-white">Hair</option>
              <option value="nails" className="bg-gray-900 text-white">Nails</option>
              <option value="skin" className="bg-gray-900 text-white">Skin</option>
              <option value="massage" className="bg-gray-900 text-white">Massage</option>
              <option value="brows" className="bg-gray-900 text-white">Brows</option>
              <option value="makeup" className="bg-gray-900 text-white">Makeup</option>
              <option value="barber" className="bg-gray-900 text-white">Barbershop</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">City *</label>
            <select name="city" required className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500">
              <option value="" className="bg-gray-900 text-white">Select...</option>
              <option value="tbilisi" className="bg-gray-900 text-white">Tbilisi</option>
              <option value="batumi" className="bg-gray-900 text-white">Batumi</option>
              <option value="kutaisi" className="bg-gray-900 text-white">Kutaisi</option>
              <option value="rustavi" className="bg-gray-900 text-white">Rustavi</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Phone *</label>
            <input name="phone" required className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500" placeholder="+995 555 123 456" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Address *</label>
            <input name="address" required className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500" placeholder="Rustaveli Ave 1, Tbilisi" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Slug * (URL-safe, unique)</label>
          <input name="slug" required pattern="[a-z0-9\-]+" className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500" placeholder="mitte-beauty-salon" />
          <p className="text-xs text-gray-500 mt-1">Used in public URL: rigify.ge/business/mitte-beauty-salon</p>
        </div>
      </div>

      {/* Owner Account */}
      <div className="bg-white/5 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Owner / Admin Account</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Owner Email *</label>
            <input name="owner_email" type="email" required className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500" placeholder="owner@salon.ge" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Temporary Password *</label>
            <input name="owner_password" type="password" required minLength={8} className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500" placeholder="Min 8 characters" />
          </div>
        </div>
      </div>

      {/* Optional Staff Account */}
      <div className="bg-white/5 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Staff Account <span className="text-gray-500 font-normal normal-case">(optional)</span>
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Staff Name</label>
            <input name="staff_name" className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500" placeholder="Ucha" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Staff Email</label>
            <input name="staff_email" type="email" className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500" placeholder="ucha@salon.ge" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Staff Password</label>
            <input name="staff_password" type="password" className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500" placeholder="Min 8 characters" />
          </div>
        </div>
      </div>

      {result && !result.success && (
        <p className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg p-3">
          {result.message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
      >
        {loading ? 'Creating...' : 'Create Business + Account'}
      </button>
    </form>
  )
}
