'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function toggleBusinessStatus(businessId: string, currentStatus: string) {
  // Verify super admin access
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    return { success: false, error: 'Unauthorized' };
  }

  // Use admin client to update business status
  const admin = createAdminClient();

  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

  const { error } = await admin
    .from('businesses')
    .update({ status: newStatus })
    .eq('id', businessId);

  if (error) {
    console.error('Failed to update business status:', error);
    return { success: false, error: error.message };
  }

  return { success: true, newStatus };
}

export async function deleteBusiness(businessId: string, businessName: string) {
  // Verify super admin access
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    return { success: false, error: 'Unauthorized' };
  }

  // Use admin client to delete business
  // Cascade deletes will automatically remove related staff, services, bookings, reviews
  const admin = createAdminClient();

  const { error } = await admin
    .from('businesses')
    .delete()
    .eq('id', businessId);

  if (error) {
    console.error('Failed to delete business:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
