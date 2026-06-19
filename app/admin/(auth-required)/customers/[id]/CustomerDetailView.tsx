'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatTbilisi } from '@/lib/utils/datetime';
import { updateCustomerStatus, deleteCustomer } from '../actions';
import { User, Mail, Phone, Calendar, TrendingUp, CheckCircle, XCircle, Ban } from 'lucide-react';

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  has_used_emergency_cancel: boolean;
  created_at: string;
  updated_at: string;
};

type Booking = {
  id: string;
  appointment_datetime: string;
  status: string;
  booking_source: string;
  business: {
    id: string;
    name: string;
    slug: string;
  } | null;
  service: {
    id: string;
    name: string;
    duration_minutes: number;
  } | null;
  staff: {
    id: string;
    name: string;
  } | null;
};

type Stats = {
  total: number;
  upcoming: number;
  completed: number;
  noShows: number;
};

interface CustomerDetailViewProps {
  customer: Customer;
  bookings: Booking[];
  stats: Stats;
}

export function CustomerDetailView({ customer, bookings, stats }: CustomerDetailViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggleStatus = () => {
    const newStatus = customer.status === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'suspend';

    if (!confirm(`Are you sure you want to ${action} ${customer.name}?`)) {
      return;
    }

    startTransition(async () => {
      const result = await updateCustomerStatus(customer.id, newStatus, customer.name);

      if (!result.success) {
        setMessage({ type: 'error', text: result.message });
      } else {
        setMessage({ type: 'success', text: result.message });
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`Delete customer ${customer.name}? This will also delete all their bookings. This action cannot be undone.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCustomer(customer.id, customer.name);

      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        router.push('/admin/customers');
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border-[rgba(34,197,94,0.3)]',
      cancelled: 'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border-[rgba(239,68,68,0.3)]',
      completed: 'bg-[rgba(100,100,255,0.1)] text-[#6464ff] border-[rgba(100,100,255,0.3)]',
      no_show: 'bg-[rgba(255,165,0,0.1)] text-[#ffa500] border-[rgba(255,165,0,0.3)]',
    };

    return styles[status as keyof typeof styles] || styles.confirmed;
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      {/* Main Content Column */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-14 bg-[#111111] border-b border-[#2a2a2a] flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-white">Customer Details</h1>
            <p className="text-[#888888] text-sm" data-testid="customer-detail-name-text">{customer.name}</p>
          </div>
          <Link
            href="/admin/customers"
            className="text-[#888888] hover:text-white text-sm uppercase tracking-wider transition-colors"
            data-testid="customer-detail-back-btn"
          >
            ← Back to Customers
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
            data-testid="customer-detail-message"
          >
            {message.text}
          </div>
        )}

        <div className="px-8 py-6 space-y-6">
          {/* Section 1: Profile Info */}
          <section>
            <h2 className="text-[#888888] text-[11px] uppercase tracking-widest mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile Information
            </h2>
            <div className="bg-[#111111] border border-[#2a2a2a] rounded p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[#888888] text-xs uppercase tracking-wider">Name</label>
                  <p className="text-white text-sm mt-1">{customer.name}</p>
                </div>
                <div>
                  <label className="text-[#888888] text-xs uppercase tracking-wider flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </label>
                  <p className="text-white text-sm mt-1 font-mono">{customer.email}</p>
                </div>
                <div>
                  <label className="text-[#888888] text-xs uppercase tracking-wider flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Phone
                  </label>
                  <p className="text-white text-sm mt-1 font-mono">{customer.phone}</p>
                </div>
                <div>
                  <label className="text-[#888888] text-xs uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined
                  </label>
                  <p className="text-white text-sm mt-1">{formatTbilisi(customer.created_at, 'MMM d, yyyy')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Booking History */}
          <section>
            <h2 className="text-[#888888] text-[11px] uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Booking History
            </h2>
            <div className="bg-[#111111] border border-[#2a2a2a] rounded overflow-hidden" data-testid="customer-detail-bookings-table">
              {bookings.length === 0 ? (
                <div className="px-6 py-12 text-center text-[#888888] text-sm">
                  No bookings yet
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-[#0a0a0a] border-b border-[#2a2a2a]">
                    <tr>
                      <th className="px-4 py-3 text-left text-[#888888] text-[10px] uppercase tracking-wider">Date & Time</th>
                      <th className="px-4 py-3 text-left text-[#888888] text-[10px] uppercase tracking-wider">Business</th>
                      <th className="px-4 py-3 text-left text-[#888888] text-[10px] uppercase tracking-wider">Service</th>
                      <th className="px-4 py-3 text-left text-[#888888] text-[10px] uppercase tracking-wider">Staff</th>
                      <th className="px-4 py-3 text-left text-[#888888] text-[10px] uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-[#888888] text-[10px] uppercase tracking-wider">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors">
                        <td className="px-4 py-3 text-white text-sm font-mono">
                          {formatTbilisi(booking.appointment_datetime, 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="px-4 py-3 text-white text-sm">
                          {booking.business?.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-white text-sm">
                          {booking.service?.name || '—'}
                        </td>
                        <td className="px-4 py-3 text-white text-sm">
                          {booking.staff?.name || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs uppercase px-2 py-1 rounded border ${getStatusBadge(booking.status)}`}>
                            {booking.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#888888] text-sm capitalize">
                          {booking.booking_source}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-[300px] bg-[#111111] border-l border-[#2a2a2a] flex-shrink-0 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Status Panel */}
          <section>
            <h3 className="text-[#888888] text-[11px] uppercase tracking-widest mb-3">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#cccccc] text-sm">Current Status</span>
                <span
                  data-testid="customer-detail-status-badge"
                  className={`text-xs uppercase tracking-wider px-2 py-1 rounded ${
                    customer.status === 'active'
                      ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border border-[rgba(34,197,94,0.3)]'
                      : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.3)]'
                  }`}
                >
                  {customer.status}
                </span>
              </div>
              <button
                onClick={handleToggleStatus}
                disabled={isPending}
                data-testid="customer-detail-status-toggle-btn"
                className={`w-full px-4 py-2 border text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  customer.status === 'active'
                    ? 'border-[rgba(239,68,68,0.3)] text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)]'
                    : 'border-[rgba(34,197,94,0.3)] text-[#22c55e] hover:bg-[rgba(34,197,94,0.1)]'
                }`}
              >
                {isPending ? 'Processing...' : customer.status === 'active' ? 'Suspend Customer' : 'Activate Customer'}
              </button>
            </div>
          </section>

          <div className="border-t border-[#2a2a2a]" />

          {/* Stats Panel */}
          <section>
            <h3 className="text-[#888888] text-[11px] uppercase tracking-widest mb-3">Statistics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#cccccc] text-sm">Total Bookings</span>
                <span className="text-white font-mono text-sm">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#cccccc] text-sm">Upcoming</span>
                <span className="text-[#22c55e] font-mono text-sm">{stats.upcoming}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#cccccc] text-sm">Completed</span>
                <span className="text-[#6464ff] font-mono text-sm">{stats.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#cccccc] text-sm">No-Shows</span>
                <span className="text-[#ffa500] font-mono text-sm">{stats.noShows}</span>
              </div>
            </div>
          </section>

          <div className="border-t border-[#2a2a2a]" />

          {/* Emergency Cancel Panel */}
          <section>
            <h3 className="text-[#888888] text-[11px] uppercase tracking-widest mb-3">Emergency Cancel</h3>
            <div className="flex items-center gap-2">
              {customer.has_used_emergency_cancel ? (
                <>
                  <XCircle className="w-4 h-4 text-[#ef4444]" />
                  <span className="text-[#ef4444] text-sm">Used</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                  <span className="text-[#22c55e] text-sm">Available</span>
                </>
              )}
            </div>
            <p className="text-[#888888] text-xs mt-2">
              One-time lifetime flag managed by system
            </p>
          </section>

          <div className="border-t border-[#2a2a2a]" />

          {/* Actions */}
          <section>
            <Link
              href={`/admin/customers/${customer.id}/edit`}
              data-testid="customer-detail-edit-btn"
              className="block w-full bg-[#d4a843] text-black font-bold uppercase tracking-wider text-sm px-4 py-2.5 rounded text-center hover:brightness-110 transition-all"
            >
              Edit Customer
            </Link>
          </section>

          <div className="border-t border-[#2a2a2a]" />

          {/* Danger Zone */}
          <section>
            <h3 className="text-[#ef4444] text-[11px] uppercase tracking-widest mb-3">Danger Zone</h3>
            <button
              onClick={handleDelete}
              disabled={isPending}
              data-testid="customer-detail-delete-btn"
              className="w-full bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] text-sm px-4 py-2 rounded hover:bg-[rgba(239,68,68,0.2)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Deleting...' : 'Delete Customer'}
            </button>
          </section>
        </div>
      </aside>
    </div>
  );
}
