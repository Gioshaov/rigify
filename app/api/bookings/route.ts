import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { combineLocalDateTime } from '@/lib/utils/datetime'

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

    const supabase = createClient()
    const admin = createAdminClient()

    // Get current user (if logged in)
    const { data: { user } } = await supabase.auth.getUser()

    // Get service to know duration
    const { data: service, error: serviceError } = await admin
      .from('services')
      .select('duration_minutes, price, name')
      .eq('id', serviceId)
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
    const dayEnd = combineLocalDateTime(date, '23:59')

    // Check all confirmed bookings on this day
    // Check ALL bookings regardless of staffId to prevent double-booking
    const { data: confirmedBookings, error: overlapError } = await admin
      .from('bookings')
      .select('staff_id, appointment_datetime, end_datetime')
      .eq('business_id', businessId)
      .eq('status', 'confirmed')
      .gte('appointment_datetime', dayStart.toISOString())
      .lte('appointment_datetime', dayEnd.toISOString())

    if (overlapError) {
      console.error('Error checking availability:', overlapError)
      return NextResponse.json(
        { error: 'Failed to verify availability. Please try again.' },
        { status: 500 }
      )
    }

    // If specific staff requested, check overlaps for that staff
    // If no staff requested ("Any Staff"), find an available staff member and assign them
    let hasOverlap = false
    let assignedStaffId = staffId

    if (staffId) {
      // Specific staff: check only their bookings
      const staffBookings = confirmedBookings?.filter(b => b.staff_id === staffId) || []
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

      // Check if at least one staff member has no conflict
      const availableStaff = allStaff.filter(staff => {
        const staffBookings = confirmedBookings?.filter(b => b.staff_id === staff.id) || []
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
