'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatTbilisi } from '@/lib/utils/datetime';
import { useState, useTransition, useRef, useEffect } from 'react';
import { updateCustomerStatus, deleteCustomer } from './actions';
import { Ban, CheckCircle, Trash2 } from 'lucide-react';
import { useConfirm } from '@/lib/contexts/ConfirmContext';

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
  const confirm = useConfirm();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page');
    router.push(`/admin/customers?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/customers?${params.toString()}`);
  };

  const handleSuspend = async (customerId: string, customerName: string) => {
    if (!(await confirm({
      title: `Suspend customer ${customerName}?`,
      message: 'They will not be able to make new bookings.',
      confirmLabel: 'Suspend',
      destructive: true,
      testId: 'suspend-customer',
    }))) {
      return;
    }

    setActionInProgress(customerId);
    startTransition(async () => {
      const result = await updateCustomerStatus(customerId, 'suspended', customerName);
      setActionInProgress(null);

      if (!result.success) {
        alert(result.message);
      } else {
        router.refresh();
      }
    });
  };

  const handleActivate = async (customerId: string, customerName: string) => {
    if (!(await confirm({
      title: `Activate customer ${customerName}?`,
      confirmLabel: 'Activate',
      testId: 'activate-customer',
    }))) {
      return;
    }

    setActionInProgress(customerId);
    startTransition(async () => {
      const result = await updateCustomerStatus(customerId, 'active', customerName);
      setActionInProgress(null);

      if (!result.success) {
        alert(result.message);
      } else {
        router.refresh();
      }
    });
  };

  const handleDelete = async (customerId: string, customerName: string) => {
    if (!(await confirm({
      title: `Delete customer ${customerName}?`,
      message: 'This will also delete all their bookings. This action cannot be undone.',
      confirmLabel: 'Delete',
      destructive: true,
      testId: 'delete-customer',
    }))) {
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
      {/* Filter Bar */}
      <div className="border-b border-[rgba(255,255,255,0.06)] px-8 py-4 bg-[#111111]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="w-80">
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
                className="w-full h-9 px-4 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs rounded-none placeholder:text-[#6b6880] focus:outline-none focus:border-[#d4a843] transition-colors"
              />
            </div>

            {/* Status Filter */}
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => updateFilter('status', e.target.value)}
              data-testid="customers-status-filter"
              className="h-9 px-4 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs uppercase rounded-none appearance-none cursor-pointer hover:border-[rgba(255,255,255,0.2)] transition-colors"
              style={{ paddingRight: '2rem', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236b6880\' d=\'M6 8L2 4h8z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
            >
              <option value="all">STATUS: ALL</option>
              <option value="active">STATUS: ACTIVE</option>
              <option value="suspended">STATUS: SUSPENDED</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
            Showing {customers.length} of {totalCount} customers
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="px-8 py-3 border-b border-[rgba(255,255,255,0.06)] grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_160px] gap-4">
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Name
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Contact
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Status
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Bookings
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Last Booking
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Joined
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider text-right">
          Actions
        </div>
      </div>

      {/* Customer Rows */}
      <div>
        {customers.length === 0 ? (
          <div className="px-8 py-12 text-center text-[#6b6880] font-mono text-sm">
            No customers found
          </div>
        ) : (
          customers.map((customer) => (
            <div
              key={customer.id}
              data-testid={`customer-row-${customer.id}`}
              className="relative px-8 py-4 bg-[#111111] border-b border-[rgba(255,255,255,0.06)] hover:bg-[#1a1a1a] hover:border-l-[1px] hover:border-l-[#d4a843] transition-all grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_160px] gap-4 items-center min-h-[64px]"
            >
              {/* Name */}
              <div>
                <div className="text-white text-[15px] font-medium">
                  {customer.name}
                </div>
              </div>

              {/* Contact */}
              <div>
                <div className="text-white font-mono text-[11px]">
                  {customer.email}
                </div>
                <div className="text-[#6b6880] font-mono text-[11px] mt-1">
                  {customer.phone}
                </div>
              </div>

              {/* Status */}
              <div>
                <div className="flex items-center gap-2" data-testid={`customer-status-${customer.id}`}>
                  <div
                    className={`w-[5px] h-[5px] rounded-full ${
                      customer.status === 'active' ? 'bg-[#22c55e]' : 'bg-[#ef4444]'
                    }`}
                  />
                  <span className={`font-mono text-[11px] uppercase tracking-wider ${
                    customer.status === 'active' ? 'text-white' : 'text-[#ef4444]'
                  }`}>
                    {customer.status}
                  </span>
                </div>
              </div>

              {/* Bookings */}
              <div className="text-white font-mono text-[11px]">
                {customer.bookingCount}
              </div>

              {/* Last Booking */}
              <div className="text-[#6b6880] font-mono text-[11px]">
                {customer.lastBooking ? formatTbilisi(customer.lastBooking, 'yyyy-MM-dd') : '—'}
              </div>

              {/* Joined */}
              <div className="text-[#6b6880] font-mono text-[11px]">
                {formatTbilisi(customer.created_at, 'yyyy-MM-dd')}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="h-7 px-3 border border-[rgba(255,255,255,0.12)] text-primary hover:text-white hover:border-primary font-mono text-[11px] uppercase rounded-none transition-colors flex items-center"
                  data-testid={`customers-table-view-link-${customer.id}`}
                >
                  View
                </Link>
                {customer.status === 'active' ? (
                  <button
                    onClick={() => handleSuspend(customer.id, customer.name)}
                    disabled={actionInProgress === customer.id || isPending}
                    data-testid={`customer-suspend-${customer.id}`}
                    className="h-7 px-3 border border-[rgba(255,255,255,0.12)] text-[#6b6880] hover:text-[#ef4444] hover:border-[#ef4444] font-mono text-[11px] uppercase rounded-none transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Suspend customer"
                    aria-label={`Suspend ${customer.name}`}
                  >
                    <Ban className="w-3 h-3" />
                    Suspend
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivate(customer.id, customer.name)}
                    disabled={actionInProgress === customer.id || isPending}
                    data-testid={`customer-activate-${customer.id}`}
                    className="h-7 px-3 border border-[rgba(255,255,255,0.12)] text-[#6b6880] hover:text-[#22c55e] hover:border-[#22c55e] font-mono text-[11px] uppercase rounded-none transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Activate customer"
                    aria-label={`Activate ${customer.name}`}
                  >
                    <CheckCircle className="w-3 h-3" />
                    Activate
                  </button>
                )}
                <button
                  onClick={() => handleDelete(customer.id, customer.name)}
                  disabled={actionInProgress === customer.id || isPending}
                  data-testid={`customer-delete-${customer.id}`}
                  className="w-7 h-7 flex items-center justify-center text-[#6b6880] hover:text-[#ef4444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete customer"
                  aria-label={`Delete ${customer.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
              data-testid="customers-prev-page"
              className="h-9 px-4 border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs uppercase rounded-none hover:border-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              data-testid="customers-next-page"
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
