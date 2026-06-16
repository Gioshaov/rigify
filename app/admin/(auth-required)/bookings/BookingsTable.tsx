'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { formatTbilisi } from '@/lib/utils/datetime';
import { useState, useTransition, useRef } from 'react';
import { cancelBooking, markNoShow } from './actions';
import { XCircle, UserX, Eye } from 'lucide-react';

type Booking = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  appointmentDatetime: string;
  durationMinutes: number;
  status: string;
  bookingSource: string;
  notes: string | null;
  price: number | null;
  createdAt: string;
  businessName: string;
  businessSubdomain: string | null;
  serviceName: string | null;
  staffName: string | null;
  isGuest: boolean;
};

interface BookingsTableProps {
  bookings: Booking[];
  businesses: { id: string; name: string }[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  selectedStatus: string;
  selectedSource: string;
  selectedBusiness: string;
  dateFrom: string;
  dateTo: string;
  searchQuery: string;
}

const STATUSES = [
  { value: 'all', label: 'All Status' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
];

const SOURCES = [
  { value: 'all', label: 'All Sources' },
  { value: 'web', label: 'Web' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'voice', label: 'Voice (Salome)' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
];

export function BookingsTable({
  bookings,
  businesses,
  currentPage,
  totalPages,
  totalCount,
  selectedStatus,
  selectedSource,
  selectedBusiness,
  dateFrom,
  dateTo,
  searchQuery,
}: BookingsTableProps) {
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
    router.push(`/admin/bookings?${params.toString()}`);
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/admin/bookings?${params.toString()}`);
  };

  const handleCancel = async (bookingId: string, booking: Booking) => {
    const appointmentTime = formatTbilisi(booking.appointmentDatetime, 'MMM d, yyyy HH:mm');
    if (!confirm(`Cancel booking for ${booking.customerName} at ${appointmentTime}?`)) {
      return;
    }

    setActionInProgress(bookingId);
    startTransition(async () => {
      const result = await cancelBooking(bookingId);
      setActionInProgress(null);

      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const handleNoShow = async (bookingId: string, booking: Booking) => {
    const appointmentTime = formatTbilisi(booking.appointmentDatetime, 'MMM d, yyyy HH:mm');
    if (!confirm(`Mark booking for ${booking.customerName} as no-show?`)) {
      return;
    }

    setActionInProgress(bookingId);
    startTransition(async () => {
      const result = await markNoShow(bookingId);
      setActionInProgress(null);

      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.3)] text-[#22c55e]';
      case 'completed':
        return 'bg-[rgba(59,130,246,0.1)] border-[rgba(59,130,246,0.3)] text-[#3b82f6]';
      case 'cancelled':
        return 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)] text-[#ef4444]';
      case 'no_show':
        return 'bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.3)] text-[#f59e0b]';
      default:
        return 'bg-[rgba(100,100,100,0.1)] border-[#444444] text-[#888888]';
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'web':
        return 'bg-[rgba(168,85,247,0.1)] border-[rgba(168,85,247,0.3)] text-[#a855f7]';
      case 'dashboard':
        return 'bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.3)] text-[#22c55e]';
      case 'voice':
        return 'bg-[rgba(212,168,67,0.1)] border-[rgba(212,168,67,0.3)] text-[#d4a843]';
      case 'instagram':
        return 'bg-[rgba(236,72,153,0.1)] border-[rgba(236,72,153,0.3)] text-[#ec4899]';
      case 'facebook':
        return 'bg-[rgba(59,130,246,0.1)] border-[rgba(59,130,246,0.3)] text-[#3b82f6]';
      default:
        return 'bg-[rgba(100,100,100,0.1)] border-[#444444] text-[#888888]';
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label htmlFor="search-input" className="block text-xs font-medium text-[#888888] mb-2 uppercase tracking-wide">
            Search
          </label>
          <input
            id="search-input"
            type="text"
            placeholder="Customer name, phone, business..."
            defaultValue={searchQuery}
            data-testid="bookings-search-input"
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
            data-testid="bookings-status-filter"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-2 text-white text-sm"
          >
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="source-filter" className="block text-xs font-medium text-[#888888] mb-2 uppercase tracking-wide">
            Source
          </label>
          <select
            id="source-filter"
            value={selectedSource}
            onChange={(e) => updateFilter('source', e.target.value)}
            data-testid="bookings-source-filter"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-2 text-white text-sm"
          >
            {SOURCES.map((source) => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="business-filter" className="block text-xs font-medium text-[#888888] mb-2 uppercase tracking-wide">
            Business
          </label>
          <select
            id="business-filter"
            value={selectedBusiness}
            onChange={(e) => updateFilter('business', e.target.value)}
            data-testid="bookings-business-filter"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-2 text-white text-sm"
          >
            <option value="all">All Businesses</option>
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date-from" className="block text-xs font-medium text-[#888888] mb-2 uppercase tracking-wide">
            From Date
          </label>
          <input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => updateFilter('dateFrom', e.target.value)}
            data-testid="bookings-date-from"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-2 text-white text-sm"
          />
        </div>

        <div>
          <label htmlFor="date-to" className="block text-xs font-medium text-[#888888] mb-2 uppercase tracking-wide">
            To Date
          </label>
          <input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => updateFilter('dateTo', e.target.value)}
            data-testid="bookings-date-to"
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-2 text-white text-sm"
          />
        </div>
      </div>

      <div className="mb-4 text-[#888888] text-sm">
        Showing {bookings.length} of {totalCount} bookings
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Business
                </th>
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Service / Staff
                </th>
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Appointment
                </th>
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Source
                </th>
                <th className="text-right py-3 px-4 text-[#888888] text-[11px] uppercase tracking-widest font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#888888]">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    data-testid={`booking-row-${booking.id}`}
                    className="border-b border-[#222222] hover:bg-[#222222]"
                  >
                    <td className="py-3 px-4">
                      <div className="text-[#cccccc] font-medium">{booking.customerName}</div>
                      <div className="text-[#888888] text-xs mt-0.5">{booking.customerPhone}</div>
                      {booking.isGuest && (
                        <span className="inline-block mt-1 text-[10px] text-[#888888] bg-[#2a2a2a] px-1.5 py-0.5 rounded">
                          GUEST
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#cccccc]">
                      {booking.businessName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[#cccccc]">{booking.serviceName || '—'}</div>
                      {booking.staffName && (
                        <div className="text-[#888888] text-xs mt-0.5">{booking.staffName}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[#cccccc] font-mono text-xs">
                        {formatTbilisi(booking.appointmentDatetime, 'MMM d, yyyy')}
                      </div>
                      <div className="text-[#888888] text-xs mt-0.5 font-mono">
                        {formatTbilisi(booking.appointmentDatetime, 'HH:mm')} ({booking.durationMinutes}min)
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block border text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-sm ${getStatusBadge(booking.status)}`}>
                        {booking.status === 'no_show' ? 'No Show' : booking.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block border text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-sm ${getSourceBadge(booking.bookingSource)}`}>
                        {booking.bookingSource}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-3">
                        {booking.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleCancel(booking.id, booking)}
                              disabled={actionInProgress === booking.id || isPending}
                              data-testid={`booking-cancel-${booking.id}`}
                              className="text-[#555555] hover:text-[#ef4444] transition-colors disabled:opacity-50"
                              title="Cancel booking"
                              aria-label={`Cancel booking for ${booking.customerName}`}
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleNoShow(booking.id, booking)}
                              disabled={actionInProgress === booking.id || isPending}
                              data-testid={`booking-no-show-${booking.id}`}
                              className="text-[#555555] hover:text-[#f59e0b] transition-colors disabled:opacity-50"
                              title="Mark as no-show"
                              aria-label={`Mark ${booking.customerName} as no-show`}
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
              data-testid="bookings-prev-page"
              className="px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#222222]"
            >
              Previous
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              data-testid="bookings-next-page"
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
