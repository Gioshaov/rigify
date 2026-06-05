import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BookingPageClient } from "./BookingPageClient"
import type { Service, Staff } from "@/lib/types/booking"

type PageProps = {
  params: { slug: string }
  searchParams: { service?: string }
}

type CustomerInfo = {
  name: string
  phone: string
  email: string
} | null

export default async function BookingPage({ params, searchParams }: PageProps) {
  const supabase = createClient()

  // Fetch business with specific fields only
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id, name, slug, category, address, city, district, phone')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (businessError || !business) {
    redirect('/businesses')
  }

  // Fetch active services
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('id, business_id, name, duration_minutes, price, description, is_active')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('name')

  if (servicesError) {
    console.error('Services fetch error:', servicesError)
  }

  // Fetch active staff
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('id, business_id, name, specialty, is_active')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('name')

  if (staffError) {
    console.error('Staff fetch error:', staffError)
  }

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  let customerInfo: CustomerInfo = null

  if (user) {
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('name, phone, email')
      .eq('id', user.id)
      .maybeSingle()

    if (customerError) {
      console.error('Customer fetch error:', customerError)
    } else {
      customerInfo = customer
    }
  }

  return (
    <BookingPageClient
      business={business}
      services={(services as Service[]) || []}
      staff={(staff as Staff[]) || []}
      customerInfo={customerInfo}
      isLoggedIn={!!user}
    />
  )
}
