import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { combineLocalDateTime } from '@/lib/utils/datetime'
import { validateGeorgianPhone, validateName, validateEmail } from '@/lib/utils/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      businessId,
      serviceId,
      staffId,
      date,
      startTime,
      customerName,
      customerPhone,
      customerEmail
    } = body

    // Validate required fields
    if (!businessId || !serviceId || !date || !startTime || !customerName || !customerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Length validation
    if (customerName.length > 100 || customerPhone.length > 30 || (customerEmail && customerEmail.length > 254)) {
      return NextResponse.json(
        { error: 'Input too long' },
        { status: 400 }
      )
    }

    // Format validation
    if (!validateName(customerName)) {
      return NextResponse.json(
        { error: 'Invalid name format' },
        { status: 400 }
      )
    }

    if (!validateGeorgianPhone(customerPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone format' },
        { status: 400 }
      )
    }

    if (customerEmail && !validateEmail(customerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // UUID validation regex
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    // Validate UUIDs
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

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Expected YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Validate time format (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(startTime)) {
      return NextResponse.json(
        { error: 'Invalid time format. Expected HH:MM' },
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

    // Check time values are within valid ranges
    const [hours, minutes] = startTime.split(':').map(Number)
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return NextResponse.json(
        { error: 'Invalid time value' },
        { status: 400 }
      )
    }

    // Prevent bookings in the past
    const appointmentCheck = combineLocalDateTime(date, startTime)
    if (appointmentCheck < new Date()) {
      return NextResponse.json(
        { error: 'Cannot book appointments in the past' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const admin = createAdminClient()

    // Get current user (if logged in)
    const { data: { user } } = await supabase.auth.getUser()

    // Get service to know duration (must belong to the claimed business)
    const { data: service, error: serviceError } = await admin
      .from('services')
      .select('duration_minutes, price, name')
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

    // Combine date and time into appointment_datetime
    const appointmentDatetime = combineLocalDateTime(date, startTime)
    const endDatetime = new Date(appointmentDatetime.getTime() + service.duration_minutes * 60000)

    // Double-check availability (prevent race conditions)
    const dayStart = combineLocalDateTime(date, '00:00')
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

    // Check all confirmed bookings that overlap with this day
    // Must include bookings that start before dayStart but end after, or start before dayEnd
    const { data: confirmedBookings, error: overlapError } = await admin
      .from('bookings')
      .select('staff_id, appointment_datetime, end_datetime')
      .eq('business_id', businessId)
      .eq('status', 'confirmed')
      .lt('appointment_datetime', dayEnd.toISOString())
      .gte('end_datetime', dayStart.toISOString())

    if (overlapError) {
      console.error('Error checking availability:', overlapError)
      return NextResponse.json(
        { error: 'Failed to verify availability. Please try again.' },
        { status: 500 }
      )
    }

    // Pre-group bookings by staff_id to avoid N+1 filtering
    type BookingRow = NonNullable<typeof confirmedBookings>[number]
    const bookingsByStaff = new Map<string, BookingRow[]>()
    confirmedBookings?.forEach(booking => {
      const staffIdKey = booking.staff_id || 'unassigned'
      if (!bookingsByStaff.has(staffIdKey)) {
        bookingsByStaff.set(staffIdKey, [])
      }
      bookingsByStaff.get(staffIdKey)!.push(booking)
    })

    // If specific staff requested, check overlaps for that staff
    // If no staff requested ("Any Staff"), find an available staff member and assign them
    let hasOverlap = false
    let assignedStaffId = staffId

    if (staffId) {
      // Specific staff: check only their bookings (using pre-grouped map)
      const staffBookings = bookingsByStaff.get(staffId) || []
      hasOverlap = staffBookings.some((booking) => {
        const bookingStart = new Date(booking.appointment_datetime)
        const bookingEnd = new Date(booking.end_datetime)
        return bookingStart < endDatetime && bookingEnd > appointmentDatetime
      })
    } else {
      // "Any Staff": find an available staff member and assign them to the booking
      // Get all active staff for this business
      const { data: allStaff, error: staffError } = await admin
        .from('staff')
        .select('id')
        .eq('business_id', businessId)
        .eq('is_active', true)

      if (staffError || !allStaff || allStaff.length === 0) {
        return NextResponse.json(
          { error: 'No staff available for this service.' },
          { status: 400 }
        )
      }

      // Check if at least one staff member has no conflict (using pre-grouped map)
      const availableStaff = allStaff.filter(staff => {
        const staffBookings = bookingsByStaff.get(staff.id) || []
        const hasConflict = staffBookings.some((booking) => {
          const bookingStart = new Date(booking.appointment_datetime)
          const bookingEnd = new Date(booking.end_datetime)
          return bookingStart < endDatetime && bookingEnd > appointmentDatetime
        })
        return !hasConflict
      })

      if (availableStaff.length === 0) {
        hasOverlap = true
      } else {
        // Assign the first available staff member
        assignedStaffId = availableStaff[0].id
      }
    }

    if (hasOverlap) {
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please select another time.' },
        { status: 409 }
      )
    }

    // If user is logged in, link booking to customer
    let customerId = null
    if (user) {
      const { data: customer } = await admin
        .from('customers')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      customerId = customer?.id || null
    }

    // Create booking
    const { data: booking, error: bookingError } = await admin
      .from('bookings')
      .insert({
        business_id: businessId,
        service_id: serviceId,
        staff_id: assignedStaffId,
        customer_id: customerId,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        appointment_datetime: appointmentDatetime.toISOString(),
        end_datetime: endDatetime.toISOString(),
        duration_minutes: service.duration_minutes,
        status: 'confirmed',
        price: service.price,
        booking_source: 'web'
      })
      .select('id')
      .single()

    if (bookingError) {
      console.error('Booking creation error:', bookingError)

      // Check for exclusion constraint violation (23P01)
      // This happens when a concurrent request creates an overlap
      if (bookingError.code === '23P01' || bookingError.message?.includes('bookings_no_staff_overlap')) {
        return NextResponse.json(
          { error: 'This time slot was just booked by another customer. Please choose a different time.' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to create booking. Please try again or contact support.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: 'Booking created successfully'
    })

  } catch (error) {
    console.error('Booking API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
