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

export async function deleteBusiness(businessId: string) {
  // Verify super admin access
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    return { success: false, error: 'Unauthorized' };
  }

  const admin = createAdminClient();

  // Fetch owner_id before deleting (need it to delete auth user)
  const { data: business, error: fetchError } = await admin
    .from('businesses')
    .select('owner_id')
    .eq('id', businessId)
    .single();

  if (fetchError || !business) {
    console.error('Failed to fetch business for deletion:', fetchError);
    return { success: false, error: 'Business not found' };
  }

  // Delete auth user FIRST if business has an owner (prevents orphaned credentials)
  // Some test/seed businesses may have NULL owner_id, skip auth deletion for those
  if (business.owner_id) {
    const { error: authDeleteError } = await admin.auth.admin.deleteUser(business.owner_id);

    if (authDeleteError) {
      console.error('Failed to delete auth user:', authDeleteError);
      return { success: false, error: 'Failed to delete business account' };
    }
  }

  // Delete business (cascade deletes staff, services, bookings, reviews)
  const { error: deleteError } = await admin
    .from('businesses')
    .delete()
    .eq('id', businessId);

  if (deleteError) {
    console.error('Failed to delete business:', deleteError);
    return { success: false, error: business.owner_id
      ? 'Account deleted but business data removal failed. Contact support.'
      : 'Failed to delete business data'
    };
  }

  return { success: true };
}
