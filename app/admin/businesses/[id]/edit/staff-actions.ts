'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function updateStaffMember(staffId: string, formData: FormData) {
  // Only super admin can call this
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.is_super_admin !== true) {
    return { success: false, message: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const role = formData.get('role') as string
  const is_active = formData.get('is_active') === 'true'

  if (!name || !role) {
    return { success: false, message: 'Name and role are required' }
  }

  if (!['staff', 'manager'].includes(role)) {
    return { success: false, message: 'Invalid role. Must be "staff" or "manager"' }
  }

  const admin = createAdminClient()

  const { error } = await admin
    .from('staff')
    .update({
      name,
      role,
      is_active,
    })
    .eq('id', staffId)

  if (error) {
    return { success: false, message: `Failed to update staff: ${error.message}` }
  }

  return { success: true, message: 'Staff member updated successfully' }
}
