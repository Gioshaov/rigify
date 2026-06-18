'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitReviewAction(data: {
  bookingId: string;
  rating: number;
  comment: string;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Only create admin client after auth check
  const admin = createAdminClient();

  // Validate rating
  if (!data.rating || data.rating < 1 || data.rating > 5) {
    return { success: false, error: 'Rating must be between 1 and 5 stars' };
  }

  // Validate comment length
  if (data.comment && data.comment.length > 1000) {
    return { success: false, error: 'Comment must be 1000 characters or less' };
  }

  // Verify booking belongs to user and get booking details
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('id, customer_id, business_id, customer_name, appointment_datetime')
    .eq('id', data.bookingId)
    .single();

  if (fetchError || !booking) {
    return { success: false, error: 'Booking not found' };
  }

  // Reject guest bookings (customer_id is null) and bookings belonging to other users
  if (!booking.customer_id || booking.customer_id !== user.id) {
    return { success: false, error: 'Unauthorized' };
  }

  // Check if booking is in the past
  const appointmentDate = new Date(booking.appointment_datetime);
  if (appointmentDate > new Date()) {
    return { success: false, error: 'Cannot review future appointments' };
  }

  // Check if review already exists for this booking
  const { data: existingReview } = await admin
    .from('reviews')
    .select('id')
    .eq('booking_id', data.bookingId)
    .maybeSingle();

  if (existingReview) {
    return { success: false, error: 'You have already reviewed this booking' };
  }

  // Create review
  const { error: createError } = await admin
    .from('reviews')
    .insert({
      business_id: booking.business_id,
      booking_id: data.bookingId,
      customer_name: booking.customer_name,
      rating: data.rating,
      comment: data.comment.trim() || null,
    });

  if (createError) {
    console.error('Create review error:', createError);
    return { success: false, error: 'Failed to submit review' };
  }

  // Revalidate paths
  revalidatePath('/customer/dashboard');

  return { success: true };
}
