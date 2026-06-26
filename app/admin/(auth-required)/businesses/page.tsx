import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BusinessManagementClient } from './BusinessManagementClient';

export default async function BusinessesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    redirect('/admin/login');
  }

  // Fetch all businesses (client-side filtering)
  const { data: businesses, error, count } = await supabase
    .from('businesses')
    .select('id, name, subdomain, status, city, district, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch businesses:', error);
    return (
      <div className="min-h-dvh bg-[#0a0a0a] flex items-center justify-center p-8">
        <div className="max-w-md">
          <p className="text-red-400 text-lg font-semibold mb-2">
            Failed to load businesses
          </p>
          <p className="text-[#6b6880] text-sm">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return <BusinessManagementClient businesses={businesses || []} totalCount={count || 0} />;
}
