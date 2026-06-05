'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { calculateEndTime } from '@/lib/utils/datetime'
import { validateGeorgianPhone, validateName, validateEmail } from '@/lib/utils/validation'
import { useTranslations } from '@/lib/hooks/useTranslations'
import { CalendarTimePicker } from './CalendarTimePicker'

type Service = {
  id: string
  name: string
  price: number
  duration_minutes: number
  description: string | null
}

type Staff = {
  id: string
  name: string
  specialty: string | null
}

type CustomerInfo = {
  name: string
  phone: string
  email: string
} | null

type BookingFormProps = {
  businessId: string
  businessSlug: string
  services: Service[]
  staff: Staff[]
  customerInfo: CustomerInfo
  isLoggedIn: boolean
}

export function BookingForm({
  businessId,
  businessSlug,
  services,
  staff,
  customerInfo,
  isLoggedIn
}: BookingFormProps) {
  const router = useRouter()
  const { tr, lang } = useTranslations()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Customer details
  const [customerName, setCustomerName] = useState(customerInfo?.name || '')
  const [customerPhone, setCustomerPhone] = useState(customerInfo?.phone || '')
  const [customerEmail, setCustomerEmail] = useState(customerInfo?.email || '')

  // Format date with translated weekday and month
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00');
    const weekdayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const monthIndex = date.getMonth(); // 0 = January, etc.
    const day = date.getDate();
    const year = date.getFullYear();

    const weekdayNames = [
      tr.booking.weekdays.sunday,
      tr.booking.weekdays.monday,
      tr.booking.weekdays.tuesday,
      tr.booking.weekdays.wednesday,
      tr.booking.weekdays.thursday,
      tr.booking.weekdays.friday,
      tr.booking.weekdays.saturday,
    ];

    const monthNames = [
      tr.booking.months.january,
      tr.booking.months.february,
      tr.booking.months.march,
      tr.booking.months.april,
      tr.booking.months.may,
      tr.booking.months.june,
      tr.booking.months.july,
      tr.booking.months.august,
      tr.booking.months.september,
      tr.booking.months.october,
      tr.booking.months.november,
      tr.booking.months.december,
    ];

    const weekday = weekdayNames[weekdayIndex][lang];
    const month = monthNames[monthIndex][lang];

    return `${weekday}, ${month} ${day}, ${year}`;
  }

  // Load available time slots when date/staff/service changes
  async function loadAvailableSlots(date: string, serviceId: string, staffId: string | null) {
    if (!date || !serviceId) return

    setLoadingSlots(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        businessId,
        serviceId,
        date,
        ...(staffId && { staffId })
      })

      const response = await fetch(`/api/availability?${params}`)
      const data = await response.json()

      if (data.error) {
        setError(`Unable to load available times: ${data.error}. Please try another date or contact the business.`)
        setAvailableSlots([])
      } else {
        setAvailableSlots(data.slots || [])
      }
    } catch (err) {
      setError('Failed to load available time slots. Please check your connection and try again.')
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  // Handle date selection
  function handleDateChange(date: string) {
    setSelectedDate(date)
    setSelectedTime('')

    if (selectedService) {
      loadAvailableSlots(date, selectedService.id, selectedStaff?.id || null)
    }
  }

  // Handle booking submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedService || !selectedDate || !selectedTime) {
      setError('Please complete all booking details')
      return
    }

    if (!customerName || !customerPhone) {
      setError('Please provide your name and phone number')
      return
    }

    // Validate customer details
    if (!validateName(customerName)) {
      setError('Please enter a valid name (minimum 2 characters, no numbers)')
      return
    }

    if (!validateGeorgianPhone(customerPhone)) {
      setError('Please enter a valid Georgian phone number (+995 5XX XXX XXX)')
      return
    }

    if (customerEmail && !validateEmail(customerEmail)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          serviceId: selectedService.id,
          staffId: selectedStaff?.id || null,
          date: selectedDate,
          startTime: selectedTime,
          customerName,
          customerPhone,
          customerEmail: customerEmail || null,
        })
      })

      const data = await response.json()

      if (data.error) {
        if (data.error.includes('no longer available')) {
          setError('This time slot was just booked. Please select another time.')
          // Re-load slots to show updated availability
          loadAvailableSlots(selectedDate, selectedService.id, selectedStaff?.id || null)
          setSelectedTime('') // Clear selection to force re-selection
        } else {
          setError(`Booking failed: ${data.error}`)
        }
      } else {
        // Success! Redirect to confirmation
        router.push(`/businesses/${businessSlug}/booking-confirmed?id=${data.bookingId}`)
      }
    } catch (err) {
      setError('Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-gutter">
      {error && (
        <div className="border border-error bg-surface p-gutter">
          <p className="label-mono text-error">✗ {error}</p>
        </div>
      )}

      {/* Step 1: Select Service */}
      <div className="border border-outline-variant bg-surface">
        <div className="px-gutter py-stack-lg border-b border-outline-variant flex items-center justify-between">
          <h2 className="text-headline-lg">1. {tr.booking.selectService[lang]}</h2>
          {selectedService && (
            <span className="label-mono text-primary">{tr.booking.selected[lang]}</span>
          )}
        </div>

        <div>
          {services.map((service, index) => (
            <div
              key={service.id}
              className={`px-gutter py-stack-md flex items-start justify-between cursor-pointer transition-colors ${
                selectedService?.id === service.id
                  ? 'bg-surface-container-low border-l-4 border-l-primary'
                  : 'hover:bg-surface-container-low'
              } ${index < services.length - 1 ? 'border-b border-outline-variant' : ''}`}
              onClick={() => {
                setSelectedService(service)
                setStep(2)
                // Reset time slot when service changes
                setSelectedTime('')
                if (selectedDate) {
                  loadAvailableSlots(selectedDate, service.id, selectedStaff?.id || null)
                }
              }}
            >
              <div className="flex-1">
                <h3 className="text-headline-sm mb-stack-xs">{service.name}</h3>
                {service.description && (
                  <p className="text-body-md text-on-surface-variant">
                    {service.description}
                  </p>
                )}
              </div>
              <div className="text-right ml-gutter">
                <p className="text-headline-sm">₾{service.price}</p>
                <p className="label-mono text-on-surface-variant">
                  {service.duration_minutes} {tr.booking.minutes[lang].toUpperCase()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Select Staff (Optional) */}
      {step >= 2 && staff.length > 0 && (
        <div className="border border-outline-variant bg-surface">
          <div className="px-gutter py-stack-lg border-b border-outline-variant">
            <div className="flex items-center justify-between mb-stack-sm">
              <h2 className="text-headline-lg">2. {tr.booking.selectStaff[lang]}</h2>
              {selectedStaff && (
                <span className="label-mono text-primary">{tr.booking.selected[lang]}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setStep(1)
                setSelectedService(null)
                setSelectedStaff(null)
                setSelectedDate('')
                setSelectedTime('')
              }}
              className="text-sm text-primary hover:underline"
            >
              {tr.booking.changeService[lang]}
            </button>
          </div>

          <div className="px-gutter py-stack-lg grid grid-cols-1 md:grid-cols-2 gap-stack-md">
            <div
              className={`border border-outline-variant p-stack-md cursor-pointer transition-colors ${
                step >= 3 && !selectedStaff
                  ? 'bg-surface-container-low border-primary'
                  : 'hover:bg-surface-container'
              }`}
              onClick={() => {
                setSelectedStaff(null)
                setStep(3)
                setSelectedTime('')
                if (selectedDate && selectedService) {
                  loadAvailableSlots(selectedDate, selectedService.id, null)
                }
              }}
            >
              <p className="text-headline-sm">{tr.booking.anyAvailable[lang]}</p>
              <p className="label-mono text-on-surface-variant mt-stack-xs">
                {tr.booking.firstAvailableStaff[lang]}
              </p>
            </div>

            {staff.map((member) => (
              <div
                key={member.id}
                className={`border border-outline-variant p-stack-md cursor-pointer transition-colors ${
                  step >= 3 && selectedStaff?.id === member.id
                    ? 'bg-surface-container-low border-primary'
                    : 'hover:bg-surface-container'
                }`}
                onClick={() => {
                  setSelectedStaff(member)
                  setStep(3)
                  setSelectedTime('')
                  if (selectedDate && selectedService) {
                    loadAvailableSlots(selectedDate, selectedService.id, member.id)
                  }
                }}
              >
                <p className="text-headline-sm">{member.name}</p>
                {member.specialty && (
                  <p className="label-mono text-on-surface-variant mt-stack-xs">
                    {member.specialty.toUpperCase()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Select Date & Time */}
      {step >= 3 && (
        <div className="border border-outline-variant bg-surface">
          <div className="px-gutter py-stack-lg border-b border-outline-variant">
            <h2 className="text-headline-lg mb-stack-sm">
              {staff.length > 0 ? '3' : '2'}. {tr.booking.selectDateTime[lang]}
            </h2>
            <button
              type="button"
              onClick={() => {
                if (staff.length > 0) {
                  setStep(2)
                  setSelectedDate('')
                  setSelectedTime('')
                } else {
                  setStep(1)
                  setSelectedService(null)
                  setSelectedDate('')
                  setSelectedTime('')
                }
              }}
              className="text-sm text-primary hover:underline"
            >
              {staff.length > 0 ? tr.booking.changeStaff[lang] : tr.booking.changeService[lang]}
            </button>
          </div>

          <div className="px-gutter py-stack-lg">
            {selectedService && (
              <CalendarTimePicker
                businessId={businessId}
                serviceId={selectedService.id}
                staffId={selectedStaff?.id}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onDateSelect={handleDateChange}
                onTimeSelect={(time) => {
                  setSelectedTime(time)
                  setStep(4)
                }}
                availableSlots={availableSlots}
                loadingSlots={loadingSlots}
              />
            )}
          </div>
        </div>
      )}

      {/* Step 4: Customer Details */}
      {step >= 4 && (
        <div className="border border-outline-variant bg-surface">
          <div className="px-gutter py-stack-lg border-b border-outline-variant">
            <h2 className="text-headline-lg mb-stack-sm">
              {staff.length > 0 ? '4' : '3'}. {tr.booking.yourDetails[lang]}
            </h2>
            <button
              type="button"
              onClick={() => {
                setStep(3)
                setSelectedTime('')
              }}
              className="text-sm text-primary hover:underline"
            >
              {tr.booking.changeDateTime[lang]}
            </button>
          </div>

          <div className="px-gutter py-stack-lg space-y-stack-md">
            <div>
              <label className="label-mono block mb-stack-sm">{tr.booking.name[lang].toUpperCase()} *</label>
              <input
                type="text"
                autoComplete="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="input-field max-w-md"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="label-mono block mb-stack-sm">{tr.booking.phone[lang].toUpperCase()} *</label>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                className="input-field max-w-md"
                placeholder="+995 5XX XXX XXX"
              />
            </div>

            <div>
              <label className="label-mono block mb-stack-sm">{tr.booking.email[lang]}</label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="input-field max-w-md"
                placeholder="your@email.com"
              />
            </div>

            {!isLoggedIn && (
              <p className="text-body-sm text-on-surface-variant">
                {tr.booking.wantToTrack[lang]}{' '}
                <a href="/customer-register" className="text-primary hover:underline">
                  {tr.booking.createAccount[lang]}
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Submit */}
      {step >= 4 && (
        <div className="border border-outline-variant bg-surface p-gutter">
          {!selectedTime ? (
            <div className="text-center py-gutter">
              <p className="text-on-surface-variant text-body-md">
                {tr.booking.selectTimeAbove[lang]}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-stack-lg">
                <p className="label-mono mb-stack-md">{tr.booking.bookingSummary[lang]}</p>
                <div className="space-y-stack-sm text-body-md">
                  <p><strong>{tr.booking.service[lang]}:</strong> {selectedService?.name}</p>
                  {selectedStaff && <p><strong>{tr.booking.staff[lang]}:</strong> {selectedStaff.name}</p>}
                  <p><strong>{tr.booking.date[lang]}:</strong> {formatDate(selectedDate)}</p>
                  <p>
                    <strong>{tr.booking.time[lang]}:</strong> {selectedTime} - {(() => {
                      const endTime = calculateEndTime(selectedTime, selectedService?.duration_minutes || 0);
                      return endTime.crossesMidnight
                        ? `${endTime.time} (+1 day)`
                        : endTime.time;
                    })()}
                  </p>
                  <p><strong>{tr.booking.duration[lang]}:</strong> {selectedService?.duration_minutes} {tr.booking.minutes[lang]}</p>
                  <p><strong>{tr.booking.price[lang]}:</strong> ₾{selectedService?.price}</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? tr.booking.booking[lang] : tr.booking.confirmBooking[lang]}
              </button>
            </>
          )}
        </div>
      )}
    </form>
  )
}
