'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatTbilisi } from '@/lib/utils/datetime';
import { updateBooking } from '../../actions';
import { Calendar, Clock, User, FileText, AlertTriangle } from 'lucide-react';

type Booking = {
  id: string;
  appointment_datetime: string;
  duration_minutes: number;
  notes: string | null;
  reschedule_count: number;
  service_id: string | null;
  staff_id: string;
  business_id: string;
  status: string;
  business: {
    id: string;
    name: string;
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

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number | null;
};

type Staff = {
  id: string;
  name: string;
};

interface EditBookingFormProps {
  booking: Booking;
  services: Service[];
  staff: Staff[];
}

export function EditBookingForm({ booking, services, staff }: EditBookingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState(booking.service_id || '');
  const [durationMinutes, setDurationMinutes] = useState(booking.duration_minutes);

  // Extract local date and time from UTC datetime
  const initialDate = formatTbilisi(booking.appointment_datetime, 'yyyy-MM-dd');
  const initialTime = formatTbilisi(booking.appointment_datetime, 'HH:mm');

  // Update duration when service changes
  useEffect(() => {
    if (selectedServiceId) {
      const selectedService = services.find(s => s.id === selectedServiceId);
      if (selectedService) {
        setDurationMinutes(selectedService.duration_minutes);
      }
    }
  }, [selectedServiceId, services]);

  const handleSubmit = async (formData: FormData) => {
    setMessage(null);

    startTransition(async () => {
      const result = await updateBooking(booking.id, formData);

      if (!result.success) {
        setMessage({ type: 'error', text: result.message });
      } else {
        setMessage({ type: 'success', text: result.message });
        setTimeout(() => {
          router.push(`/admin/bookings/${booking.id}`);
        }, 1000);
      }
    });
  };

  const atRescheduleLimit = booking.reschedule_count >= 3;

  return (
    <div className="min-h-dvh flex bg-[#0a0a0a]">
      {/* Main Form Column */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-14 bg-[#111111] border-b border-[#2a2a2a] flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold text-white">Edit Booking</h1>
          <Link
            href={`/admin/bookings/${booking.id}`}
            className="text-[#888888] hover:text-white text-sm uppercase tracking-wider transition-colors"
            data-testid="edit-booking-back-btn"
          >
            ← Back to Details
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
            data-testid="edit-booking-message"
          >
            {message.text}
          </div>
        )}

        {/* Reschedule Limit Warning */}
        {atRescheduleLimit && (
          <div className="mx-8 mt-6 px-4 py-3 rounded bg-[rgba(255,165,0,0.1)] border border-[rgba(255,165,0,0.3)] text-[#ffa500]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-bold">Warning:</span>
              <span>Reschedule limit reached (3/3). Changing date/time will fail.</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form action={handleSubmit} className="px-8 py-6 space-y-6">
          {/* Section 1: Booking Details */}
          <section>
            <h2 className="text-[#888888] text-[11px] uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Booking Details
            </h2>
            <div className="space-y-4">
              {/* Business (read-only) */}
              <div>
                <label className="block text-[#cccccc] text-sm mb-1.5">Business</label>
                <div className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded px-3 py-2 text-[#888888] text-sm">
                  {booking.business?.name || '—'}
                </div>
                <p className="text-[#888888] text-xs mt-1">Cannot change business</p>
              </div>

              {/* Service Dropdown */}
              <div>
                <label htmlFor="service_id" className="block text-[#cccccc] text-sm mb-1.5">
                  Service
                </label>
                <select
                  id="service_id"
                  name="service_id"
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  data-testid="edit-booking-service-select"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                  required
                >
                  <option value="">Select service...</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.duration_minutes}min{service.price ? `, ₾${service.price}` : ''})
                    </option>
                  ))}
                </select>
              </div>

              {/* Staff Dropdown */}
              <div>
                <label htmlFor="staff_id" className="block text-[#cccccc] text-sm mb-1.5 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Staff Member
                </label>
                <select
                  id="staff_id"
                  name="staff_id"
                  defaultValue={booking.staff_id}
                  data-testid="edit-booking-staff-select"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843]"
                  required
                >
                  <option value="">Select staff...</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-[#cccccc] text-sm mb-1.5">
                  Date (Tbilisi local)
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  defaultValue={initialDate}
                  data-testid="edit-booking-date-input"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#d4a843]"
                  required
                />
              </div>

              {/* Time */}
              <div>
                <label htmlFor="time" className="block text-[#cccccc] text-sm mb-1.5 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time (Tbilisi local)
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  defaultValue={initialTime}
                  data-testid="edit-booking-time-input"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#d4a843]"
                  required
                />
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration_minutes" className="block text-[#cccccc] text-sm mb-1.5">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  id="duration_minutes"
                  name="duration_minutes"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                  min="15"
                  max="480"
                  step="15"
                  data-testid="edit-booking-duration-input"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#d4a843]"
                  required
                />
                <p className="text-[#888888] text-xs mt-1">15-480 minutes (auto-filled from service)</p>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-[#cccccc] text-sm mb-1.5 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  defaultValue={booking.notes || ''}
                  data-testid="edit-booking-notes-textarea"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#d4a843] resize-none"
                  placeholder="Optional notes about this booking..."
                />
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isPending}
              data-testid="edit-booking-submit-btn"
              className="bg-[#d4a843] text-black font-bold uppercase tracking-wider text-sm px-6 py-2.5 rounded hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>

      {/* Right Sidebar */}
      <aside className="w-[300px] bg-[#111111] border-l border-[#2a2a2a] flex-shrink-0 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Reschedule Count Panel */}
          <section>
            <h3 className="text-[#888888] text-[11px] uppercase tracking-widest mb-3">Reschedule Count</h3>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#cccccc] text-sm">Current Count</span>
                <span className={`font-mono text-lg ${atRescheduleLimit ? 'text-[#ffa500]' : 'text-white'}`}>
                  {booking.reschedule_count} / 3
                </span>
              </div>
              {atRescheduleLimit ? (
                <p className="text-[#ffa500] text-xs">
                  ⚠️ Limit reached. Cannot change date/time.
                </p>
              ) : (
                <p className="text-[#888888] text-xs">
                  {3 - booking.reschedule_count} reschedule{3 - booking.reschedule_count !== 1 ? 's' : ''} remaining
                </p>
              )}
            </div>
          </section>

          <div className="border-t border-[#2a2a2a]" />

          {/* Current Status Panel */}
          <section>
            <h3 className="text-[#888888] text-[11px] uppercase tracking-widest mb-3">Current Status</h3>
            <div className="flex items-center justify-between">
              <span className="text-[#cccccc] text-sm">Status</span>
              <span
                className={`text-xs uppercase px-2 py-1 rounded border ${
                  booking.status === 'confirmed'
                    ? 'bg-[rgba(34,197,94,0.1)] text-[#22c55e] border-[rgba(34,197,94,0.3)]'
                    : 'bg-[rgba(100,100,100,0.1)] text-[#888888] border-[#444444]'
                }`}
              >
                {booking.status}
              </span>
            </div>
          </section>

          <div className="border-t border-[#2a2a2a]" />

          {/* Info Panel */}
          <section>
            <h3 className="text-[#888888] text-[11px] uppercase tracking-widest mb-3">Important</h3>
            <div className="space-y-2 text-[#888888] text-xs">
              <p>• Changing date/time increments reschedule count</p>
              <p>• System checks for staff availability conflicts</p>
              <p>• All times are in Tbilisi timezone (Asia/Tbilisi)</p>
              <p>• Duration is auto-filled from service but editable</p>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
