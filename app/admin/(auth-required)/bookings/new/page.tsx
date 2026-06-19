import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CreateBookingWizard } from './CreateBookingWizard';

export default async function CreateBookingPage() {
  // Verify super admin access
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    redirect('/admin/login');
  }

  // Use admin client to fetch all businesses
  const admin = createAdminClient();

  const { data: businesses, error } = await admin
    .from('businesses')
    .select('id, name')
    .eq('status', 'active')
    .order('name');

  if (error) {
    console.error('Error fetching businesses:', error);
  }

  return <CreateBookingWizard businesses={businesses || []} />;
}
