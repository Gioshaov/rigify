'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const subdomain = formData.get('subdomain') as string
  const slug = formData.get('slug') as string
  const categories = formData.getAll('categories') as string[]
  const city = formData.get('city') as string
  const district = (formData.get('district') as string)?.trim() || null
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const description = (formData.get('description') as string)?.trim() || null
  const descriptionKa = (formData.get('description_ka') as string)?.trim() || null
  const descriptionRu = (formData.get('description_ru') as string)?.trim() || null
  const email = (formData.get('email') as string)?.trim() || null
  const website = (formData.get('website') as string)?.trim() || null
  const instagram = (formData.get('instagram') as string)?.trim() || null
  const hours = (formData.get('hours') as string)?.trim() || null
  const statusRaw = (formData.get('status') as string)?.trim() || 'active'
  const coverImageUrl = formData.get('cover_image_url') as string
  const logoUrl = formData.get('logo_url') as string
  const latitude = formData.get('latitude') as string
  const longitude = formData.get('longitude') as string
  const ownerEmail = formData.get('owner_email') as string
  const ownerPassword = formData.get('owner_password') as string
  const staffName = formData.get('staff_name') as string
  const staffEmail = formData.get('staff_email') as string
  const staffPassword = formData.get('staff_password') as string

  // Primary category (businesses.category is NOT NULL); the full set goes to
  // the business_categories junction table.
  const primaryCategory = categories[0]

  // Validate required fields
  if (!name || !subdomain || !slug || categories.length === 0 || !city || !phone || !address || !ownerEmail || !ownerPassword) {
    return { success: false, message: 'Missing required fields (name, subdomain, slug, at least one category, city, phone, address, owner email + password)' }
  }

  // Validate the client-generated business id (used as the image upload path too)
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { success: false, message: 'Invalid business id. Please reload the form and try again.' }
  }

  // Validate status
  if (!['active', 'inactive', 'draft'].includes(statusRaw)) {
    return { success: false, message: 'Invalid status' }
  }

  // Validate optional business email format if provided
  if (email && !/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) {
    return { success: false, message: 'Invalid business email format' }
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

  // Parse + validate coordinates (optional, but needed for the map view).
  const parsedLatitude = latitude && latitude.trim() !== '' ? parseFloat(latitude) : null
  const parsedLongitude = longitude && longitude.trim() !== '' ? parseFloat(longitude) : null
  if (parsedLatitude !== null && (isNaN(parsedLatitude) || parsedLatitude < -90 || parsedLatitude > 90)) {
    return { success: false, message: 'Latitude must be a valid number between -90 and 90' }
  }
  if (parsedLongitude !== null && (isNaN(parsedLongitude) || parsedLongitude < -180 || parsedLongitude > 180)) {
    return { success: false, message: 'Longitude must be a valid number between -180 and 180' }
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

  // 2. Create business record (id is the client-generated UUID so it matches
  //    the path images were uploaded to before submit)
  const { data: business, error: bizError } = await admin
    .from('businesses')
    .insert({
      id,
      owner_id: ownerId,
      name,
      subdomain,
      slug,
      category: primaryCategory,
      city,
      district,
      phone,
      address,
      description,
      description_ka: descriptionKa,
      description_ru: descriptionRu,
      email,
      website,
      instagram,
      hours,
      cover_image_url: coverImageUrl || null,
      logo_url: logoUrl || null,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
      status: statusRaw,
      onboarded_by: user.id,
      is_active: statusRaw === 'active',
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

  // 3. Insert all selected categories into the business_categories junction
  const { error: categoryError } = await admin
    .from('business_categories')
    .insert(categories.map((category_id) => ({ business_id: business.id, category_id })))

  if (categoryError) {
    console.error('Failed to insert categories:', categoryError)
    // Non-fatal: business is created, admin can add categories manually
  }

  // Surface the new business in the marketplace listing without waiting for
  // the cache to expire.
  revalidatePath('/businesses')
  revalidatePath('/admin')

  // 4. Optionally create staff account (validation already done above)
  if (staffName && staffEmail && staffPassword) {
    const { data: staffAuthData, error: staffAuthError } = await admin.auth.admin.createUser({
      email: staffEmail,
      password: staffPassword,
      email_confirm: true,
      user_metadata: { role: 'staff' },
    })

    if (staffAuthError) {
      console.error('[ONBOARD] Auth creation failed:', staffAuthError.message)
      return {
        success: true,
        message: `⚠️ Business "${name}" created, but staff account creation failed. Please contact support.`,
        subdomain,
      }
    }

    if (!staffAuthData.user) {
      console.error('[ONBOARD] Auth creation returned no user')
      return {
        success: true,
        message: `⚠️ Business "${name}" created, but staff account creation failed. Please contact support.`,
        subdomain,
      }
    }

    const staffInsertData = {
      business_id: business.id,
      name: staffName,
      user_id: staffAuthData.user.id,
      role: 'staff',
      is_active: true,
    }

    const { data: staffRecord, error: staffInsertError } = await admin
      .from('staff')
      .insert(staffInsertData)
      .select('id, name, business_id')
      .single()

    if (staffInsertError) {
      console.error('[ONBOARD] Staff database insert failed:', staffInsertError.message)

      const { error: deleteError } = await admin.auth.admin.deleteUser(staffAuthData.user.id)
      if (deleteError) {
        console.error('[ONBOARD] Staff rollback failed:', deleteError.message)
      }

      return {
        success: true,
        message: `⚠️ Business "${name}" created, but staff account creation failed. Please contact support.`,
        subdomain,
      }
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
