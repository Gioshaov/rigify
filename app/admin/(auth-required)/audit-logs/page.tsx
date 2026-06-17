import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AuditLogsTable } from './AuditLogsTable';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopBar } from '@/components/admin/AdminTopBar';

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: { action?: string; resource?: string; page?: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    redirect('/admin/login');
  }

  // Pagination
  const page = parseInt(searchParams.page || '1', 10);
  const pageSize = 50;
  const offset = (page - 1) * pageSize;

  // Build query
  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  // Filters
  if (searchParams.action && searchParams.action !== 'all') {
    query = query.eq('action', searchParams.action);
  }
  if (searchParams.resource && searchParams.resource !== 'all') {
    query = query.eq('resource_type', searchParams.resource);
  }

  const { data: logs, error, count } = await query;

  if (error) {
    console.error('Failed to fetch audit logs:', error);
  }

  const totalPages = count ? Math.ceil(count / pageSize) : 1;

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-60 overflow-y-auto">
        {/* TOP BAR */}
        <AdminTopBar
          title="Audit Logs"
          subtitle={`${count || 0} total entries`}
        />

        {/* CONTENT */}
        <div className="p-8">
          <div className="mb-6">
            <p className="text-[#888888] text-sm">
              Immutable record of all admin actions for security and compliance
            </p>
          </div>

          <AuditLogsTable
            logs={logs || []}
            currentPage={page}
            totalPages={totalPages}
            totalCount={count || 0}
            selectedAction={searchParams.action || 'all'}
            selectedResource={searchParams.resource || 'all'}
          />
        </div>
      </main>
    </div>
  );
}
