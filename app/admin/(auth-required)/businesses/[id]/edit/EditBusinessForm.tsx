'use client'

import { useState } from 'react'
import { updateBusiness } from './actions'
import { CATEGORIES } from '@/lib/constants/categories'
import { CITIES } from '@/lib/constants/cities'
import { CategoryDropdown } from './CategoryDropdown'
import { StaffPanel } from './StaffPanel'
import { ImageUpload } from '@/components/ui/ImageUpload'

type Business = {
  id: string
  name: string
  description: string | null
  subdomain: string
  slug: string
  phone: string
  email: string | null
  website: string | null
  instagram: string | null
  address: string
  city: string
  district: string | null
  status: string
  cover_image_url: string | null
  logo_url: string | null
  hours: any
}

type StaffMember = {
  id: string
  name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

export function EditBusinessForm({
  business,
  categoryIds,
  staff
}: {
  business: Business
  categoryIds: string[]
  staff: StaffMember[] | null
}) {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Live preview state
  const [liveBusinessName, setLiveBusinessName] = useState(business.name)
  const [liveSubdomain, setLiveSubdomain] = useState(business.subdomain)
  const [liveStatus, setLiveStatus] = useState(business.status)
  const [liveCategories, setLiveCategories] = useState<string[]>(categoryIds)
  const [coverImageUrl, setCoverImageUrl] = useState(business.cover_image_url)
  const [logoUrl, setLogoUrl] = useState(business.logo_url)

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

  async function copySubdomainUrl() {
    const url = `https://${liveSubdomain}.rigify.ge`
    await navigator.clipboard.writeText(url)
    alert('Subdomain URL copied!')
  }

  return (
    <div className="flex gap-6">
      {/* Left Panel - Form */}
      <div className="flex-[0_0_60%]">
        <form onSubmit={handleSubmit} className="space-y-5">
          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-900/20 text-green-300 border border-green-800'
                  : 'bg-red-900/20 text-red-300 border border-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 pb-2 border-b border-white/10">
              Basic Information
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Business Name *</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={business.name}
                    onChange={(e) => setLiveBusinessName(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Subdomain *</label>
                  <input
                    type="text"
                    name="subdomain"
                    defaultValue={business.subdomain}
                    onChange={(e) => setLiveSubdomain(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Status *</label>
                  <select
                    name="status"
                    defaultValue={business.status}
                    onChange={(e) => setLiveStatus(e.target.value)}
                    required
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="active" className="bg-gray-900 text-white">Active</option>
                    <option value="inactive" className="bg-gray-900 text-white">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Slug (URL) *</label>
                  <input
                    type="text"
                    name="slug"
                    defaultValue={business.slug}
                    required
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  name="description"
                  defaultValue={business.description || ''}
                  rows={3}
                  maxLength={500}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none"
                  placeholder="Describe the business..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Categories *</label>
                <CategoryDropdown
                  defaultSelected={categoryIds}
                  onChange={(categories) => setLiveCategories(categories)}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 pb-2 border-b border-white/10">
              Location
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">City *</label>
                  <select
                    name="city"
                    defaultValue={business.city}
                    required
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    {CITIES.map((city) => (
                      <option key={city.id} value={city.id} className="bg-gray-900 text-white">
                        {city.en} · {city.ka}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">District</label>
                  <input
                    type="text"
                    name="district"
                    defaultValue={business.district || ''}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="e.g. Vake, Saburtalo..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Street Address *</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={business.address}
                  required
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 pb-2 border-b border-white/10">
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Phone *</label>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={business.phone}
                    required
                    placeholder="+995555123456"
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={business.email || ''}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="contact@business.ge"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Website</label>
                  <input
                    type="url"
                    name="website"
                    defaultValue={business.website || ''}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Instagram</label>
                  <input
                    type="text"
                    name="instagram"
                    defaultValue={business.instagram || ''}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="@username"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 pb-2 border-b border-white/10">
              Images
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Cover Image</label>
                <input type="hidden" name="cover_image_url" value={coverImageUrl || ''} />
                <ImageUpload
                  businessId={business.id}
                  type="cover"
                  currentUrl={coverImageUrl}
                  onUploadComplete={(url) => setCoverImageUrl(url)}
                  variant="admin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Logo</label>
                <input type="hidden" name="logo_url" value={logoUrl || ''} />
                <ImageUpload
                  businessId={business.id}
                  type="logo"
                  currentUrl={logoUrl}
                  onUploadComplete={(url) => setLogoUrl(url)}
                  variant="admin"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-white/10">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white px-5 py-2 rounded-lg text-sm font-medium"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <a
              href="/admin"
              className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg text-sm font-medium inline-block"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>

      {/* Right Panel - Summary */}
      <div className="flex-[0_0_40%]">
        <div className="sticky top-6 space-y-4">
          {/* Live Preview Box */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Live Preview</p>
            <h2 className="text-xl font-bold text-white mb-2">{liveBusinessName || 'Untitled Business'}</h2>
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                liveStatus === 'active'
                  ? 'bg-green-900/30 text-green-400 border border-green-800'
                  : 'bg-red-900/30 text-red-400 border border-red-800'
              }`}>
                {liveStatus === 'active' ? '● Active' : '● Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-400 font-mono bg-white/5 px-3 py-2 rounded border border-white/10 mb-3">
              {liveSubdomain || 'subdomain'}.rigify.ge
            </p>

            {/* Categories */}
            {liveCategories.length > 0 && (
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Categories</p>
                <div className="flex flex-wrap gap-1.5">
                  {liveCategories.map((catId) => {
                    const cat = CATEGORIES.find(c => c.id === catId)
                    return cat ? (
                      <span key={catId} className="inline-flex items-center px-2 py-1 rounded text-xs bg-violet-900/30 text-violet-300 border border-violet-800">
                        {cat.en}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="pt-3 border-t border-white/10">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick Actions</p>
              <div className="space-y-2">
                <a
                  href={`${typeof window !== 'undefined' ? window.location.origin : ''}/businesses/${business.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  <span>View Public Page</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                <button
                  type="button"
                  onClick={copySubdomainUrl}
                  className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  <span>Copy Subdomain URL</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Staff Panel Box */}
          <StaffPanel staff={staff || []} businessId={business.id} />
        </div>
      </div>
    </div>
  )
}
