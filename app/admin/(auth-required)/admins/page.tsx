import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminsTable } from './AdminsTable';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';

export default async function AdminsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    redirect('/admin/login');
  }

  // Fetch all super admin users (up to 1000)
  const admin = createAdminClient();
  const { data: { users }, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000 // Hard cap - loop through pages if more needed
  });

  if (error) {
    console.error('Failed to fetch users:', error);
  }

  // Filter for super admins only
  const superAdmins = (users || [])
    .filter(u => u.app_metadata?.is_super_admin === true)
    .map(u => ({
      id: u.id,
      email: u.email || '',
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at || null,
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="min-h-dvh flex bg-[#0a0a0a]">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-60 overflow-y-auto">
        {/* TOP BAR */}
        <AdminTopBar
          title="Admin Management"
          subtitle={`${superAdmins.length} super admin${superAdmins.length !== 1 ? 's' : ''}`}
        />

        {/* CONTENT */}
        <div className="p-8">
          <div className="mb-6">
            <p className="text-[#888888] text-sm">
              Manage super administrator accounts. Super admins have full access to the admin panel.
            </p>
          </div>

          <AdminsTable admins={superAdmins} currentUserId={user.id} />
        </div>
      </main>
    </div>
  );
}
