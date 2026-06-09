import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NewServiceForm } from './NewServiceForm';

export default async function NewServicePage() {
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

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-12">
        <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-muted-gold uppercase mb-2">
          MANAGEMENT PORTAL
        </p>
        <h1 className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold text-primary mb-3">
          Add New Service
        </h1>
        <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
          Create a new service for {business.name}
        </p>
      </div>

      {/* Form */}
      <NewServiceForm businessId={business.id} />
    </div>
  );
}
