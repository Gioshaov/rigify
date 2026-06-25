'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const VALID_CATEGORIES = ['hair', 'nails', 'skin', 'massage', 'brows', 'makeup', 'barber']

type ServiceResult = { success: boolean; message: string }

async function requireSuperAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return !!user && user.app_metadata?.is_super_admin === true
}

function parseServiceForm(formData: FormData):
  | { ok: true; values: { name: string; name_ka: string | null; category: string | null; duration_minutes: number; price_min: number; price_max: number | null } }
  | { ok: false; message: string } {
  const name = (formData.get('name') as string)?.trim()
  const nameKa = (formData.get('name_ka') as string)?.trim() || null
  const categoryRaw = (formData.get('category') as string)?.trim() || ''
  const category = categoryRaw === '' ? null : categoryRaw
  const duration = parseInt(formData.get('duration_minutes') as string, 10)
  const priceMin = parseFloat(formData.get('price_min') as string)
  const priceMaxRaw = (formData.get('price_max') as string)?.trim() || ''
  const priceMax = priceMaxRaw === '' ? null : parseFloat(priceMaxRaw)

  if (!name) return { ok: false, message: 'Service name is required' }
  if (isNaN(duration) || duration <= 0) return { ok: false, message: 'Duration must be a positive number' }
  if (isNaN(priceMin) || priceMin < 0) return { ok: false, message: 'Price from must be 0 or more' }
  if (priceMax !== null && (isNaN(priceMax) || priceMax < priceMin)) return { ok: false, message: 'Price to must be greater than or equal to price from' }
  if (category && !VALID_CATEGORIES.includes(category)) return { ok: false, message: 'Invalid category' }

  return { ok: true, values: { name, name_ka: nameKa, category, duration_minutes: duration, price_min: priceMin, price_max: priceMax } }
}

export async function createServiceAdmin(businessId: string, formData: FormData): Promise<ServiceResult> {
  if (!await requireSuperAdmin()) return { success: false, message: 'Unauthorized' }

  const parsed = parseServiceForm(formData)
  if (!parsed.ok) return { success: false, message: parsed.message }

  const admin = createAdminClient()
  const { error } = await admin.from('services').insert({ business_id: businessId, is_active: true, ...parsed.values })
  if (error) return { success: false, message: `Could not create service: ${error.message}` }

  revalidatePath(`/admin/businesses/${businessId}/edit`)
  revalidatePath('/businesses')
  return { success: true, message: 'Service added' }
}

export async function updateServiceAdmin(serviceId: string, formData: FormData): Promise<ServiceResult> {
  if (!await requireSuperAdmin()) return { success: false, message: 'Unauthorized' }

  const parsed = parseServiceForm(formData)
  if (!parsed.ok) return { success: false, message: parsed.message }

  const isActive = formData.get('is_active') === 'true'
  const admin = createAdminClient()
  const { data: updated, error } = await admin
    .from('services')
    .update({ ...parsed.values, is_active: isActive })
    .eq('id', serviceId)
    .select('business_id')
    .single()
  if (error) return { success: false, message: `Could not update service: ${error.message}` }

  if (updated?.business_id) revalidatePath(`/admin/businesses/${updated.business_id}/edit`)
  revalidatePath('/businesses')
  return { success: true, message: 'Service updated' }
}

export async function deleteServiceAdmin(serviceId: string): Promise<ServiceResult> {
  if (!await requireSuperAdmin()) return { success: false, message: 'Unauthorized' }

  const admin = createAdminClient()
  // Delete + return business_id in one round-trip (atomic, no stale pre-read).
  const { data: deleted, error } = await admin
    .from('services')
    .delete()
    .eq('id', serviceId)
    .select('business_id')
    .single()
  if (error) {
    // bookings.service_id is ON DELETE NO ACTION, so a service with bookings
    // can't be hard-deleted — guide the admin to deactivate instead.
    if (error.code === '23503') {
      return { success: false, message: 'This service has bookings and cannot be deleted. Set it inactive instead.' }
    }
    return { success: false, message: `Could not delete service: ${error.message}` }
  }

  if (deleted?.business_id) revalidatePath(`/admin/businesses/${deleted.business_id}/edit`)
  revalidatePath('/businesses')
  return { success: true, message: 'Service deleted' }
}
