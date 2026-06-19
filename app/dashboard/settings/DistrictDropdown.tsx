'use client'

import { useState, useRef, useEffect } from 'react'
import { TBILISI_DISTRICTS } from '@/lib/constants/districts'

type DistrictDropdownProps = {
  defaultValue: string | null
  selectedCity: string
  onChange?: (district: string) => void
}

export function DistrictDropdown({ defaultValue, selectedCity, onChange }: DistrictDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<string>(defaultValue || '')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reset selection when city changes to non-Tbilisi
  useEffect(() => {
    if (selectedCity !== 'tbilisi' && selected) {
      setSelected('')
      onChange?.('')
    }
  }, [selectedCity, selected, onChange])

  function selectDistrict(districtName: string) {
    setSelected(districtName)
    onChange?.(districtName)
    setIsOpen(false)
  }

  const isDisabled = selectedCity !== 'tbilisi'
  const buttonText = selected || 'Select district...'

  // Find matching district for display
  const matchedDistrict = TBILISI_DISTRICTS.find(
    d => d.en.toLowerCase() === selected.toLowerCase() || d.ka === selected
  )

  return (
    <div ref={dropdownRef} className="relative">
      {/* Hidden input for form submission */}
      <input type="hidden" name="district" value={selected} />

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        disabled={isDisabled}
        className="input-field w-full text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="business-settings-district-dropdown-btn"
      >
        <span className={!selected ? 'text-on-surface-variant' : ''}>
          {matchedDistrict ? `${matchedDistrict.en} · ${matchedDistrict.ka}` : buttonText}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !isDisabled && (
        <div className="absolute z-10 mt-1 w-full bg-surface border border-outline-variant rounded shadow-xl max-h-64 overflow-y-auto">
          <div className="py-1">
            {/* Clear option */}
            <button
              type="button"
              onClick={() => selectDistrict('')}
              className="w-full text-left px-4 py-2.5 hover:bg-surface-container transition-colors text-on-surface-variant"
              data-testid="business-settings-district-option-none"
            >
              None
            </button>

            {TBILISI_DISTRICTS.map((district) => (
              <button
                key={district.id}
                type="button"
                onClick={() => selectDistrict(district.en)}
                className="w-full text-left px-4 py-2.5 hover:bg-surface-container cursor-pointer transition-colors"
                data-testid={`business-settings-district-option-${district.id}`}
              >
                <p className="text-body-md">{district.en}</p>
                <p className="text-body-sm text-on-surface-variant">{district.ka}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {isDisabled && (
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Only available for Tbilisi
        </p>
      )}
    </div>
  )
}
