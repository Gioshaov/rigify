"use server";

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { createAuditLog } from '@/lib/utils/audit-log';
import { headers } from 'next/headers';

/**
 * Cancel a booking on behalf of a customer
 */
export async function cancelBooking(bookingId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    return { error: 'Unauthorized' };
  }

  // Use admin client to fetch current booking
  const admin = createAdminClient();

  const { data: currentBooking } = await admin
    .from('bookings')
    .select('status, customer_name, appointment_datetime, business_id, businesses(name)')
    .eq('id', bookingId)
    .single();

  if (!currentBooking) {
    return { error: 'Booking not found' };
  }

  if (currentBooking.status === 'cancelled') {
    return { error: 'Booking is already cancelled' };
  }

  if (currentBooking.status === 'completed') {
    return { error: 'Cannot cancel a completed booking' };
  }

  if (currentBooking.status === 'no_show') {
    return { error: 'Cannot cancel a no-show booking' };
  }

  // Cancel the booking
  const { error } = await admin
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId);

  if (error) {
    return { error: 'Failed to cancel booking' };
  }

  // Audit log with database-verified data
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0].trim() || headersList.get('x-real-ip') || undefined;
  const userAgent = headersList.get('user-agent') || undefined;

  const businessName = (currentBooking as any).businesses?.name || 'Unknown';
  const appointmentTime = new Date(currentBooking.appointment_datetime).toISOString();

  await createAuditLog({
    adminUserId: user.id,
    adminEmail: user.email!,
    action: 'update',
    resourceType: 'booking',
    resourceId: bookingId,
    resourceName: `${currentBooking.customer_name} - ${businessName} - ${appointmentTime}`,
    details: {
      previousStatus: currentBooking.status,
      newStatus: 'cancelled',
      cancelledBy: 'admin',
    },
    ipAddress,
    userAgent,
  });

  return { success: true };
}

/**
 * Mark a booking as no-show
 */
export async function markNoShow(bookingId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    return { error: 'Unauthorized' };
  }

  // Use admin client to fetch and update booking
  const admin = createAdminClient();

  const { data: currentBooking } = await admin
    .from('bookings')
    .select('status, customer_name, appointment_datetime, business_id, businesses(name)')
    .eq('id', bookingId)
    .single();

  if (!currentBooking) {
    return { error: 'Booking not found' };
  }

  if (currentBooking.status === 'no_show') {
    return { error: 'Booking is already marked as no-show' };
  }

  if (currentBooking.status === 'cancelled') {
    return { error: 'Cannot mark a cancelled booking as no-show' };
  }

  if (currentBooking.status === 'completed') {
    return { error: 'Cannot mark a completed booking as no-show' };
  }

  const { error } = await admin
    .from('bookings')
    .update({ status: 'no_show' })
    .eq('id', bookingId);

  if (error) {
    return { error: 'Failed to mark booking as no-show' };
  }

  // Audit log with database-verified data
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0].trim() || headersList.get('x-real-ip') || undefined;
  const userAgent = headersList.get('user-agent') || undefined;

  const businessName = (currentBooking as any).businesses?.name || 'Unknown';
  const appointmentTime = new Date(currentBooking.appointment_datetime).toISOString();

  await createAuditLog({
    adminUserId: user.id,
    adminEmail: user.email!,
    action: 'update',
    resourceType: 'booking',
    resourceId: bookingId,
    resourceName: `${currentBooking.customer_name} - ${businessName} - ${appointmentTime}`,
    details: {
      previousStatus: currentBooking.status,
      newStatus: 'no_show',
      markedBy: 'admin',
    },
    ipAddress,
    userAgent,
  });

  return { success: true };
}

/**
 * Update/reschedule a booking
 */
export async function updateBooking(bookingId: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    return { success: false, message: 'Unauthorized' };
  }

  const admin = createAdminClient();

  // Fetch existing booking
  const { data: existingBooking, error: fetchError } = await admin
    .from('bookings')
    .select('*, business:businesses(name)')
    .eq('id', bookingId)
    .single();

  if (fetchError || !existingBooking) {
    return { success: false, message: 'Booking not found' };
  }

  // Validate editable status
  if (existingBooking.status === 'cancelled' || existingBooking.status === 'completed' || existingBooking.status === 'no_show') {
    return { success: false, message: `Cannot edit ${existingBooking.status} bookings` };
  }

  // Extract fields
  const serviceId = formData.get('service_id')?.toString();
  const staffId = formData.get('staff_id')?.toString();
  const date = formData.get('date')?.toString();
  const time = formData.get('time')?.toString();
  const durationMinutes = parseInt(formData.get('duration_minutes')?.toString() || '0');
  const notes = formData.get('notes')?.toString() || null;

  if (!serviceId || !staffId || !date || !time || !durationMinutes) {
    return { success: false, message: 'All fields are required' };
  }

  // Convert local datetime to UTC
  const { combineLocalDateTime } = await import('@/lib/utils/datetime');
  const appointmentDatetimeUtc = combineLocalDateTime(date, time);
  const endDatetimeUtc = new Date(appointmentDatetimeUtc.getTime() + durationMinutes * 60 * 1000);

  // Check if datetime changed (for reschedule count) - compare as milliseconds to avoid string format issues
  const datetimeChanged = new Date(existingBooking.appointment_datetime).getTime() !== appointmentDatetimeUtc.getTime();

  // Check reschedule limit
  if (datetimeChanged && existingBooking.reschedule_count >= 3) {
    return { success: false, message: 'Reschedule limit reached (max 3 per booking)' };
  }

  // Check overlap (exclude current booking)
  // Use strict inequalities: overlap exists when existing starts before new ends AND existing ends after new starts
  const { data: overlapping } = await admin
    .from('bookings')
    .select('id')
    .eq('staff_id', staffId)
    .eq('status', 'confirmed')
    .neq('id', bookingId)
    .lt('appointment_datetime', endDatetimeUtc.toISOString())
    .gt('end_datetime', appointmentDatetimeUtc.toISOString());

  if (overlapping && overlapping.length > 0) {
    return { success: false, message: 'Staff has conflicting booking at this time' };
  }

  // Update booking
  const updateData: any = {
    service_id: serviceId,
    staff_id: staffId,
    appointment_datetime: appointmentDatetimeUtc.toISOString(),
    end_datetime: endDatetimeUtc.toISOString(),
    duration_minutes: durationMinutes,
    notes,
  };

  // Increment reschedule count if datetime changed
  if (datetimeChanged) {
    updateData.reschedule_count = existingBooking.reschedule_count + 1;
  }

  const { error: updateError } = await admin
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId);

  if (updateError) {
    return { success: false, message: 'Failed to update booking' };
  }

  // Audit log
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0].trim() || headersList.get('x-real-ip') || undefined;
  const userAgent = headersList.get('user-agent') || undefined;

  const businessName = (existingBooking as any).business?.name || 'Unknown';

  await createAuditLog({
    adminUserId: user.id,
    adminEmail: user.email!,
    action: 'update',
    resourceType: 'booking',
    resourceId: bookingId,
    resourceName: `${existingBooking.customer_name} - ${businessName}`,
    details: {
      changes: {
        service_id: { from: existingBooking.service_id, to: serviceId },
        staff_id: { from: existingBooking.staff_id, to: staffId },
        appointment_datetime: { from: existingBooking.appointment_datetime, to: appointmentDatetimeUtc.toISOString() },
        duration_minutes: { from: existingBooking.duration_minutes, to: durationMinutes },
        reschedule_count: datetimeChanged ? { from: existingBooking.reschedule_count, to: existingBooking.reschedule_count + 1 } : undefined,
      }
    },
    ipAddress,
    userAgent,
  });

  // Revalidate paths
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/admin/bookings');
  revalidatePath(`/admin/bookings/${bookingId}`);

  return { success: true, message: 'Booking updated successfully' };
}

/**
 * Create a new booking manually from admin panel
 */
export async function createBooking(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    return { success: false, message: 'Unauthorized', bookingId: null };
  }

  const admin = createAdminClient();

  // Extract fields
  const businessId = formData.get('business_id')?.toString();
  const serviceId = formData.get('service_id')?.toString();
  const staffId = formData.get('staff_id')?.toString();
  const date = formData.get('date')?.toString();
  const time = formData.get('time')?.toString();
  const durationMinutes = parseInt(formData.get('duration_minutes')?.toString() || '0');
  const notes = formData.get('notes')?.toString() || null;

  // Customer info (either existing customer ID or guest info)
  const customerId = formData.get('customer_id')?.toString() || null;
  const customerName = formData.get('customer_name')?.toString();
  const customerPhone = formData.get('customer_phone')?.toString();
  const customerEmail = formData.get('customer_email')?.toString() || null;

  if (!businessId || !serviceId || !staffId || !date || !time || !durationMinutes || !customerName || !customerPhone) {
    return { success: false, message: 'All required fields must be filled', bookingId: null };
  }

  // Validate phone format
  if (!/^\+995\d{9}$/.test(customerPhone)) {
    return { success: false, message: 'Phone must be in Georgian format (+995XXXXXXXXX)', bookingId: null };
  }

  // Convert local datetime to UTC
  const { combineLocalDateTime } = await import('@/lib/utils/datetime');
  const appointmentDatetimeUtc = combineLocalDateTime(date, time);
  const endDatetimeUtc = new Date(appointmentDatetimeUtc.getTime() + durationMinutes * 60 * 1000);

  // Check overlap
  // Use strict inequalities to allow back-to-back appointments
  const { data: overlapping } = await admin
    .from('bookings')
    .select('id')
    .eq('staff_id', staffId)
    .eq('status', 'confirmed')
    .lt('appointment_datetime', endDatetimeUtc.toISOString())
    .gt('end_datetime', appointmentDatetimeUtc.toISOString());

  if (overlapping && overlapping.length > 0) {
    return { success: false, message: 'Staff has conflicting booking at this time', bookingId: null };
  }

  // Get service price
  const { data: service } = await admin
    .from('services')
    .select('price')
    .eq('id', serviceId)
    .single();

  // Insert booking
  const { data: newBooking, error: insertError } = await admin
    .from('bookings')
    .insert({
      business_id: businessId,
      service_id: serviceId,
      staff_id: staffId,
      customer_id: customerId,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      appointment_datetime: appointmentDatetimeUtc.toISOString(),
      end_datetime: endDatetimeUtc.toISOString(),
      duration_minutes: durationMinutes,
      status: 'confirmed',
      booking_source: 'dashboard',
      notes,
      price: service?.price || null,
      reschedule_count: 0,
    })
    .select('id')
    .single();

  if (insertError || !newBooking) {
    return { success: false, message: 'Failed to create booking', bookingId: null };
  }

  // TODO: Send confirmation email

  // Audit log
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const ipAddress = forwardedFor?.split(',')[0].trim() || headersList.get('x-real-ip') || undefined;
  const userAgent = headersList.get('user-agent') || undefined;

  await createAuditLog({
    adminUserId: user.id,
    adminEmail: user.email!,
    action: 'create',
    resourceType: 'booking',
    resourceId: newBooking.id,
    resourceName: `${customerName} - Manual Booking`,
    details: {
      business_id: businessId,
      service_id: serviceId,
      staff_id: staffId,
      customer_id: customerId,
      appointment_datetime: appointmentDatetimeUtc.toISOString(),
      booking_source: 'dashboard',
    },
    ipAddress,
    userAgent,
  });

  // Revalidate
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/admin/bookings');

  return { success: true, message: 'Booking created successfully', bookingId: newBooking.id };
}

/**
 * Search customers for booking creation wizard
 */
export async function searchCustomers(query: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    return { success: false, customers: [] };
  }

  if (!query || query.length < 2) {
    return { success: true, customers: [] };
  }

  const admin = createAdminClient();

  const { data: customers } = await admin
    .from('customers')
    .select('id, name, phone, email')
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(5);

  return { success: true, customers: customers || [] };
}
