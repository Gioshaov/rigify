'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { formatTbilisi } from '@/lib/utils/datetime';
import { useState, useTransition, useRef, useEffect } from 'react';
import { cancelBooking, markNoShow } from './actions';
import { XCircle, UserX } from 'lucide-react';

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
  { value: 'all', label: 'ALL' },
  { value: 'confirmed', label: 'CONFIRMED' },
  { value: 'completed', label: 'COMPLETED' },
  { value: 'cancelled', label: 'CANCELLED' },
  { value: 'no_show', label: 'NO SHOW' },
];

const SOURCES = [
  { value: 'all', label: 'ALL' },
  { value: 'web', label: 'WEB' },
  { value: 'dashboard', label: 'DASHBOARD' },
  { value: 'voice', label: 'VOICE (SALOME)' },
  { value: 'instagram', label: 'INSTAGRAM' },
  { value: 'facebook', label: 'FACEBOOK' },
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-[#22c55e]';
      case 'completed':
        return 'text-[#3b82f6]';
      case 'cancelled':
        return 'text-[#ef4444]';
      case 'no_show':
        return 'text-[#f59e0b]';
      default:
        return 'text-[#6b6880]';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'web':
        return 'text-[#a855f7]';
      case 'dashboard':
        return 'text-[#22c55e]';
      case 'voice':
        return 'text-[#d4a843]';
      case 'instagram':
        return 'text-[#ec4899]';
      case 'facebook':
        return 'text-[#3b82f6]';
      default:
        return 'text-[#6b6880]';
    }
  };

  return (
    <div>
      {/* Filter Bar */}
      <div className="border-b border-[rgba(255,255,255,0.06)] px-8 py-4 bg-[#111111]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          {/* Search Input */}
          <input
            id="search-input"
            type="text"
            placeholder="Search by customer name, phone, business..."
            defaultValue={searchQuery}
            data-testid="bookings-search-input"
            onChange={(e) => {
              const value = e.target.value;
              if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
              }
              searchTimerRef.current = setTimeout(() => updateFilter('search', value), 500);
            }}
            className="w-full h-9 px-4 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs rounded-none placeholder:text-[#6b6880] focus:outline-none focus:border-[#d4a843] transition-colors"
          />

          {/* Status Filter */}
          <select
            id="status-filter"
            value={selectedStatus}
            onChange={(e) => updateFilter('status', e.target.value)}
            data-testid="bookings-status-filter"
            className="h-9 px-4 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs uppercase rounded-none appearance-none cursor-pointer hover:border-[rgba(255,255,255,0.2)] transition-colors"
            style={{ paddingRight: '2rem', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236b6880\' d=\'M6 8L2 4h8z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
          >
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                STATUS: {status.label}
              </option>
            ))}
          </select>

          {/* Source Filter */}
          <select
            id="source-filter"
            value={selectedSource}
            onChange={(e) => updateFilter('source', e.target.value)}
            data-testid="bookings-source-filter"
            className="h-9 px-4 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs uppercase rounded-none appearance-none cursor-pointer hover:border-[rgba(255,255,255,0.2)] transition-colors"
            style={{ paddingRight: '2rem', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236b6880\' d=\'M6 8L2 4h8z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
          >
            {SOURCES.map((source) => (
              <option key={source.value} value={source.value}>
                SOURCE: {source.label}
              </option>
            ))}
          </select>

          {/* Business Filter */}
          <select
            id="business-filter"
            value={selectedBusiness}
            onChange={(e) => updateFilter('business', e.target.value)}
            data-testid="bookings-business-filter"
            className="h-9 px-4 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs uppercase rounded-none appearance-none cursor-pointer hover:border-[rgba(255,255,255,0.2)] transition-colors"
            style={{ paddingRight: '2rem', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236b6880\' d=\'M6 8L2 4h8z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
          >
            <option value="all">BUSINESS: ALL</option>
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                BUSINESS: {business.name.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Date From */}
          <input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => updateFilter('dateFrom', e.target.value)}
            data-testid="bookings-date-from"
            aria-label="Filter by date from"
            className="h-9 px-4 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs rounded-none focus:outline-none focus:border-[#d4a843] transition-colors"
          />

          {/* Date To */}
          <input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => updateFilter('dateTo', e.target.value)}
            data-testid="bookings-date-to"
            aria-label="Filter by date to"
            className="h-9 px-4 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs rounded-none focus:outline-none focus:border-[#d4a843] transition-colors"
          />
        </div>

        {/* Results Count */}
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Showing {bookings.length} of {totalCount} bookings
        </div>
      </div>

      {/* Column Headers */}
      <div className="px-8 py-3 border-b border-[rgba(255,255,255,0.06)] grid grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1fr_1fr_100px] gap-4">
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Customer
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Business
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Service / Staff
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Appointment
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Status
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Source
        </div>
        <div className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider text-right">
          Actions
        </div>
      </div>

      {/* Booking Rows */}
      <div>
        {bookings.length === 0 ? (
          <div className="px-8 py-12 text-center text-[#6b6880] font-mono text-sm">
            No bookings found
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              data-testid={`booking-row-${booking.id}`}
              className="relative px-8 py-4 bg-[#111111] border-b border-[rgba(255,255,255,0.06)] hover:bg-[#1a1a1a] hover:border-l-[1px] hover:border-l-[#d4a843] transition-all grid grid-cols-[2fr_1.5fr_1.5fr_1.5fr_1fr_1fr_100px] gap-4 items-center min-h-[64px]"
            >
              {/* Customer */}
              <div>
                <div className="text-white text-[15px] font-medium">
                  {booking.customerName}
                </div>
                <div className="text-[#6b6880] font-mono text-[11px] mt-1">
                  {booking.customerPhone}
                </div>
                {booking.isGuest && (
                  <span className="inline-block mt-1 text-[10px] text-[#6b6880] bg-[#0a0a0a] border border-[rgba(255,255,255,0.06)] px-1.5 py-0.5 rounded-sm uppercase">
                    GUEST
                  </span>
                )}
              </div>

              {/* Business */}
              <div className="text-white font-mono text-[11px]">
                {booking.businessName}
              </div>

              {/* Service / Staff */}
              <div>
                <div className="text-white text-[11px]">
                  {booking.serviceName || '—'}
                </div>
                {booking.staffName && (
                  <div className="text-[#6b6880] font-mono text-[11px] mt-1">
                    {booking.staffName}
                  </div>
                )}
              </div>

              {/* Appointment */}
              <div>
                <div className="text-white font-mono text-[11px]">
                  {formatTbilisi(booking.appointmentDatetime, 'MMM d, yyyy')}
                </div>
                <div className="text-[#6b6880] font-mono text-[11px] mt-1">
                  {formatTbilisi(booking.appointmentDatetime, 'HH:mm')} ({booking.durationMinutes}min)
                </div>
              </div>

              {/* Status */}
              <div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-[5px] h-[5px] rounded-full ${
                      booking.status === 'confirmed' ? 'bg-[#22c55e]' :
                      booking.status === 'completed' ? 'bg-[#3b82f6]' :
                      booking.status === 'cancelled' ? 'bg-[#ef4444]' :
                      booking.status === 'no_show' ? 'bg-[#f59e0b]' :
                      'bg-[#6b6880]'
                    }`}
                  />
                  <span className={`font-mono text-[11px] uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                    {booking.status === 'no_show' ? 'No Show' : booking.status}
                  </span>
                </div>
              </div>

              {/* Source */}
              <div>
                <span className={`font-mono text-[11px] uppercase tracking-wider ${getSourceColor(booking.bookingSource)}`}>
                  {booking.bookingSource}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                {booking.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => handleCancel(booking.id, booking)}
                      disabled={actionInProgress === booking.id || isPending}
                      data-testid={`booking-cancel-${booking.id}`}
                      className="w-7 h-7 flex items-center justify-center text-[#6b6880] hover:text-[#ef4444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Cancel booking"
                      aria-label={`Cancel booking for ${booking.customerName}`}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleNoShow(booking.id, booking)}
                      disabled={actionInProgress === booking.id || isPending}
                      data-testid={`booking-no-show-${booking.id}`}
                      className="w-7 h-7 flex items-center justify-center text-[#6b6880] hover:text-[#f59e0b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Mark as no-show"
                      aria-label={`Mark ${booking.customerName} as no-show`}
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </>
                )}
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
              data-testid="bookings-prev-page"
              className="h-9 px-4 border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs uppercase rounded-none hover:border-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              data-testid="bookings-next-page"
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
