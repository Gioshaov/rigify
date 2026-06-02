'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

const RESERVED_SUBDOMAINS = [
  'admin', 'api', 'www', 'app',
  'dashboard', 'login', 'register', 'customer-register',
  'for-businesses', 'customer',
  'mail', 'smtp', 'ftp', 'status', 'blog', 'help', 'support',
  'cdn', 'static', 'assets', 'media', 'localhost'
]

export async function onboardBusiness(formData: FormData) {
  // Only super admin can call this — layout already guards the page
  // but double-check here too
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.is_super_admin !== true) {
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

  // Validate required fields
  if (!name || !subdomain || !slug || !category || !city || !phone || !address || !ownerEmail || !ownerPassword) {
    return { success: false, message: 'Missing required fields' }
  }

  // Validate subdomain format (minimum 3 characters)
  if (!/^[a-z0-9][a-z0-9\-]{1,61}[a-z0-9]$/.test(subdomain)) {
    return { success: false, message: 'Invalid subdomain format. Must be 3-63 characters using lowercase letters, numbers, and hyphens only.' }
  }

  // Validate reserved subdomain
  if (RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
    return { success: false, message: 'This subdomain is reserved. Please choose another.' }
  }

  // Validate email format (requires proper TLD)
  if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(ownerEmail)) {
    return { success: false, message: 'Invalid email format. Must include a valid domain extension (e.g., .com, .ge)' }
  }

  // Validate phone format (must start with + and have at least 10 digits)
  const phoneDigits = phone.replace(/\D/g, '')
  if (!phone.startsWith('+') || phoneDigits.length < 10) {
    return { success: false, message: 'Invalid phone format. Must start with + and contain at least 10 digits (e.g., +995555123456)' }
  }

  // Validate password length
  if (ownerPassword.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters' }
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
    // Validate staff email format
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(staffEmail)) {
      console.error('Invalid staff email format:', staffEmail)
      // Non-fatal: business is created, admin can add staff manually
      return {
        success: true,
        message: `Business "${name}" created, but staff account skipped (invalid email format). Owner login: ${ownerEmail}`,
        subdomain,
      }
    }

    // Validate staff password length
    if (staffPassword.length < 8) {
      console.error('Staff password too short')
      // Non-fatal: business is created, admin can add staff manually
      return {
        success: true,
        message: `Business "${name}" created, but staff account skipped (password too short). Owner login: ${ownerEmail}`,
        subdomain,
      }
    }

    const { data: staffAuthData, error: staffAuthError } = await admin.auth.admin.createUser({
      email: staffEmail,
      password: staffPassword,
      email_confirm: true,
      user_metadata: { role: 'staff' },
    })

    if (!staffAuthError && staffAuthData.user) {
      const { error: staffInsertError } = await admin.from('staff').insert({
        business_id: business.id,
        name: staffName,
        user_id: staffAuthData.user.id,
        role: 'staff',
        is_active: true,
      })

      if (staffInsertError) {
        // Rollback: delete the staff auth user we just created
        await admin.auth.admin.deleteUser(staffAuthData.user.id)
        console.error('Staff insert failed, rolled back auth user:', staffInsertError)
      }
    }
    // Staff creation failure is non-fatal — business is still created
  }

  return {
    success: true,
    message: `Business "${name}" created. Owner login: ${ownerEmail}`,
    subdomain,
  }
}
