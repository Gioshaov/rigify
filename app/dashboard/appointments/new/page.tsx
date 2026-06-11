import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateAppointmentClient } from "./CreateAppointmentClient";

export const dynamic = 'force-dynamic';

export default async function NewAppointmentPage() {
  const supabase = createClient();

  // Check auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // Fetch business
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user.id)
    .single();

  if (!business) {
    redirect('/dashboard');
  }

  // Fetch active services
  const { data: services } = await supabase
    .from('services')
    .select('id, name, duration_minutes, price_min, price_max')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('name', { ascending: true });

  // Fetch active staff
  const { data: staff } = await supabase
    .from('staff')
    .select('id, name, specialty')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('name', { ascending: true });

  return (
    <CreateAppointmentClient
      businessId={business.id}
      services={services || []}
      staff={staff || []}
    />
  );
}
