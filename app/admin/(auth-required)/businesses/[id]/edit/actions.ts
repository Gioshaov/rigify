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

export async function updateBusiness(businessId: string, formData: FormData) {
  // Only super admin can call this
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.is_super_admin !== true) {
    return { success: false, message: 'Unauthorized' }
  }

  // Get form data
  const name = (formData.get('name') as string).trim()
  const description = (formData.get('description') as string)?.trim() || null
  const descriptionKa = (formData.get('description_ka') as string)?.trim() || null
  const subdomain = (formData.get('subdomain') as string).trim()
  const slug = (formData.get('slug') as string).trim()
  const phone = (formData.get('phone') as string).trim()
  const email = (formData.get('email') as string)?.trim() || null
  const website = (formData.get('website') as string)?.trim() || null
  const instagram = (formData.get('instagram') as string)?.trim() || null
  const address = (formData.get('address') as string).trim()
  const city = formData.get('city') as string
  const district = (formData.get('district') as string)?.trim() || null
  const status = formData.get('status') as string
  const hours = (formData.get('hours') as string)?.trim() || null
  const coverImageUrl = (formData.get('cover_image_url') as string)?.trim() || null
  const logoUrl = (formData.get('logo_url') as string)?.trim() || null
  const latitude = formData.get('latitude') as string
  const longitude = formData.get('longitude') as string
  const categories = formData.getAll('categories') as string[]

  // Validate required fields
  if (!name || !subdomain || !slug || !phone || !address || !city || !status) {
    return { success: false, message: 'Name, subdomain, slug, phone, address, city, and status are required' }
  }

  if (categories.length === 0) {
    return { success: false, message: 'Please select at least one category' }
  }

  // Validate subdomain format (minimum 3 characters)
  if (!/^[a-z0-9][a-z0-9\-]{1,61}[a-z0-9]$/.test(subdomain)) {
    return { success: false, message: 'Invalid subdomain format. Must be 3-63 characters using lowercase letters, numbers, and hyphens only.' }
  }

  // Validate reserved subdomain
  if (RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
    return { success: false, message: 'This subdomain is reserved. Please choose another.' }
  }

  // Validate phone format
  const phoneDigits = phone.replace(/\D/g, '')
  if (!phone.startsWith('+') || phoneDigits.length < 10) {
    return { success: false, message: 'Invalid phone format. Must start with + and contain at least 10 digits (e.g., +995555123456)' }
  }

  // Validate email if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Invalid email format' }
    }
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

  // Use admin client to bypass RLS
  const admin = createAdminClient()

  // Check if subdomain is already taken by another business
  const { data: existingBusiness } = await admin
    .from('businesses')
    .select('id')
    .eq('subdomain', subdomain)
    .neq('id', businessId)
    .maybeSingle()

  if (existingBusiness) {
    return { success: false, message: 'This subdomain is already taken by another business' }
  }

  // Update the business
  const { error: updateError } = await admin
    .from('businesses')
    .update({
      name,
      description,
      description_ka: descriptionKa,
      subdomain,
      slug,
      phone,
      email,
      website,
      instagram,
      address,
      city,
      district,
      status,
      is_active: status === 'active',
      hours,
      cover_image_url: coverImageUrl,
      logo_url: logoUrl,
      latitude: parsedLatitude,
      longitude: parsedLongitude,
    })
    .eq('id', businessId)

  if (updateError) {
    return { success: false, message: `Failed to update business: ${updateError.message}` }
  }

  // Update categories
  await admin.from('business_categories').delete().eq('business_id', businessId)

  if (categories.length > 0) {
    const categoryInserts = categories.map((categoryId) => ({
      business_id: businessId,
      category_id: categoryId,
    }))

    const { error: categoriesError } = await admin
      .from('business_categories')
      .insert(categoryInserts)

    if (categoriesError) {
      return { success: false, message: `Failed to update categories: ${categoriesError.message}` }
    }
  }

  // Revalidate pages
  revalidatePath('/admin')
  revalidatePath('/businesses')

  return {
    success: true,
    message: `Business "${name}" updated successfully`,
  }
}

export async function createStaffMember(businessId: string, formData: FormData) {
  // Only super admin can call this
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.is_super_admin !== true) {
    return { success: false, message: 'Unauthorized' }
  }

  const name = (formData.get('staff_name') as string)?.trim()
  const email = (formData.get('staff_email') as string)?.trim()
  const password = (formData.get('staff_password') as string)
  const role = formData.get('staff_role') as string
  const specialty = (formData.get('staff_specialty') as string)?.trim() || null

  // Validate required fields
  if (!name || !email || !password) {
    return { success: false, message: 'Name, email, and password are required' }
  }

  if (password.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters' }
  }

  if (!['staff', 'manager'].includes(role)) {
    return { success: false, message: 'Invalid role selected' }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { success: false, message: 'Invalid email format' }
  }

  const admin = createAdminClient()

  // Create auth user
  const { data: newUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'staff',
      business_id: businessId,
    },
  })

  if (authError || !newUser.user) {
    return { success: false, message: `Could not create user: ${authError?.message}` }
  }

  // Create staff record
  const { error: staffError } = await admin.from('staff').insert({
    business_id: businessId,
    user_id: newUser.user.id,
    name,
    email,
    role,
    specialty,
    is_active: true,
  })

  if (staffError) {
    // Rollback: delete auth user if staff creation fails
    await admin.auth.admin.deleteUser(newUser.user.id)
    return { success: false, message: `Could not create staff: ${staffError.message}` }
  }

  revalidatePath(`/admin/businesses/${businessId}/edit`)

  return {
    success: true,
    message: `Staff member "${name}" created successfully`,
  }
}
