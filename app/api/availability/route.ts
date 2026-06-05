import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { combineLocalDateTime } from '@/lib/utils/datetime'

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

  const admin = createAdminClient()

  // Get service to know duration
  const { data: service, error: serviceError } = await admin
    .from('services')
    .select('duration_minutes')
    .eq('id', serviceId)
    .single()

  if (serviceError || !service) {
    return NextResponse.json(
      { error: 'Service not found' },
      { status: 404 }
    )
  }

  const durationMinutes = service.duration_minutes

  // Get existing bookings for this date
  const dayStart = combineLocalDateTime(date, '00:00').toISOString()
  const dayEnd = combineLocalDateTime(date, '23:59').toISOString()

  let query = admin
    .from('bookings')
    .select('appointment_datetime, end_datetime')
    .eq('business_id', businessId)
    .eq('status', 'confirmed')
    .gte('appointment_datetime', dayStart)
    .lte('appointment_datetime', dayEnd)

  // If specific staff requested, filter by staff
  if (staffId) {
    query = query.eq('staff_id', staffId)
  }

  const { data: bookings, error: bookingsError } = await query

  if (bookingsError) {
    console.error('Bookings fetch error:', bookingsError)
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

    // Check if this slot overlaps with any existing booking
    const hasOverlap = bookings?.some((booking) => {
      const bookingStart = new Date(booking.appointment_datetime)
      const bookingEnd = new Date(booking.end_datetime)

      // Overlap detection: two events overlap if one starts before the other ends
      return bookingStart < slotEnd && bookingEnd > slotStart
    })

    // Also check if the service would end after business hours
    const slotEndHour = slotEnd.getHours()
    const slotEndMinute = slotEnd.getMinutes()
    const endsAfterHours = slotEndHour > endHour || (slotEndHour === endHour && slotEndMinute > 0)

    return !hasOverlap && !endsAfterHours
  })

  return NextResponse.json({ slots: availableSlots })
}
