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
  details: any;
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
  'all',
  'create',
  'update',
  'delete',
  'suspend',
  'restore',
  'activate',
  'deactivate',
  'login',
  'logout',
];

const RESOURCE_TYPES = [
  'all',
  'business',
  'customer',
  'staff',
  'booking',
  'service',
  'review',
  'admin',
  'subscription',
  'settings',
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
    params.delete('page'); // Reset to page 1 on filter change
    router.push(`/admin/audit-logs?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/audit-logs?${params.toString()}`);
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-900/20 border-green-800 text-green-300';
      case 'update':
        return 'bg-blue-900/20 border-blue-800 text-blue-300';
      case 'delete':
        return 'bg-red-900/20 border-red-800 text-red-300';
      case 'suspend':
      case 'deactivate':
        return 'bg-orange-900/20 border-orange-800 text-orange-300';
      case 'restore':
      case 'activate':
        return 'bg-green-900/20 border-green-800 text-green-300';
      case 'login':
        return 'bg-purple-900/20 border-purple-800 text-purple-300';
      default:
        return 'bg-gray-900/20 border-gray-800 text-gray-300';
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div>
          <label htmlFor="action-filter" className="block text-xs font-medium text-[#888888] mb-2 uppercase tracking-wide">
            Action
          </label>
          <select
            id="action-filter"
            value={selectedAction}
            onChange={(e) => updateFilter('action', e.target.value)}
            data-testid="audit-log-action-filter"
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-2 text-white text-sm"
          >
            {ACTIONS.map((action) => (
              <option key={action} value={action}>
                {action === 'all' ? 'All Actions' : action.charAt(0).toUpperCase() + action.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="resource-filter" className="block text-xs font-medium text-[#888888] mb-2 uppercase tracking-wide">
            Resource Type
          </label>
          <select
            id="resource-filter"
            value={selectedResource}
            onChange={(e) => updateFilter('resource', e.target.value)}
            data-testid="audit-log-resource-filter"
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-2 text-white text-sm"
          >
            {RESOURCE_TYPES.map((resource) => (
              <option key={resource} value={resource}>
                {resource === 'all' ? 'All Resources' : resource.charAt(0).toUpperCase() + resource.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-[#888888] text-sm">
          Showing {logs.length} of {totalCount} logs
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Timestamp
                </th>
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Admin
                </th>
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Action
                </th>
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Resource
                </th>
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Details
                </th>
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#888888]">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    data-testid={`audit-log-row-${log.id}`}
                    className="border-b border-[#222222] hover:bg-[#222222]"
                  >
                    <td className="py-3 px-4 text-[#cccccc] font-mono text-xs">
                      {formatTbilisi(log.created_at, 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="py-3 px-4 text-[#cccccc]">
                      {log.admin_email}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-[10px] uppercase tracking-wider border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[#cccccc]">
                        <div className="font-medium">{log.resource_type}</div>
                        {log.resource_name && (
                          <div className="text-xs text-[#888888] mt-0.5">
                            {log.resource_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#888888] text-xs max-w-xs">
                      {log.details ? (
                        <details className="cursor-pointer">
                          <summary className="hover:text-[#cccccc]">
                            View details
                          </summary>
                          <pre className="mt-2 p-2 bg-[#0a0a0a] rounded text-[10px] overflow-auto max-h-32">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-[#555555]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#888888] font-mono text-xs">
                      {log.ip_address || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-[#888888] text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              data-testid="audit-log-prev-page"
              className="px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#222222]"
            >
              Previous
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              data-testid="audit-log-next-page"
              className="px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#222222]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
