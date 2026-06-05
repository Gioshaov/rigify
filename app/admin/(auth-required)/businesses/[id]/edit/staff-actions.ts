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
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string
  const is_active = formData.get('is_active') === 'true'

  if (!name || !email || !role) {
    return { success: false, message: 'Name, email, and role are required' }
  }

  if (!['staff', 'manager'].includes(role)) {
    return { success: false, message: 'Invalid role. Must be "staff" or "manager"' }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, message: 'Invalid email format' }
  }

  const admin = createAdminClient()

  // Get current staff member to find auth user ID
  const { data: staffMember, error: fetchError } = await admin
    .from('staff')
    .select('id, user_id')
    .eq('id', staffId)
    .single()

  if (fetchError || !staffMember) {
    return { success: false, message: 'Staff member not found' }
  }

  // Update auth user if email or password changed
  const authUpdates: { email?: string; password?: string } = {}
  if (email) authUpdates.email = email
  if (password && password.length >= 8) authUpdates.password = password

  if (Object.keys(authUpdates).length > 0) {
    // Verify user_id exists before updating auth
    if (!staffMember.user_id) {
      return { success: false, message: 'Staff member has no linked auth account' }
    }

    const { error: authError } = await admin.auth.admin.updateUserById(
      staffMember.user_id,
      authUpdates
    )

    if (authError) {
      return { success: false, message: `Failed to update auth: ${authError.message}` }
    }
  }

  // Update staff table
  const { error } = await admin
    .from('staff')
    .update({
      name,
      email,
      role,
      is_active,
    })
    .eq('id', staffId)

  if (error) {
    return { success: false, message: `Failed to update staff: ${error.message}` }
  }

  return { success: true, message: 'Staff member updated successfully' }
}
