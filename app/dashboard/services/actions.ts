'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createService(businessId: string, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Not authenticated' }
  }

  // Verify business ownership
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('owner_id', user.id)
    .single()

  if (!business) {
    return { success: false, message: 'Unauthorized' }
  }

  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const price = parseFloat(formData.get('price') as string)
  const durationMinutes = parseInt(formData.get('duration_minutes') as string)
  const categoryInput = (formData.get('category') as string)?.trim()
  const customCategory = (formData.get('custom_category') as string)?.trim()

  // Determine final category value
  const category = categoryInput === 'other' ? customCategory : categoryInput

  // Validate
  if (!name) {
    return { success: false, message: 'Service name is required' }
  }

  if (!category) {
    return { success: false, message: 'Category is required' }
  }

  if (isNaN(price) || price < 0) {
    return { success: false, message: 'Valid price is required' }
  }

  if (isNaN(durationMinutes) || durationMinutes < 15) {
    return { success: false, message: 'Duration must be at least 15 minutes' }
  }

  if (durationMinutes % 15 !== 0) {
    return { success: false, message: 'Duration must be in 15-minute increments' }
  }

  // Create service
  const admin = createAdminClient()
  const { error } = await admin
    .from('services')
    .insert({
      business_id: businessId,
      name,
      description,
      category,
      price,
      price_min: price, // Set price_min to same as price
      duration_minutes: durationMinutes,
      is_active: true
    })

  if (error) {
    return { success: false, message: `Failed to create service: ${error.message}` }
  }

  revalidatePath('/dashboard/services')

  return { success: true, message: 'Service created successfully' }
}

export async function updateService(serviceId: string, formData: FormData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Not authenticated' }
  }

  // Verify ownership
  const { data: service } = await supabase
    .from('services')
    .select('business_id, businesses!inner(owner_id)')
    .eq('id', serviceId)
    .single()

  if (!service || (service.businesses as any).owner_id !== user.id) {
    return { success: false, message: 'Unauthorized' }
  }

  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const price = parseFloat(formData.get('price') as string)
  const durationMinutes = parseInt(formData.get('duration_minutes') as string)
  const isActive = formData.get('is_active') === 'on'
  const categoryInput = (formData.get('category') as string)?.trim()
  const customCategory = (formData.get('custom_category') as string)?.trim()

  // Determine final category value
  const category = categoryInput === 'other' ? customCategory : categoryInput

  // Validate
  if (!name) {
    return { success: false, message: 'Service name is required' }
  }

  if (!category) {
    return { success: false, message: 'Category is required' }
  }

  if (isNaN(price) || price < 0) {
    return { success: false, message: 'Valid price is required' }
  }

  if (isNaN(durationMinutes) || durationMinutes < 15) {
    return { success: false, message: 'Duration must be at least 15 minutes' }
  }

  if (durationMinutes % 15 !== 0) {
    return { success: false, message: 'Duration must be in 15-minute increments' }
  }

  // Update service
  const admin = createAdminClient()
  const { error } = await admin
    .from('services')
    .update({
      name,
      description,
      category,
      price,
      price_min: price, // Keep price_min in sync with price
      duration_minutes: durationMinutes,
      is_active: isActive
    })
    .eq('id', serviceId)

  if (error) {
    return { success: false, message: `Failed to update service: ${error.message}` }
  }

  revalidatePath('/dashboard/services')

  return { success: true, message: 'Service updated successfully' }
}

export async function deleteService(serviceId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: 'Not authenticated' }
  }

  // Verify ownership
  const { data: service } = await supabase
    .from('services')
    .select('business_id, businesses!inner(owner_id)')
    .eq('id', serviceId)
    .single()

  if (!service || (service.businesses as any).owner_id !== user.id) {
    return { success: false, message: 'Unauthorized' }
  }

  // Check if service has any bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id')
    .eq('service_id', serviceId)
    .limit(1)

  if (bookings && bookings.length > 0) {
    return {
      success: false,
      message: 'Cannot delete service with existing bookings. Mark as inactive instead.'
    }
  }

  // Delete service
  const admin = createAdminClient()
  const { error } = await admin
    .from('services')
    .delete()
    .eq('id', serviceId)

  if (error) {
    return { success: false, message: `Failed to delete service: ${error.message}` }
  }

  revalidatePath('/dashboard/services')

  return { success: true, message: 'Service deleted successfully' }
}
