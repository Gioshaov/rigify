'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from '@/lib/hooks/useTranslations'

type CalendarDay = {
  date: string          // ISO: "2024-03-15"
  dayNumber: number     // 1-31
  isToday: boolean
  isPast: boolean
  isCurrentMonth: boolean
}

type CalendarTimePickerProps = {
  businessId: string
  serviceId: string
  staffId?: string | null
  selectedDate: string      // ISO format: "2024-03-15"
  selectedTime: string      // Format: "14:30"
  onDateSelect: (date: string) => void
  onTimeSelect: (time: string) => void
  availableSlots: string[]  // ["09:00", "09:30", ...]
  loadingSlots: boolean
}

export function CalendarTimePicker({
  businessId,
  serviceId,
  staffId,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  availableSlots,
  loadingSlots
}: CalendarTimePickerProps) {
  const { tr, lang } = useTranslations()

  // State for current month being displayed
  const [currentMonth, setCurrentMonth] = useState(() => new Date())

  // Get month and weekday names from translations
  const monthNames = useMemo(() => [
    tr.booking.months.january[lang],
    tr.booking.months.february[lang],
    tr.booking.months.march[lang],
    tr.booking.months.april[lang],
    tr.booking.months.may[lang],
    tr.booking.months.june[lang],
    tr.booking.months.july[lang],
    tr.booking.months.august[lang],
    tr.booking.months.september[lang],
    tr.booking.months.october[lang],
    tr.booking.months.november[lang],
    tr.booking.months.december[lang],
  ], [lang, tr])

  // Weekday headers (Monday first)
  const weekdayHeaders = useMemo(() => [
    tr.booking.weekdays.monday[lang].substring(0, 3),
    tr.booking.weekdays.tuesday[lang].substring(0, 3),
    tr.booking.weekdays.wednesday[lang].substring(0, 3),
    tr.booking.weekdays.thursday[lang].substring(0, 3),
    tr.booking.weekdays.friday[lang].substring(0, 3),
    tr.booking.weekdays.saturday[lang].substring(0, 3),
    tr.booking.weekdays.sunday[lang].substring(0, 3),
  ], [lang, tr])

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    // Get day of week for first day (0=Sunday, 1=Monday, ... 6=Saturday)
    // Convert to Monday=0, Tuesday=1, ... Sunday=6
    let firstDayOfWeek = firstDay.getDay() - 1
    if (firstDayOfWeek < 0) firstDayOfWeek = 6 // Sunday becomes 6

    // Today for comparison
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString().split('T')[0]

    // Generate array of 42 cells (6 rows × 7 cols)
    const days: (CalendarDay | null)[] = []

    // Fill empty cells before first day of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }

    // Fill actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      date.setHours(0, 0, 0, 0)
      const dateISO = date.toISOString().split('T')[0]

      days.push({
        date: dateISO,
        dayNumber: day,
        isToday: dateISO === todayISO,
        isPast: date < today,
        isCurrentMonth: true
      })
    }

    // Fill remaining cells to complete 42 cells
    while (days.length < 42) {
      days.push(null)
    }

    return days
  }, [currentMonth])

  // Navigate to previous month
  const goPrevMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
  }

  // Navigate to next month
  const goNextMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + 1)
    setCurrentMonth(newMonth)
  }

  // Check if we can go to previous month (don't allow past months)
  const canGoPrevMonth = useMemo(() => {
    const today = new Date()
    const prevMonth = new Date(currentMonth)
    prevMonth.setMonth(prevMonth.getMonth() - 1)

    // Allow if prevMonth is in the same month as today or later
    return prevMonth.getFullYear() > today.getFullYear() ||
           (prevMonth.getFullYear() === today.getFullYear() && prevMonth.getMonth() >= today.getMonth())
  }, [currentMonth])

  // Get class name for date button
  const getDateButtonClass = (day: CalendarDay | null) => {
    if (!day) return 'invisible'

    const base = 'aspect-square flex items-center justify-center text-body-md border border-outline-variant transition-colors'

    if (day.isPast) {
      return `${base} opacity-30 cursor-not-allowed bg-surface text-on-surface-variant`
    }

    if (day.date === selectedDate) {
      return `${base} bg-primary text-surface font-medium`
    }

    if (day.isToday) {
      return `${base} bg-surface-container ring-1 ring-primary text-on-surface hover:bg-surface-container-high cursor-pointer`
    }

    return `${base} bg-surface-container text-on-surface hover:bg-surface-container-high cursor-pointer`
  }

  // Get class name for time button
  const getTimeButtonClass = (time: string) => {
    const base = 'w-full text-left px-4 py-3 border border-outline-variant transition-colors font-mono text-sm'

    if (time === selectedTime) {
      return `${base} bg-primary text-surface font-medium`
    }

    return `${base} bg-surface-container text-on-surface hover:bg-surface-container-high cursor-pointer`
  }

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-gutter">
      {/* Calendar */}
      <div>
        {/* Month header with navigation */}
        <div className="flex items-center justify-between mb-stack-md">
          <button
            type="button"
            onClick={goPrevMonth}
            disabled={!canGoPrevMonth}
            className="px-4 py-2 text-on-surface hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous month"
          >
            ←
          </button>
          <h3 className="text-headline-sm">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            type="button"
            onClick={goNextMonth}
            className="px-4 py-2 text-on-surface hover:text-primary transition-colors"
            aria-label="Next month"
          >
            →
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdayHeaders.map((day, idx) => (
            <div key={idx} className="label-mono text-center text-on-surface-variant py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => day && !day.isPast && onDateSelect(day.date)}
              disabled={!day || day.isPast}
              className={getDateButtonClass(day)}
            >
              {day?.dayNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Time slots */}
      <div>
        <h3 className="label-mono mb-stack-md">
          {tr.booking.time ? tr.booking.time[lang].toUpperCase() : 'TIME'} *
        </h3>

        {!selectedDate ? (
          <div className="border border-outline-variant bg-surface p-gutter">
            <p className="text-body-sm text-on-surface-variant">
              {tr.booking.selectTimeAbove ? tr.booking.selectTimeAbove[lang] : 'Please select a date first'}
            </p>
          </div>
        ) : loadingSlots ? (
          <div className="space-y-2">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-surface-container animate-pulse border border-outline-variant" />
            ))}
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="border border-outline-variant bg-surface p-gutter">
            <p className="text-body-md text-on-surface-variant mb-stack-sm">
              {tr.booking.noSlotsAvailable[lang]}
            </p>
            <p className="text-body-sm text-on-surface-variant">
              {tr.booking.tryAnotherDay[lang]}
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {availableSlots.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => onTimeSelect(time)}
                className={getTimeButtonClass(time)}
              >
                {time}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
