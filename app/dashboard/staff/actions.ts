'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateStaff(staffId: string, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Not authenticated' }
  }

  // Verify ownership
  const { data: staff } = await supabase
    .from('staff')
    .select('business_id, businesses!inner(owner_id)')
    .eq('id', staffId)
    .single()

  if (!staff || (staff.businesses as any).owner_id !== user.id) {
    return { success: false, message: 'Unauthorized' }
  }

  const name = (formData.get('name') as string)?.trim()
  const role = (formData.get('role') as string)?.trim()
  const isActive = formData.get('is_active') === 'on'

  if (!name) {
    return { success: false, message: 'Name is required' }
  }

  if (!role) {
    return { success: false, message: 'Role is required' }
  }

  // Update staff member
  const admin = createAdminClient()
  const { error } = await admin
    .from('staff')
    .update({
      name,
      role,
      is_active: isActive
    })
    .eq('id', staffId)

  if (error) {
    return { success: false, message: `Failed to update staff: ${error.message}` }
  }

  revalidatePath('/dashboard/staff')

  return { success: true, message: 'Staff member updated successfully' }
}

export async function deleteStaff(staffId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Not authenticated' }
  }

  // Verify ownership - check that this staff member belongs to a business owned by this user
  const { data: staff } = await supabase
    .from('staff')
    .select('business_id, businesses!inner(owner_id)')
    .eq('id', staffId)
    .single()

  if (!staff || (staff.businesses as any).owner_id !== user.id) {
    return { success: false, message: 'Unauthorized' }
  }

  // Delete staff member
  const admin = createAdminClient()
  const { error } = await admin
    .from('staff')
    .delete()
    .eq('id', staffId)

  if (error) {
    return { success: false, message: `Failed to remove staff: ${error.message}` }
  }

  revalidatePath('/dashboard/staff')

  return { success: true, message: 'Staff member removed successfully' }
}
