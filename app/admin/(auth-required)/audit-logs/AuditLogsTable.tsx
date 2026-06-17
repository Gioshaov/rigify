'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { formatTbilisi } from '@/lib/utils/datetime';

type AuditLog = {
  id: string;
  admin_user_id: string | null;
  admin_email: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  resource_name: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

interface AuditLogsTableProps {
  logs: AuditLog[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  selectedAction: string;
  selectedResource: string;
}

const ACTIONS = [
  { value: 'all', label: 'ALL' },
  { value: 'create', label: 'CREATE' },
  { value: 'update', label: 'UPDATE' },
  { value: 'delete', label: 'DELETE' },
  { value: 'suspend', label: 'SUSPEND' },
  { value: 'restore', label: 'RESTORE' },
  { value: 'activate', label: 'ACTIVATE' },
  { value: 'deactivate', label: 'DEACTIVATE' },
  { value: 'login', label: 'LOGIN' },
  { value: 'logout', label: 'LOGOUT' },
];

const RESOURCE_TYPES = [
  { value: 'all', label: 'ALL' },
  { value: 'business', label: 'BUSINESS' },
  { value: 'customer', label: 'CUSTOMER' },
  { value: 'staff', label: 'STAFF' },
  { value: 'booking', label: 'BOOKING' },
  { value: 'service', label: 'SERVICE' },
  { value: 'review', label: 'REVIEW' },
  { value: 'admin', label: 'ADMIN' },
  { value: 'subscription', label: 'SUBSCRIPTION' },
  { value: 'settings', label: 'SETTINGS' },
];

export function AuditLogsTable({
  logs,
  currentPage,
  totalPages,
  totalCount,
  selectedAction,
  selectedResource,
}: AuditLogsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page');
    router.push(`/admin/audit-logs?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/audit-logs?${params.toString()}`);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-[#22c55e]';
      case 'update':
        return 'text-[#3b82f6]';
      case 'delete':
        return 'text-[#ef4444]';
      case 'suspend':
      case 'deactivate':
        return 'text-[#f59e0b]';
      case 'restore':
      case 'activate':
        return 'text-[#22c55e]';
      case 'login':
        return 'text-[#a855f7]';
      default:
        return 'text-[#6b6880]';
    }
  };

  return (
    <div>
      {/* Filter Bar */}
      <div className="border-b border-[rgba(255,255,255,0.06)] px-8 py-4 bg-[#111111]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Action Filter */}
            <select
              id="action-filter"
              value={selectedAction}
              onChange={(e) => updateFilter('action', e.target.value)}
              data-testid="audit-log-action-filter"
              className="h-9 px-4 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs uppercase rounded-none appearance-none cursor-pointer hover:border-[rgba(255,255,255,0.2)] transition-colors"
              style={{ paddingRight: '2rem', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236b6880\' d=\'M6 8L2 4h8z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
            >
              {ACTIONS.map((action) => (
                <option key={action.value} value={action.value}>
                  ACTION: {action.label}
                </option>
              ))}
            </select>

            {/* Resource Filter */}
            <select
              id="resource-filter"
              value={selectedResource}
              onChange={(e) => updateFilter('resource', e.target.value)}
              data-testid="audit-log-resource-filter"
              className="h-9 px-4 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs uppercase rounded-none appearance-none cursor-pointer hover:border-[rgba(255,255,255,0.2)] transition-colors"
              style={{ paddingRight: '2rem', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236b6880\' d=\'M6 8L2 4h8z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
            >
              {RESOURCE_TYPES.map((resource) => (
                <option key={resource.value} value={resource.value}>
                  RESOURCE: {resource.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
            Showing {logs.length} of {totalCount} logs
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="px-8 py-3 border-b border-[rgba(255,255,255,0.06)] grid grid-cols-[1.5fr_2fr_1fr_1.5fr_2fr_1fr] gap-4">
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Timestamp
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Admin
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Action
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Resource
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Details
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          IP Address
        </div>
      </div>

      {/* Log Rows */}
      <div>
        {logs.length === 0 ? (
          <div className="px-8 py-12 text-center text-[#6b6880] font-mono text-sm">
            No audit logs found
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              data-testid={`audit-log-row-${log.id}`}
              className="relative px-8 py-4 bg-[#111111] border-b border-[rgba(255,255,255,0.06)] hover:bg-[#1a1a1a] hover:border-l-[1px] hover:border-l-[#d4a843] transition-all grid grid-cols-[1.5fr_2fr_1fr_1.5fr_2fr_1fr] gap-4 items-center min-h-[64px]"
            >
              {/* Timestamp */}
              <div className="text-white font-mono text-[11px]">
                {formatTbilisi(log.created_at, 'yyyy-MM-dd HH:mm:ss')}
              </div>

              {/* Admin */}
              <div className="text-white text-[11px]">
                {log.admin_email}
              </div>

              {/* Action */}
              <div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-[5px] h-[5px] rounded-full ${
                      log.action === 'create' || log.action === 'restore' || log.action === 'activate' ? 'bg-[#22c55e]' :
                      log.action === 'update' ? 'bg-[#3b82f6]' :
                      log.action === 'delete' ? 'bg-[#ef4444]' :
                      log.action === 'suspend' || log.action === 'deactivate' ? 'bg-[#f59e0b]' :
                      log.action === 'login' ? 'bg-[#a855f7]' :
                      'bg-[#6b6880]'
                    }`}
                  />
                  <span className={`font-mono text-[11px] uppercase tracking-wider ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                </div>
              </div>

              {/* Resource */}
              <div>
                <div className="text-white font-mono text-[11px] uppercase">
                  {log.resource_type}
                </div>
                {log.resource_name && (
                  <div className="text-[#6b6880] text-[11px] mt-1">
                    {log.resource_name}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="text-[#6b6880] text-xs max-w-xs">
                {log.details ? (
                  <details className="cursor-pointer">
                    <summary className="hover:text-white font-mono text-[11px] transition-colors">
                      View details
                    </summary>
                    <pre className="mt-2 p-2 bg-[#0a0a0a] border border-[rgba(255,255,255,0.06)] rounded-sm text-[10px] overflow-auto max-h-32 font-mono">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </details>
                ) : (
                  <span className="text-[#6b6880]">—</span>
                )}
              </div>

              {/* IP Address */}
              <div className="text-[#6b6880] font-mono text-[11px]">
                {log.ip_address || '—'}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 px-8 flex items-center justify-between">
          <div className="text-[#6b6880] font-mono text-[11px]">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              data-testid="audit-log-prev-page"
              className="h-9 px-4 border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs uppercase rounded-none hover:border-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              data-testid="audit-log-next-page"
              className="h-9 px-4 border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs uppercase rounded-none hover:border-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
