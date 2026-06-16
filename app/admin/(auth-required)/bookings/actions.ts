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
