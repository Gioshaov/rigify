import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminBusinessTable } from '../AdminBusinessTable';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';

export default async function BusinessesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    redirect('/admin/login');
  }

  // Fetch all businesses (client-side filtering in AdminBusinessTable)
  const { data: businesses, error, count } = await supabase
    .from('businesses')
    .select('id, name, subdomain, status, city, district, created_at', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch businesses:', error);
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-60 overflow-y-auto">
        {/* TOP BAR */}
        <AdminTopBar
          title="Business Management"
          subtitle={`${count || 0} total businesses`}
          showNewBusinessButton={true}
        />

        {/* CONTENT */}
        <div className="p-8">
          {/* Businesses Table (includes built-in filters) */}
          <AdminBusinessTable businesses={businesses || []} />
        </div>
      </main>
    </div>
  );
}
