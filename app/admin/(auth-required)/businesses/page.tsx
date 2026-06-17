import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
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
    // Show error state instead of empty table
    return (
      <div className="min-h-screen flex bg-[#0a0a0a]">
        <AdminSidebar />
        <main className="flex-1 ml-60 overflow-y-auto">
          <AdminTopBar title="Business Management" />
          <div className="p-8">
            <div className="bg-red-900/20 border border-red-900/50 rounded p-6 text-center">
              <p className="text-red-400 text-lg font-semibold mb-2">
                Failed to load businesses
              </p>
              <p className="text-red-300 text-sm mb-4">
                {error.message || 'An unexpected error occurred'}
              </p>
              <Link
                href="/admin"
                className="inline-block bg-[#d4a843] text-black font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded hover:brightness-110 transition-all"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
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
          action={
            <Link
              href="/admin/onboard"
              data-testid="new-business-btn"
              className="bg-[#d4a843] text-black font-bold uppercase tracking-wider text-xs px-5 py-2.5 rounded hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Business
            </Link>
          }
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
