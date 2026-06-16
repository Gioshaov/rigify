import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Shield, LayoutGrid, Users, Calendar } from 'lucide-react';
import { AdminsTable } from './AdminsTable';

export default async function AdminsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    redirect('/admin/login');
  }

  // Fetch all super admin users
  const admin = createAdminClient();
  const { data: { users }, error } = await admin.auth.admin.listUsers();

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
    <div className="min-h-screen flex bg-[#0a0a0a]">
      {/* SIDEBAR */}
      <aside className="w-60 bg-[#111111] flex-shrink-0 fixed h-screen">
        <div className="pt-8 pb-8 px-5">
          <h1 className="text-[#d4a843] text-xl font-bold uppercase tracking-widest">
            RIGIFY
          </h1>
          <p className="text-[#888888] text-[11px] uppercase tracking-widest mt-1">
            SUPER ADMIN
          </p>
        </div>

        <nav className="space-y-1">
          <Link
            href="/admin"
            data-testid="nav-dashboard"
            className="w-full flex items-center gap-3 px-5 py-3 text-sm uppercase tracking-wider transition-colors text-[#888888] hover:bg-[#1a1a1a] hover:text-white border-l-2 border-transparent"
          >
            <LayoutGrid className="w-4 h-4" />
            Dashboard
          </Link>

          <Link
            href="/admin/customers"
            data-testid="nav-customers"
            className="w-full flex items-center gap-3 px-5 py-3 text-sm uppercase tracking-wider transition-colors text-[#888888] hover:bg-[#1a1a1a] hover:text-white border-l-2 border-transparent"
          >
            <Users className="w-4 h-4" />
            Customers
          </Link>

          <Link
            href="/admin/bookings"
            data-testid="nav-bookings"
            className="w-full flex items-center gap-3 px-5 py-3 text-sm uppercase tracking-wider transition-colors text-[#888888] hover:bg-[#1a1a1a] hover:text-white border-l-2 border-transparent"
          >
            <Calendar className="w-4 h-4" />
            Bookings
          </Link>

          <Link
            href="/admin/admins"
            data-testid="nav-admins"
            className="w-full flex items-center gap-3 px-5 py-3 text-sm uppercase tracking-wider transition-colors bg-[#1a1a1a] text-white border-l-2 border-[#d4a843]"
          >
            <Shield className="w-4 h-4" />
            Admins
          </Link>

          <Link
            href="/admin/audit-logs"
            data-testid="nav-audit-logs"
            className="w-full flex items-center gap-3 px-5 py-3 text-sm uppercase tracking-wider transition-colors text-[#888888] hover:bg-[#1a1a1a] hover:text-white border-l-2 border-transparent"
          >
            <Users className="w-4 h-4" />
            Audit Logs
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-60 overflow-y-auto">
        {/* TOP BAR */}
        <header className="h-14 bg-[#111111] border-b border-[#2a2a2a] flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">Admin Management</h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#888888] text-sm">
              {superAdmins.length} super admin{superAdmins.length !== 1 ? 's' : ''}
            </span>
          </div>
        </header>

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
