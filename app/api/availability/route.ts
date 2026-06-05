import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { combineLocalDateTime, TBILISI_TZ } from '@/lib/utils/datetime'
import { formatInTimeZone } from 'date-fns-tz'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const businessId = searchParams.get('businessId')
  const serviceId = searchParams.get('serviceId')
  const date = searchParams.get('date')
  const staffId = searchParams.get('staffId')

  if (!businessId || !serviceId || !date) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  // UUID validation
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (!UUID_REGEX.test(businessId) || !UUID_REGEX.test(serviceId)) {
    return NextResponse.json(
      { error: 'Invalid ID format' },
      { status: 400 }
    )
  }

  if (staffId && !UUID_REGEX.test(staffId)) {
    return NextResponse.json(
      { error: 'Invalid staff ID format' },
      { status: 400 }
    )
  }

  // Date format validation (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: 'Invalid date format. Expected YYYY-MM-DD' },
      { status: 400 }
    )
  }

  // Semantic validation: check if date is valid calendar date (use UTC to avoid server timezone issues)
  const testDate = new Date(date + 'T00:00:00Z')
  if (isNaN(testDate.getTime())) {
    return NextResponse.json(
      { error: 'Invalid date value' },
      { status: 400 }
    )
  }

  // Check for date rollover (e.g., 2025-02-30 -> March 2)
  const [inputYear, inputMonth, inputDay] = date.split('-').map(Number)
  if (testDate.getUTCFullYear() !== inputYear ||
      testDate.getUTCMonth() + 1 !== inputMonth ||
      testDate.getUTCDate() !== inputDay) {
    return NextResponse.json(
      { error: 'Invalid date value' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  // Get service to know duration (must belong to the claimed business)
  const { data: service, error: serviceError } = await admin
    .from('services')
    .select('duration_minutes')
    .eq('id', serviceId)
    .eq('business_id', businessId)
    .eq('is_active', true)
    .single()

  if (serviceError || !service) {
    return NextResponse.json(
      { error: 'Service not found' },
      { status: 404 }
    )
  }

  const durationMinutes = service.duration_minutes

  // Get existing bookings for this date
  const dayStart = combineLocalDateTime(date, '00:00')
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

  // Fetch all confirmed bookings that overlap with this day
  const { data: bookings, error: bookingsError } = await admin
    .from('bookings')
    .select('staff_id, appointment_datetime, end_datetime')
    .eq('business_id', businessId)
    .eq('status', 'confirmed')
    .lt('appointment_datetime', dayEnd.toISOString())
    .gte('end_datetime', dayStart.toISOString())

  if (bookingsError) {
    console.error('Bookings fetch error:', bookingsError)
    return NextResponse.json(
      { error: 'Failed to check availability. Please try again.' },
      { status: 500 }
    )
  }

  // If "Any Staff" mode, get all active staff for this business
  let allStaff: { id: string }[] | null = null
  if (!staffId) {
    const { data: staffData, error: staffError } = await admin
      .from('staff')
      .select('id')
      .eq('business_id', businessId)
      .eq('is_active', true)

    if (staffError) {
      console.error('Staff fetch error:', staffError)
      return NextResponse.json(
        { error: 'Failed to check availability. Please try again.' },
        { status: 500 }
      )
    }

    allStaff = staffData
  }

  // Generate time slots (9am to 9pm, 15-min intervals)
  const slots: string[] = []
  const startHour = 9
  const endHour = 21 // 9pm

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(timeString)
    }
  }

  // Filter out slots that would overlap with existing bookings
  const availableSlots = slots.filter((slot) => {
    const slotStart = combineLocalDateTime(date, slot)
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000)

    // Check if the service would end after business hours (use Tbilisi timezone)
    const slotEndHour = parseInt(formatInTimeZone(slotEnd, TBILISI_TZ, 'HH'))
    const slotEndMinute = parseInt(formatInTimeZone(slotEnd, TBILISI_TZ, 'mm'))
    const endsAfterHours = slotEndHour > endHour || (slotEndHour === endHour && slotEndMinute > 0)

    if (endsAfterHours) return false

    // Specific staff: check only their bookings
    if (staffId) {
      const staffBookings = bookings?.filter(b => b.staff_id === staffId) || []
      const hasOverlap = staffBookings.some((booking) => {
        const bookingStart = new Date(booking.appointment_datetime)
        const bookingEnd = new Date(booking.end_datetime)
        return bookingStart < slotEnd && bookingEnd > slotStart
      })
      return !hasOverlap
    }

    // "Any Staff": check if at least one staff member is available
    if (!allStaff || allStaff.length === 0) return false

    const hasAvailableStaff = allStaff.some(staff => {
      const staffBookings = bookings?.filter(b => b.staff_id === staff.id) || []
      const hasConflict = staffBookings.some((booking) => {
        const bookingStart = new Date(booking.appointment_datetime)
        const bookingEnd = new Date(booking.end_datetime)
        return bookingStart < slotEnd && bookingEnd > slotStart
      })
      return !hasConflict
    })

    return hasAvailableStaff
  })

  return NextResponse.json({ slots: availableSlots })
}
