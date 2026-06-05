import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ServicesPageContent } from '@/components/dashboard/ServicesPageContent'

export default async function ServicesPage() {
  const supabase = createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get business
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user.id)
    .single()

  if (!business) {
    redirect('/dashboard')
  }

  // Get services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', business.id)
    .order('name')

  return <ServicesPageContent businessId={business.id} services={services || []} />
}
