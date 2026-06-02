'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const RESERVED_SUBDOMAINS = [
  'admin', 'api', 'www', 'app',
  'dashboard', 'login', 'register', 'customer-register',
  'for-businesses', 'customer'
]

export async function onboardBusiness(formData: FormData) {
  // Only super admin can call this — layout already guards the page
  // but double-check here too
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.is_super_admin !== true) {
    return { success: false, message: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const subdomain = formData.get('subdomain') as string
  const slug = formData.get('slug') as string
  const category = formData.get('category') as string
  const city = formData.get('city') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const ownerEmail = formData.get('owner_email') as string
  const ownerPassword = formData.get('owner_password') as string
  const staffName = formData.get('staff_name') as string
  const staffEmail = formData.get('staff_email') as string
  const staffPassword = formData.get('staff_password') as string

  // Validate reserved subdomain
  if (RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
    return { success: false, message: 'This subdomain is reserved. Please choose another.' }
  }

  // Use service role client — bypasses RLS
  const admin = createAdminClient()

  // 1. Create owner auth user
  const { data: ownerData, error: ownerError } = await admin.auth.admin.createUser({
    email: ownerEmail,
    password: ownerPassword,
    email_confirm: true,
    user_metadata: { role: 'business_owner' },
  })

  if (ownerError || !ownerData.user) {
    return { success: false, message: `Failed to create owner account: ${ownerError?.message}` }
  }

  const ownerId = ownerData.user.id

  // 2. Create business record
  const { data: business, error: bizError } = await admin
    .from('businesses')
    .insert({
      owner_id: ownerId,
      name,
      subdomain,
      slug,
      category,
      city,
      phone,
      address,
      status: 'active',
      onboarded_by: user.id,
      is_active: true,
    })
    .select('id')
    .single()

  if (bizError || !business) {
    // Rollback: delete the auth user we just created
    await admin.auth.admin.deleteUser(ownerId)
    return { success: false, message: `Failed to create business: ${bizError?.message}` }
  }

  // 3. Insert category into business_categories junction table
  const { error: categoryError } = await admin
    .from('business_categories')
    .insert({
      business_id: business.id,
      category_id: category,
    })

  if (categoryError) {
    console.error('Failed to insert category:', categoryError)
    // Non-fatal: business is created, admin can add category manually
  }

  // 4. Optionally create staff account
  if (staffName && staffEmail && staffPassword) {
    const { data: staffAuthData, error: staffAuthError } = await admin.auth.admin.createUser({
      email: staffEmail,
      password: staffPassword,
      email_confirm: true,
      user_metadata: { role: 'staff' },
    })

    if (!staffAuthError && staffAuthData.user) {
      await admin.from('staff').insert({
        business_id: business.id,
        name: staffName,
        user_id: staffAuthData.user.id,
        role: 'staff',
        is_active: true,
      })
    }
    // Staff creation failure is non-fatal — log it but don't roll back
  }

  return {
    success: true,
    message: `Business "${name}" created. Owner login: ${ownerEmail}`,
    subdomain,
  }
}
