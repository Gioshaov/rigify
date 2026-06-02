'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

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

  const name = formData.get('name') as string
  const subdomain = formData.get('subdomain') as string
  const slug = formData.get('slug') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const city = formData.get('city') as string
  const status = formData.get('status') as string

  // Validate required fields
  if (!name || !subdomain || !slug || !phone || !address || !city || !status) {
    return { success: false, message: 'All fields are required' }
  }

  // Validate subdomain format (minimum 3 characters)
  if (!/^[a-z0-9][a-z0-9\-]{1,61}[a-z0-9]$/.test(subdomain)) {
    return { success: false, message: 'Invalid subdomain format. Must be 3-63 characters using lowercase letters, numbers, and hyphens only.' }
  }

  // Validate reserved subdomain
  if (RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase())) {
    return { success: false, message: 'This subdomain is reserved. Please choose another.' }
  }

  // Validate phone format (must start with + and have at least 10 digits)
  const phoneDigits = phone.replace(/\D/g, '')
  if (!phone.startsWith('+') || phoneDigits.length < 10) {
    return { success: false, message: 'Invalid phone format. Must start with + and contain at least 10 digits (e.g., +995555123456)' }
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

  // Update the business (map status to is_active boolean)
  const { error } = await admin
    .from('businesses')
    .update({
      name,
      subdomain,
      slug,
      phone,
      address,
      city,
      status,
      is_active: status === 'active', // Sync is_active with status
    })
    .eq('id', businessId)

  if (error) {
    return { success: false, message: `Failed to update business: ${error.message}` }
  }

  return {
    success: true,
    message: `Business "${name}" updated successfully`,
  }
}
