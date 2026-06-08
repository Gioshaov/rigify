import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { EditServiceForm } from "@/components/dashboard/EditServiceForm";

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Get business
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user.id)
    .single();

  if (!business) {
    redirect('/dashboard');
  }

  // Get service
  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', params.id)
    .eq('business_id', business.id)
    .single();

  if (!service) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-12">
        <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-muted-gold uppercase mb-2">
          MANAGEMENT PORTAL
        </p>
        <h1 className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold text-primary mb-3">
          Edit Service
        </h1>
        <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
          Update service details and pricing
        </p>
      </div>

      {/* Edit Form */}
      <EditServiceForm service={service} businessId={business.id} />
    </div>
  );
}
