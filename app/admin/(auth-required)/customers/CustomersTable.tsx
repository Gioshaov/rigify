'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { formatTbilisi } from '@/lib/utils/datetime';
import { useState, useTransition, useRef } from 'react';
import { suspendCustomer, activateCustomer, deleteCustomer } from './actions';
import { Ban, CheckCircle, Trash2 } from 'lucide-react';

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  bookingCount: number;
  lastBooking: string | null;
};

interface CustomersTableProps {
  customers: Customer[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  selectedStatus: string;
  searchQuery: string;
}

export function CustomersTable({
  customers,
  currentPage,
  totalPages,
  totalCount,
  selectedStatus,
  searchQuery,
}: CustomersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page'); // Reset to page 1 on filter change
    router.push(`/admin/customers?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/customers?${params.toString()}`);
  };

  const handleSuspend = async (customerId: string, customerName: string) => {
    if (!confirm(`Suspend customer ${customerName}? They will not be able to make new bookings.`)) {
      return;
    }

    setActionInProgress(customerId);
    startTransition(async () => {
      const result = await suspendCustomer(customerId, customerName);
      setActionInProgress(null);

      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleActivate = async (customerId: string, customerName: string) => {
    if (!confirm(`Activate customer ${customerName}?`)) {
      return;
    }

    setActionInProgress(customerId);
    startTransition(async () => {
      const result = await activateCustomer(customerId, customerName);
      setActionInProgress(null);

      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleDelete = async (customerId: string, customerName: string) => {
    if (!confirm(`Delete customer ${customerName}? This will also delete all their bookings. This action cannot be undone.`)) {
      return;
    }

    setActionInProgress(customerId);
    startTransition(async () => {
      const result = await deleteCustomer(customerId, customerName);
      setActionInProgress(null);

      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1">
          <label htmlFor="search-input" className="block text-xs font-medium text-[#888888] mb-2 uppercase tracking-wide">
            Search
          </label>
          <input
            id="search-input"
            type="text"
            placeholder="Search by name, email, or phone..."
            defaultValue={searchQuery}
            data-testid="customers-search-input"
            onChange={(e) => {
              const value = e.target.value;
              if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
              }
              searchTimerRef.current = setTimeout(() => updateFilter('search', value), 500);
            }}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-2 text-white text-sm"
          />
        </div>

        <div>
          <label htmlFor="status-filter" className="block text-xs font-medium text-[#888888] mb-2 uppercase tracking-wide">
            Status
          </label>
          <select
            id="status-filter"
            value={selectedStatus}
            onChange={(e) => updateFilter('status', e.target.value)}
            data-testid="customers-status-filter"
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-2 text-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div className="ml-auto text-[#888888] text-sm self-end pb-2">
          Showing {customers.length} of {totalCount} customers
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Contact
                </th>
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Bookings
                </th>
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Last Booking
                </th>
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Joined
                </th>
                <th className="text-right py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#888888]">
                    No customers found
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    data-testid={`customer-row-${customer.id}`}
                    className="border-b border-[#222222] hover:bg-[#222222]"
                  >
                    <td className="py-3 px-4 text-[#cccccc] font-medium">
                      {customer.name}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[#cccccc] text-xs">
                        <div>{customer.email}</div>
                        <div className="text-[#888888] mt-0.5">{customer.phone}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {customer.status === 'active' ? (
                        <span className="inline-block bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] text-[#22c55e] text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-sm">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-sm">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#cccccc] font-mono">
                      {customer.bookingCount}
                    </td>
                    <td className="py-3 px-4 text-[#888888] text-xs font-mono">
                      {customer.lastBooking
                        ? formatTbilisi(customer.lastBooking, 'yyyy-MM-dd')
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-[#888888] text-xs font-mono">
                      {formatTbilisi(customer.created_at, 'yyyy-MM-dd')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-3">
                        {customer.status === 'active' ? (
                          <button
                            onClick={() => handleSuspend(customer.id, customer.name)}
                            disabled={actionInProgress === customer.id || isPending}
                            data-testid={`customer-suspend-${customer.id}`}
                            className="text-[#555555] hover:text-[#ef4444] transition-colors disabled:opacity-50"
                            title="Suspend customer"
                            aria-label={`Suspend ${customer.name}`}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(customer.id, customer.name)}
                            disabled={actionInProgress === customer.id || isPending}
                            data-testid={`customer-activate-${customer.id}`}
                            className="text-[#555555] hover:text-[#22c55e] transition-colors disabled:opacity-50"
                            title="Activate customer"
                            aria-label={`Activate ${customer.name}`}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(customer.id, customer.name)}
                          disabled={actionInProgress === customer.id || isPending}
                          data-testid={`customer-delete-${customer.id}`}
                          className="text-[#555555] hover:text-[#ef4444] transition-colors disabled:opacity-50"
                          title="Delete customer"
                          aria-label={`Delete ${customer.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
              data-testid="customers-prev-page"
              className="px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#222222]"
            >
              Previous
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              data-testid="customers-next-page"
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
