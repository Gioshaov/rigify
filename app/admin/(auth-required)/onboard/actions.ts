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
  const coverImageUrl = formData.get('cover_image_url') as string
  const logoUrl = formData.get('logo_url') as string
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

  // Validate staff fields if provided (before creating anything)
  if (staffName || staffEmail || staffPassword) {
    // If any staff field is filled, all must be filled
    if (!staffName || !staffEmail || !staffPassword) {
      return { success: false, message: 'If providing staff details, all three fields (name, email, password) are required' }
    }

    // Validate staff email format
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(staffEmail)) {
      return { success: false, message: `Invalid staff email format: "${staffEmail}". Must include a valid domain extension (e.g., .com, .ge)` }
    }

    // Validate staff password length
    if (staffPassword.length < 8) {
      return { success: false, message: 'Staff password must be at least 8 characters' }
    }
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
      cover_image_url: coverImageUrl || null,
      logo_url: logoUrl || null,
      status: 'active',
      onboarded_by: user.id,
      is_active: true,
    })
    .select('id')
    .single()

  if (bizError || !business) {
    // Rollback: delete the auth user we just created
    await admin.auth.admin.deleteUser(ownerId)

    // User-friendly error messages
    if (bizError?.message?.includes('businesses_slug_key')) {
      return { success: false, message: `This business slug "${slug}" is already taken. Please choose a different one.` }
    }
    if (bizError?.message?.includes('businesses_subdomain_key')) {
      return { success: false, message: `This subdomain "${subdomain}" is already taken. Please choose a different one.` }
    }

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

  // 4. Optionally create staff account (validation already done above)
  if (staffName && staffEmail && staffPassword) {
    console.log('[ONBOARD] ========== STAFF CREATION START ==========')
    console.log('[ONBOARD] Staff name:', staffName)
    console.log('[ONBOARD] Business ID:', business.id)
    console.log('[ONBOARD] Business name:', name)

    console.log('[ONBOARD] Step 1: Creating auth user...')
    const { data: staffAuthData, error: staffAuthError } = await admin.auth.admin.createUser({
      email: staffEmail,
      password: staffPassword,
      email_confirm: true,
      user_metadata: { role: 'staff' },
    })

    if (staffAuthError) {
      console.error('[ONBOARD] ❌ Step 1 FAILED - Auth creation error:', staffAuthError.message)
      console.error('[ONBOARD] Full error:', JSON.stringify(staffAuthError, null, 2))
      return {
        success: true,
        message: `⚠️ Business "${name}" created, but staff account creation failed:\n${staffAuthError.message}\n\nOwner login: ${ownerEmail}`,
        subdomain,
      }
    }

    if (!staffAuthData.user) {
      console.error('[ONBOARD] ❌ Step 1 FAILED - No user returned despite no error')
      return {
        success: true,
        message: `⚠️ Business "${name}" created, but staff account creation returned no user. Owner login: ${ownerEmail}`,
        subdomain,
      }
    }

    console.log('[ONBOARD] ✅ Step 1 SUCCESS - Auth user created:', staffAuthData.user.id)
    console.log('[ONBOARD] Step 2: Inserting staff record into database...')

    const staffInsertData = {
      business_id: business.id,
      name: staffName,
      user_id: staffAuthData.user.id,
      role: 'staff',
      is_active: true,
    }
    console.log('[ONBOARD] Insert data:', staffInsertData)

    const { data: staffRecord, error: staffInsertError } = await admin
      .from('staff')
      .insert(staffInsertData)
      .select()
      .single()

    if (staffInsertError) {
      console.error('[ONBOARD] ❌ Step 2 FAILED - Database insert error:', staffInsertError.message)
      console.error('[ONBOARD] Full error:', JSON.stringify(staffInsertError, null, 2))
      console.log('[ONBOARD] Rolling back auth user...')

      const { error: deleteError } = await admin.auth.admin.deleteUser(staffAuthData.user.id)
      if (deleteError) {
        console.error('[ONBOARD] Rollback also failed:', deleteError.message)
      } else {
        console.log('[ONBOARD] Rollback successful')
      }

      return {
        success: true,
        message: `⚠️ Business "${name}" created, but staff database insert failed:\n${staffInsertError.message}\n\nOwner login: ${ownerEmail}`,
        subdomain,
      }
    }

    console.log('[ONBOARD] ✅ Step 2 SUCCESS - Staff record created')
    console.log('[ONBOARD] Staff record:', JSON.stringify(staffRecord, null, 2))
    console.log('[ONBOARD] ========== STAFF CREATION COMPLETE ==========')

    // Verify staff was actually created by querying it back
    const { data: verifyStaff, error: verifyError } = await admin
      .from('staff')
      .select('*')
      .eq('id', staffRecord.id)
      .single()

    if (verifyError || !verifyStaff) {
      console.error('[ONBOARD] ⚠️ WARNING - Staff was inserted but cannot be queried back:', verifyError?.message)
    } else {
      console.log('[ONBOARD] ✅ VERIFIED - Staff exists in database:', verifyStaff)
    }

    // Staff created successfully!
    return {
      success: true,
      message: `✅ Business "${name}" created successfully!\n\n👤 Owner: ${ownerEmail}\n👥 Staff: ${staffName} (${staffEmail})\n\nBoth accounts are ready to use.\n\nStaff ID: ${staffRecord.id}`,
      subdomain,
    }
  }

  return {
    success: true,
    message: `Business "${name}" created. Owner login: ${ownerEmail}`,
    subdomain,
  }
}
