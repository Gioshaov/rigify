'use client'

import { useState } from 'react'
import { updateBusiness } from './actions'

type Business = {
  id: string
  name: string
  subdomain: string
  slug: string
  phone: string
  address: string
  city: string
  status: string
}

export function EditBusinessForm({ business }: { business: Business }) {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateBusiness(business.id, formData)

    setIsSubmitting(false)

    if (result.success) {
      setMessage({ type: 'success', text: result.message })
    } else {
      setMessage({ type: 'error', text: result.message })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-900/20 text-green-300 border border-green-800'
              : 'bg-red-900/20 text-red-300 border border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Business Name</label>
          <input
            type="text"
            name="name"
            defaultValue={business.name}
            required
            className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Subdomain</label>
          <input
            type="text"
            name="subdomain"
            defaultValue={business.subdomain}
            required
            className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white"
          />
          <p className="text-xs text-gray-400 mt-1">3-63 characters, lowercase letters, numbers, hyphens</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Slug</label>
          <input
            type="text"
            name="slug"
            defaultValue={business.slug}
            required
            className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white"
          />
          <p className="text-xs text-gray-400 mt-1">URL-friendly identifier</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone</label>
          <input
            type="text"
            name="phone"
            defaultValue={business.phone}
            required
            placeholder="+995555123456"
            className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">City</label>
          <input
            type="text"
            name="city"
            defaultValue={business.city}
            required
            className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            name="status"
            defaultValue={business.status}
            required
            className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white"
          >
            <option value="active" className="bg-gray-900 text-white">Active</option>
            <option value="inactive" className="bg-gray-900 text-white">Inactive</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Address</label>
        <textarea
          name="address"
          defaultValue={business.address}
          required
          rows={3}
          className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white px-6 py-2 rounded-lg font-medium"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
        <a
          href="/admin"
          className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium inline-block"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
