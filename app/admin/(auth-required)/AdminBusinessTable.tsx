'use client'

import { useState, useMemo } from 'react'
import { CITIES } from '@/lib/constants/cities'
import { TBILISI_DISTRICTS } from '@/lib/constants/districts'

type Business = {
  id: string
  name: string
  subdomain: string
  status: string
  city: string
  district: string | null
  created_at: string
}

export function AdminBusinessTable({ businesses }: { businesses: Business[] }) {
  const [selectedCity, setSelectedCity] = useState<string>('all')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) => {
      if (selectedCity !== 'all' && business.city !== selectedCity) {
        return false
      }

      if (selectedDistrict !== 'all') {
        if (!business.district) return false

        const businessDistrict = business.district.toLowerCase().trim()
        const selectedDistrictName = TBILISI_DISTRICTS.find(d => d.id === selectedDistrict)

        if (selectedDistrictName) {
          const matchesEn = businessDistrict === selectedDistrictName.en.toLowerCase()
          const matchesKa = business.district.trim() === selectedDistrictName.ka
          const matchesId = businessDistrict === selectedDistrict

          if (!matchesEn && !matchesKa && !matchesId) return false
        }
      }

      if (selectedStatus !== 'all' && business.status !== selectedStatus) {
        return false
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = business.name.toLowerCase().includes(query)
        const matchesSubdomain = business.subdomain?.toLowerCase().includes(query)

        if (!matchesName && !matchesSubdomain) return false
      }

      return true
    })
  }, [businesses, selectedCity, selectedDistrict, selectedStatus, searchQuery])

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
            Search
          </label>
          <input
            id="search"
            type="text"
            placeholder="Name or subdomain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="admin-business-search-input"
            className="w-full bg-white/10 border border-white/10 rounded px-3 py-2 text-white text-sm"
          />
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
            City
          </label>
          <select
            id="city"
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value)
              if (e.target.value !== 'tbilisi') {
                setSelectedDistrict('all')
              }
            }}
            data-testid="admin-business-city-filter"
            className="w-full bg-white/10 border border-white/10 rounded px-3 py-2 text-white text-sm"
          >
            <option value="all">All Cities</option>
            {CITIES.map((city) => (
              <option key={city.id} value={city.id}>
                {city.en}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label htmlFor="district" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
            District
          </label>
          <select
            id="district"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            data-testid="admin-business-district-filter"
            className="w-full bg-white/10 border border-white/10 rounded px-3 py-2 text-white text-sm disabled:opacity-50"
            disabled={selectedCity !== 'tbilisi' && selectedCity !== 'all'}
          >
            <option value="all">All Districts</option>
            {TBILISI_DISTRICTS.map((district) => (
              <option key={district.id} value={district.id}>
                {district.en}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
            Status
          </label>
          <select
            id="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            data-testid="admin-business-status-filter"
            className="w-full bg-white/10 border border-white/10 rounded px-3 py-2 text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={() => {
              setSelectedCity('all')
              setSelectedDistrict('all')
              setSelectedStatus('all')
              setSearchQuery('')
            }}
            data-testid="admin-business-clear-filters-btn"
            className="w-full bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide">
          Showing {filteredBusinesses.length} of {businesses.length} businesses
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 text-left">
              <th className="pb-3 pr-4">Business</th>
              <th className="pb-3 pr-4">Subdomain</th>
              <th className="pb-3 pr-4">City</th>
              <th className="pb-3 pr-4">District</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Created</th>
              <th className="pb-3 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBusinesses.map((b) => (
              <tr key={b.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 pr-4 font-medium">{b.name}</td>
                <td className="py-3 pr-4 text-gray-400">{b.subdomain ? `${b.subdomain}.rigify.ge` : '—'}</td>
                <td className="py-3 pr-4 text-gray-400">{b.city}</td>
                <td className="py-3 pr-4 text-gray-400">{b.district || '—'}</td>
                <td className="py-3 pr-4">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    b.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="py-3 pr-4 text-gray-400">
                  {new Date(b.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 pr-4">
                  <a
                    href={`/admin/businesses/${b.id}/edit`}
                    data-testid={`admin-business-edit-${b.id}`}
                    className="text-violet-400 hover:text-violet-300 text-sm"
                  >
                    Edit
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBusinesses.length === 0 && (
          <div className="text-center py-12 border border-white/10 bg-white/5 rounded-lg mt-4">
            <p className="text-gray-400 mb-2">No businesses found</p>
            <button
              onClick={() => {
                setSelectedCity('all')
                setSelectedDistrict('all')
                setSelectedStatus('all')
                setSearchQuery('')
              }}
              className="text-violet-400 hover:text-violet-300 text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
