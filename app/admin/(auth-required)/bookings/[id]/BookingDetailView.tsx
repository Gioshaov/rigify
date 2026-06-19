'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatTbilisi } from '@/lib/utils/datetime';
import { cancelBooking } from '../actions';
import { Calendar, Clock, User, Phone, Mail, FileText, TrendingUp, Edit, XCircle } from 'lucide-react';

type Booking = {
  id: string;
  appointment_datetime: string;
  end_datetime: string | null;
  duration_minutes: number;
  status: string;
  booking_source: string;
  reschedule_count: number;
  notes: string | null;
  price: number | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_id: string | null;
  created_at: string;
  updated_at: string;
  business: {
    id: string;
    name: string;
    slug: string;
  } | null;
  service: {
    id: string;
    name: string;
    price: number | null;
    duration_minutes: number;
  } | null;
  staff: {
    id: string;
    name: string;
  } | null;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
  } | null;
};

interface BookingDetailViewProps {
  booking: Booking;
}

export function BookingDetailView({ booking }: BookingDetailViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isGuest = !booking.customer_id;
  // canEdit: allow editing any booking that hasn't reached a terminal state
  // canCancel: only allow cancelling confirmed bookings (stricter gate)
  // This means confirmed bookings show both Edit and Cancel, while other non-terminal states only show Edit
  const canEdit = booking.status !== 'cancelled' && booking.status !== 'completed' && booking.status !== 'no_show';
  const canCancel = booking.status === 'confirmed';

  const handleCancel = () => {
    const appointmentTime = formatTbilisi(booking.appointment_datetime, 'MMM d, yyyy HH:mm');
    if (!confirm(`Cancel booking for ${booking.customer_name} at ${appointmentTime}?`)) {
      return;
    }

    startTransition(async () => {
      const result = await cancelBooking(booking.id);

      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Booking cancelled successfully' });
        router.refresh();
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border-[rgba(34,197,94,0.3)]';
      case 'completed':
        return 'bg-[rgba(100,100,255,0.1)] text-[#6464ff] border-[rgba(100,100,255,0.3)]';
      case 'cancelled':
        return 'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border-[rgba(239,68,68,0.3)]';
      case 'no_show':
        return 'bg-[rgba(255,165,0,0.1)] text-[#ffa500] border-[rgba(255,165,0,0.3)]';
      default:
        return 'bg-[rgba(100,100,100,0.1)] text-[#888888] border-[#444444]';
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
    <div className="min-h-screen flex bg-[#0a0a0a]">
      {/* Main Content Column */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-14 bg-[#111111] border-b border-[#2a2a2a] flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-white">Booking Details</h1>
            <p className="text-[#888888] text-sm">
              {booking.customer_name} • {formatTbilisi(booking.appointment_datetime, 'MMM d, yyyy HH:mm')}
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-[#888888] hover:text-white text-sm uppercase tracking-wider transition-colors"
            data-testid="booking-detail-back-btn"
          >
            ← Back to Bookings
          </Link>
        </header>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mx-8 mt-6 px-4 py-3 rounded ${
              message.type === 'success'
                ? 'bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] text-[#22c55e]'
                : 'bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444]'
            }`}
            data-testid="booking-detail-message"
          >
            {message.text}
          </div>
        )}

        <div className="px-8 py-6 space-y-6">
          {/* Section 1: Booking Information */}
          <section>
            <h2 className="text-[#888888] text-[11px] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Booking Information
            </h2>
            <div className="bg-[#111111] border border-[#2a2a2a] rounded p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[#888888] text-xs uppercase tracking-wider">Business</label>
                  <p className="text-white text-sm mt-1">{booking.business?.name || '—'}</p>
                </div>
                <div>
                  <label className="text-[#888888] text-xs uppercase tracking-wider">Service</label>
                  <p className="text-white text-sm mt-1" data-testid="booking-detail-service-text">
                    {booking.service?.name || '—'}
                  </p>
                </div>
                <div>
                  <label className="text-[#888888] text-xs uppercase tracking-wider">Staff Member</label>
                  <p className="text-white text-sm mt-1">{booking.staff?.name || '—'}</p>
                </div>
                <div>
                  <label className="text-[#888888] text-xs uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Duration
                  </label>
                  <p className="text-white text-sm mt-1 font-mono">{booking.duration_minutes} minutes</p>
                </div>
                <div>
                  <label className="text-[#888888] text-xs uppercase tracking-wider">Appointment Date & Time</label>
                  <p className="text-white text-sm mt-1 font-mono" data-testid="booking-detail-datetime-text">
                    {formatTbilisi(booking.appointment_datetime, 'EEEE, MMM d, yyyy')}
                    <br />
                    {formatTbilisi(booking.appointment_datetime, 'HH:mm')} - {booking.end_datetime ? formatTbilisi(booking.end_datetime, 'HH:mm') : '—'}
                  </p>
                </div>
                <div>
                  <label className="text-[#888888] text-xs uppercase tracking-wider">Status</label>
                  <div className="mt-1">
                    <span
                      data-testid="booking-detail-status-badge"
                      className={`text-xs uppercase px-2 py-1 rounded border inline-block ${getStatusColor(booking.status)}`}
                    >
                      {booking.status === 'no_show' ? 'No Show' : booking.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-[#888888] text-xs uppercase tracking-wider">Booking Source</label>
                  <p className={`text-sm mt-1 uppercase font-mono ${getSourceColor(booking.booking_source)}`}>
                    {booking.booking_source}
                  </p>
                </div>
                {booking.price !== null && (
                  <div>
                    <label className="text-[#888888] text-xs uppercase tracking-wider">Price</label>
                    <p className="text-white text-sm mt-1 font-mono">₾{booking.price.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 2: Customer Information */}
          <section>
            <h2 className="text-[#888888] text-[11px] uppercase tracking-widest mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer Information
            </h2>
            <div className="bg-[#111111] border border-[#2a2a2a] rounded p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[#888888] text-xs uppercase tracking-wider">Name</label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-white text-sm" data-testid="booking-detail-customer-name-text">
                      {booking.customer_name}
                    </p>
                    {isGuest && (
                      <span className="text-[10px] text-[#6b6880] bg-[#0a0a0a] border border-[rgba(255,255,255,0.06)] px-1.5 py-0.5 rounded-sm uppercase">
                        GUEST
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-[#888888] text-xs uppercase tracking-wider flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Phone
                  </label>
                  <p className="text-white text-sm mt-1 font-mono">{booking.customer_phone}</p>
                </div>
                {booking.customer_email && (
                  <div>
                    <label className="text-[#888888] text-xs uppercase tracking-wider flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Email
                    </label>
                    <p className="text-white text-sm mt-1 font-mono">{booking.customer_email}</p>
                  </div>
                )}
                {!isGuest && booking.customer && (
                  <div>
                    <label className="text-[#888888] text-xs uppercase tracking-wider">Customer Profile</label>
                    <Link
                      href={`/admin/customers/${booking.customer.id}`}
                      className="text-primary hover:underline text-sm mt-1 block"
                    >
                      View Profile →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 3: Notes */}
          {booking.notes && (
            <section>
              <h2 className="text-[#888888] text-[11px] uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes
              </h2>
              <div className="bg-[#111111] border border-[#2a2a2a] rounded p-6">
                <p className="text-white text-sm whitespace-pre-wrap" data-testid="booking-detail-notes-text">
                  {booking.notes}
                </p>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-[300px] bg-[#111111] border-l border-[#2a2a2a] flex-shrink-0 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Actions Panel */}
          <section>
            <h3 className="text-[#888888] text-[11px] uppercase tracking-widest mb-3">Actions</h3>
            <div className="space-y-2">
              {canEdit && (
                <Link
                  href={`/admin/bookings/${booking.id}/edit`}
                  data-testid="booking-detail-edit-btn"
                  className="block w-full bg-[#d4a843] text-black font-bold uppercase tracking-wider text-sm px-4 py-2.5 rounded text-center hover:brightness-110 transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit Booking
                  </div>
                </Link>
              )}
              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={isPending}
                  data-testid="booking-detail-cancel-btn"
                  className="w-full bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] text-sm px-4 py-2 rounded hover:bg-[rgba(239,68,68,0.2)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  {isPending ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}
              {!canEdit && !canCancel && (
                <p className="text-[#888888] text-sm">No actions available for {booking.status} bookings</p>
              )}
            </div>
          </section>

          <div className="border-t border-[#2a2a2a]" />

          {/* Timeline Panel */}
          <section>
            <h3 className="text-[#888888] text-[11px] uppercase tracking-widest mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Timeline
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[#888888] text-xs uppercase tracking-wider">Created</label>
                <p className="text-white text-sm mt-1 font-mono">
                  {formatTbilisi(booking.created_at, 'MMM d, yyyy HH:mm')}
                </p>
              </div>
              <div>
                <label className="text-[#888888] text-xs uppercase tracking-wider">Last Updated</label>
                <p className="text-white text-sm mt-1 font-mono">
                  {formatTbilisi(booking.updated_at, 'MMM d, yyyy HH:mm')}
                </p>
              </div>
              <div>
                <label className="text-[#888888] text-xs uppercase tracking-wider">Reschedule Count</label>
                <p className={`text-sm mt-1 font-mono ${booking.reschedule_count >= 3 ? 'text-[#ffa500]' : 'text-white'}`}>
                  {booking.reschedule_count} / 3
                  {booking.reschedule_count >= 3 && (
                    <span className="block text-[10px] text-[#ffa500] mt-1">
                      ⚠️ Max limit reached
                    </span>
                  )}
                </p>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
