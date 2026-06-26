'use client'

import { useState, useRef, useEffect } from 'react'
import { CATEGORIES } from '@/lib/constants/categories'

type CategoryDropdownProps = {
  defaultSelected: string[]
  onChange?: (categories: string[]) => void
}

export function CategoryDropdown({ defaultSelected, onChange }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>(defaultSelected)
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

  function toggleCategory(categoryId: string) {
    const newSelected = selected.includes(categoryId)
      ? selected.filter(id => id !== categoryId)
      : [...selected, categoryId]

    setSelected(newSelected)
    onChange?.(newSelected)
  }

  const selectedCount = selected.length
  const buttonText = selectedCount === 0
    ? 'Select categories...'
    : selectedCount === 1
    ? CATEGORIES.find(c => c.id === selected[0])?.en || '1 selected'
    : `${selectedCount} categories selected`

  return (
    <div ref={dropdownRef} className="relative">
      {/* Hidden inputs for form submission */}
      {selected.map(catId => (
        <input key={catId} type="hidden" name="categories" value={catId} />
      ))}

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-field w-full text-left flex items-center justify-between"
        data-testid="business-settings-category-dropdown-btn"
      >
        <span className={selectedCount === 0 ? 'text-on-surface-variant' : ''}>
          {buttonText}
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
      {isOpen && (
        <div className="absolute z-dropdown mt-1 w-full bg-surface border border-outline-variant rounded shadow-xl max-h-64 overflow-y-auto">
          <div className="py-1">
            {CATEGORIES.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="w-4 h-4 rounded"
                  data-testid={`business-settings-category-option-${cat.id}`}
                />
                <div>
                  <p className="text-body-md">{cat.en}</p>
                  <p className="text-body-sm text-on-surface-variant">{cat.ka}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
