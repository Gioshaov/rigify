'use client'

import { useState } from 'react'
import { createService, updateService, deleteService } from './actions'
import { CATEGORIES } from '@/lib/constants/categories'
import { useTranslations } from '@/lib/hooks/useTranslations'

type Service = {
  id: string
  name: string
  description: string | null
  category: string | null
  price: number
  duration_minutes: number
  is_active: boolean
}

export function ServicesList({ businessId, services }: { businessId: string; services: Service[] }) {
  const { tr, lang } = useTranslations()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [customCategory, setCustomCategory] = useState<string>('')

  function validateDuration(value: string): string | null {
    const num = parseInt(value)
    if (isNaN(num)) return tr.dashboard.services.validationDurationNumber[lang]
    if (num < 15) return tr.dashboard.services.validationDurationMin[lang]
    if (num % 15 !== 0) return tr.dashboard.services.validationDurationIncrement[lang]
    return null
  }

  function validatePrice(value: string): string | null {
    const num = parseFloat(value)
    if (isNaN(num)) return tr.dashboard.services.validationPriceNumber[lang]
    if (num < 0) return tr.dashboard.services.validationPriceNegative[lang]
    return null
  }

  function validateCategory(category: string, customValue?: string): string | null {
    if (!category) return tr.dashboard.services.validationCategoryRequired[lang]
    if (category === 'other' && (!customValue || customValue.trim() === '')) {
      return tr.dashboard.services.validationCategoryCustom[lang]
    }
    return null
  }

  function handleFieldBlur(fieldName: string, value: string) {
    let error: string | null = null

    if (fieldName === 'duration_minutes') {
      error = validateDuration(value)
    } else if (fieldName === 'price') {
      error = validatePrice(value)
    } else if (fieldName === 'category') {
      error = validateCategory(value, customCategory)
    } else if (fieldName === 'custom_category') {
      error = validateCategory(selectedCategory, value)
    }

    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error || ''
    }))
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Validate all fields
    const formData = new FormData(e.currentTarget)
    const duration = formData.get('duration_minutes') as string
    const price = formData.get('price') as string
    const category = formData.get('category') as string
    const custom = formData.get('custom_category') as string

    const errors: Record<string, string> = {}
    const durationError = validateDuration(duration)
    const priceError = validatePrice(price)
    const categoryError = validateCategory(category, custom)

    if (durationError) errors.duration_minutes = durationError
    if (priceError) errors.price = priceError
    if (categoryError) errors.category = categoryError

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    setResult(null)
    setFieldErrors({})

    const response = await createService(businessId, formData)

    setLoading(false)
    setResult(response)

    if (response.success) {
      e.currentTarget.reset()
      setSelectedCategory('')
      setCustomCategory('')
      setTimeout(() => {
        setShowAddForm(false)
        setResult(null)
        window.location.reload()
      }, 1500)
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>, serviceId: string) {
    e.preventDefault()

    // Validate all fields
    const formData = new FormData(e.currentTarget)
    const duration = formData.get('duration_minutes') as string
    const price = formData.get('price') as string
    const category = formData.get('category') as string
    const custom = formData.get('custom_category') as string

    const errors: Record<string, string> = {}
    const durationError = validateDuration(duration)
    const priceError = validatePrice(price)
    const categoryError = validateCategory(category, custom)

    if (durationError) errors.duration_minutes = durationError
    if (priceError) errors.price = priceError
    if (categoryError) errors.category = categoryError

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    setResult(null)
    setFieldErrors({})

    const response = await updateService(serviceId, formData)

    setLoading(false)
    setResult(response)

    if (response.success) {
      setSelectedCategory('')
      setCustomCategory('')
      setTimeout(() => {
        setEditingId(null)
        setResult(null)
        window.location.reload()
      }, 1000)
    }
  }

  async function handleDelete(serviceId: string) {
    if (!confirm(tr.dashboard.services.confirmDelete[lang])) return

    setLoading(true)
    const response = await deleteService(serviceId)
    setLoading(false)

    if (response.success) {
      window.location.reload()
    } else {
      setResult(response)
    }
  }

  return (
    <div className="space-y-gutter">
      {/* Add Button */}
      <div>
        {/* NOTE: This button toggles between two states (open/close add form) with the same test ID */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
          data-testid="services-list-toggle-add-form-btn"
        >
          {showAddForm ? tr.common.cancel[lang] : tr.dashboard.services.addService[lang]}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="border border-outline-variant bg-surface p-gutter">
          <h2 className="text-headline-sm mb-stack-md">{tr.dashboard.services.addNewService[lang]}</h2>

          {result && !result.success && (
            <div className="mb-stack-md p-gutter border border-error bg-surface-container">
              <p className="label-mono text-error">✗ {result.message}</p>
            </div>
          )}

          {result && result.success && (
            <div className="mb-stack-md p-gutter border border-primary bg-surface-container">
              <p className="label-mono text-primary">✓ {result.message}</p>
            </div>
          )}

          <form onSubmit={handleAdd} noValidate className="space-y-stack-md">
            <div>
              <label className="label-mono block mb-stack-sm">{tr.dashboard.services.name[lang]}</label>
              <input
                type="text"
                name="name"
                required
                disabled={loading}
                className="input-field"
                placeholder={tr.dashboard.services.namePlaceholder[lang]}
                data-testid="services-add-name-input"
              />
            </div>

            <div>
              <label className="label-mono block mb-stack-sm">{tr.dashboard.services.category[lang]}</label>
              <select
                name="category"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  if (e.target.value !== 'other') {
                    setCustomCategory('')
                    setFieldErrors(prev => ({ ...prev, category: '' }))
                  }
                }}
                onBlur={(e) => handleFieldBlur('category', e.target.value)}
                disabled={loading}
                className={`input-field ${fieldErrors.category ? 'border-error' : ''}`}
                data-testid="services-add-category-select"
              >
                <option value="">{tr.dashboard.services.selectCategory[lang]}</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.en}
                  </option>
                ))}
                <option value="other">{tr.dashboard.services.otherCustom[lang]}</option>
              </select>
              {fieldErrors.category && (
                <p className="mt-stack-xs text-sm text-error">✗ {fieldErrors.category}</p>
              )}
            </div>

            {selectedCategory === 'other' && (
              <div>
                <label className="label-mono block mb-stack-sm">{tr.dashboard.services.customCategory[lang]}</label>
                <input
                  type="text"
                  name="custom_category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  onBlur={(e) => handleFieldBlur('custom_category', e.target.value)}
                  disabled={loading}
                  className="input-field"
                  placeholder={tr.dashboard.services.customCategoryPlaceholder[lang]}
                  data-testid="services-add-custom-category-input"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
              <div>
                <label className="label-mono block mb-stack-sm">{tr.dashboard.services.price[lang]}</label>
                <input
                  type="number"
                  name="price"
                  required
                  step="0.01"
                  disabled={loading}
                  className={`input-field ${fieldErrors.price ? 'border-error' : ''}`}
                  placeholder="50"
                  onBlur={(e) => handleFieldBlur('price', e.target.value)}
                  data-testid="services-add-price-input"
                />
                {fieldErrors.price && (
                  <p className="mt-stack-xs text-sm text-error">✗ {fieldErrors.price}</p>
                )}
              </div>

              <div>
                <label className="label-mono block mb-stack-sm">{tr.dashboard.services.duration[lang]}</label>
                <input
                  type="number"
                  name="duration_minutes"
                  required
                  disabled={loading}
                  className={`input-field ${fieldErrors.duration_minutes ? 'border-error' : ''}`}
                  placeholder="60"
                  onBlur={(e) => handleFieldBlur('duration_minutes', e.target.value)}
                  data-testid="services-add-duration-input"
                />
                {fieldErrors.duration_minutes ? (
                  <p className="mt-stack-xs text-sm text-error">✗ {fieldErrors.duration_minutes}</p>
                ) : (
                  <p className="mt-stack-xs text-body-sm text-on-surface-variant">
                    {tr.dashboard.services.durationHint[lang]}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="label-mono block mb-stack-sm">{tr.dashboard.services.description[lang]}</label>
              <textarea
                name="description"
                rows={3}
                disabled={loading}
                className="input-field resize-none"
                placeholder={tr.dashboard.services.descriptionPlaceholder[lang]}
                data-testid="services-add-description-textarea"
              />
            </div>

            <div className="flex gap-stack-md">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                data-testid="services-add-submit-btn"
              >
                {loading ? tr.dashboard.services.adding[lang] : tr.dashboard.services.addService[lang]}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setResult(null)
                }}
                disabled={loading}
                className="btn-secondary"
                data-testid="services-add-cancel-btn"
              >
                {tr.common.cancel[lang]}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      {services.length === 0 ? (
        <div className="border border-outline-variant bg-surface p-gutter text-center">
          <p className="label-mono text-on-surface-variant mb-stack-md">
            {tr.dashboard.services.noServicesYet[lang]}
          </p>
          <p className="text-body-lg text-on-surface-variant">
            {tr.dashboard.services.addFirstService[lang]}
          </p>
        </div>
      ) : (
        <div className="space-y-stack-md">
          {services.map((service) => (
            <div
              key={service.id}
              className="border border-outline-variant bg-surface"
            >
              {editingId === service.id ? (
                // Edit Form
                <form onSubmit={(e) => handleUpdate(e, service.id)} noValidate className="p-gutter">
                  <h3 className="text-headline-sm mb-stack-md">{tr.dashboard.services.editService[lang]}</h3>

                  {result && !result.success && (
                    <div className="mb-stack-md p-gutter border border-error bg-surface-container">
                      <p className="label-mono text-error">✗ {result.message}</p>
                    </div>
                  )}

                  {result && result.success && (
                    <div className="mb-stack-md p-gutter border border-primary bg-surface-container">
                      <p className="label-mono text-primary">✓ {result.message}</p>
                    </div>
                  )}

                  <div className="space-y-stack-md">
                    <div>
                      <label className="label-mono block mb-stack-sm">{tr.dashboard.services.name[lang]}</label>
                      <input
                        type="text"
                        name="name"
                        defaultValue={service.name}
                        required
                        disabled={loading}
                        className="input-field"
                        data-testid={`services-edit-name-input-${service.id}`}
                      />
                    </div>

                    <div>
                      <label className="label-mono block mb-stack-sm">{tr.dashboard.services.category[lang]}</label>
                      <select
                        name="category"
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value)
                          if (e.target.value !== 'other') {
                            setCustomCategory('')
                            setFieldErrors(prev => ({ ...prev, category: '' }))
                          }
                        }}
                        onBlur={(e) => handleFieldBlur('category', e.target.value)}
                        disabled={loading}
                        className={`input-field ${fieldErrors.category ? 'border-error' : ''}`}
                        data-testid={`services-edit-category-select-${service.id}`}
                      >
                        <option value="">{tr.dashboard.services.selectCategory[lang]}</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.en}
                          </option>
                        ))}
                        <option value="other">{tr.dashboard.services.otherCustom[lang]}</option>
                      </select>
                      {fieldErrors.category && (
                        <p className="mt-stack-xs text-sm text-error">✗ {fieldErrors.category}</p>
                      )}
                    </div>

                    {selectedCategory === 'other' && (
                      <div>
                        <label className="label-mono block mb-stack-sm">{tr.dashboard.services.customCategory[lang]}</label>
                        <input
                          type="text"
                          name="custom_category"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          onBlur={(e) => handleFieldBlur('custom_category', e.target.value)}
                          disabled={loading}
                          className="input-field"
                          placeholder={tr.dashboard.services.customCategoryPlaceholder[lang]}
                          data-testid={`services-edit-custom-category-input-${service.id}`}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                      <div>
                        <label className="label-mono block mb-stack-sm">{tr.dashboard.services.price[lang]}</label>
                        <input
                          type="number"
                          name="price"
                          defaultValue={service.price}
                          required
                          step="0.01"
                          disabled={loading}
                          className={`input-field ${fieldErrors.price ? 'border-error' : ''}`}
                          onBlur={(e) => handleFieldBlur('price', e.target.value)}
                          data-testid={`services-edit-price-input-${service.id}`}
                        />
                        {fieldErrors.price && (
                          <p className="mt-stack-xs text-sm text-error">✗ {fieldErrors.price}</p>
                        )}
                      </div>

                      <div>
                        <label className="label-mono block mb-stack-sm">{tr.dashboard.services.duration[lang]}</label>
                        <input
                          type="number"
                          name="duration_minutes"
                          defaultValue={service.duration_minutes}
                          required
                          disabled={loading}
                          className={`input-field ${fieldErrors.duration_minutes ? 'border-error' : ''}`}
                          onBlur={(e) => handleFieldBlur('duration_minutes', e.target.value)}
                          data-testid={`services-edit-duration-input-${service.id}`}
                        />
                        {fieldErrors.duration_minutes && (
                          <p className="mt-stack-xs text-sm text-error">✗ {fieldErrors.duration_minutes}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="label-mono block mb-stack-sm">{tr.dashboard.services.description[lang]}</label>
                      <textarea
                        name="description"
                        defaultValue={service.description || ''}
                        rows={3}
                        disabled={loading}
                        className="input-field resize-none"
                        data-testid={`services-edit-description-textarea-${service.id}`}
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-stack-sm cursor-pointer">
                        <input
                          type="checkbox"
                          name="is_active"
                          defaultChecked={service.is_active}
                          disabled={loading}
                          className="w-4 h-4"
                          data-testid={`services-edit-active-checkbox-${service.id}`}
                        />
                        <span className="label-mono">{tr.dashboard.services.activeBooking[lang]}</span>
                      </label>
                    </div>

                    <div className="flex gap-stack-md">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        data-testid={`services-edit-submit-btn-${service.id}`}
                      >
                        {loading ? tr.dashboard.staff.saving[lang] : tr.common.save[lang]}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null)
                          setResult(null)
                        }}
                        disabled={loading}
                        className="btn-secondary"
                        data-testid={`services-edit-cancel-btn-${service.id}`}
                      >
                        {tr.common.cancel[lang]}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                // View Mode
                <div className="p-gutter">
                  <div className="flex items-start justify-between mb-stack-md">
                    <div className="flex-1">
                      <div className="flex items-center gap-stack-sm mb-stack-xs">
                        <h3 className="text-headline-sm">{service.name}</h3>
                        <span className={`label-mono text-xs px-2 py-1 rounded ${
                          service.is_active
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}>
                          {service.is_active ? tr.dashboard.staff.active[lang] : tr.dashboard.staff.inactive[lang]}
                        </span>
                      </div>
                      {service.description && (
                        <p className="text-body-md text-on-surface-variant">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-gutter">
                      <p className="text-headline-sm">₾{service.price}</p>
                      <p className="label-mono text-on-surface-variant">
                        {service.duration_minutes} {tr.dashboard.services.min[lang]}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-stack-sm">
                    <button
                      onClick={() => {
                        setEditingId(service.id)
                        // Check if category is predefined or custom
                        const isPredefined = CATEGORIES.some(cat => cat.id === service.category)
                        if (isPredefined || !service.category) {
                          setSelectedCategory(service.category || '')
                          setCustomCategory('')
                        } else {
                          // Custom category
                          setSelectedCategory('other')
                          setCustomCategory(service.category)
                        }
                      }}
                      className="label-mono text-primary hover:underline text-sm py-2 px-3 -mx-3"
                      data-testid={`services-list-edit-btn-${service.id}`}
                    >
                      {tr.common.edit[lang]}
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      disabled={loading}
                      className="label-mono text-error hover:underline text-sm py-2 px-3 -mx-3"
                      data-testid={`services-list-delete-btn-${service.id}`}
                    >
                      {tr.dashboard.services.delete[lang]}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
