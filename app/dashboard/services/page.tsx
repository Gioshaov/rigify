import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ServicesContent } from '@/components/dashboard/ServicesContent'

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

  return (
    <div data-testid="services-page" className="max-w-7xl">
      {/* Header */}
      <div className="mb-12">
        <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-muted-gold uppercase mb-2">
          MANAGEMENT PORTAL
        </p>
        <h1 data-testid="services-page-title" className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold text-primary mb-3">
          Services
        </h1>
        <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
          Manage your services and pricing
        </p>
      </div>

      {/* Services Content */}
      <ServicesContent
        businessId={business.id}
        services={services || []}
      />
    </div>
  );
}
