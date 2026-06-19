import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EditCustomerForm } from './EditCustomerForm';

export default async function EditCustomerPage({
  params,
}: {
  params: { id: string };
}) {
  // Verify super admin access
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    redirect('/admin/login');
  }

  // Use admin client to fetch customer data
  const admin = createAdminClient();

  const { data: customer, error: customerError } = await admin
    .from('customers')
    .select('*')
    .eq('id', params.id)
    .single();

  if (customerError || !customer) {
    redirect('/admin/customers');
  }

  return <EditCustomerForm customer={customer} />;
}
