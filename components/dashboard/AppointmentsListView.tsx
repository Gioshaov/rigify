'use client'

import { useState } from "react";

type Booking = {
  id: string;
  appointment_datetime: string;
  status: string;
  duration_minutes: number;
  price: number | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  services: { id: string; name: string } | { id: string; name: string }[];
  staff: { id: string; name: string } | { id: string; name: string }[] | null;
};

type AppointmentsListViewProps = {
  bookings: Booking[];
};

export function AppointmentsListView({ bookings }: AppointmentsListViewProps) {
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return { date: `${dayName}, ${monthName} ${day}`, time };
  };

  // Group bookings by date
  const groupedBookings = bookings.reduce((groups, booking) => {
    const date = new Date(booking.appointment_datetime).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(booking);
    return groups;
  }, {} as Record<string, Booking[]>);

  // Sort dates
  const sortedDates = Object.keys(groupedBookings).sort((a, b) =>
    new Date(a).getTime() - new Date(b).getTime()
  );

  if (bookings.length === 0) {
    return (
      <div className="bg-surface-container border border-white/5 p-12 text-center">
        <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-primary text-[32px]">event_busy</span>
        </div>
        <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
          No appointments found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedDates.map(date => {
        const dateBookings = groupedBookings[date].sort((a, b) =>
          new Date(a.appointment_datetime).getTime() - new Date(b.appointment_datetime).getTime()
        );
        const formattedDate = formatDateTime(dateBookings[0].appointment_datetime).date;

        return (
          <div key={date}>
            {/* Date Header */}
            <div className="mb-4 pb-3 border-b border-white/10">
              <h3 className="font-hanken text-[20px] leading-[1.4] font-semibold text-primary">
                {formattedDate}
              </h3>
              <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mt-1">
                {dateBookings.length} {dateBookings.length === 1 ? 'Appointment' : 'Appointments'}
              </p>
            </div>

            {/* Appointments for this date */}
            <div className="space-y-4">
              {dateBookings.map(booking => {
                const service = Array.isArray(booking.services) ? booking.services[0] : booking.services;
                const staff = booking.staff && (Array.isArray(booking.staff) ? booking.staff[0] : booking.staff);
                const { time } = formatDateTime(booking.appointment_datetime);
                const isExpanded = expandedBooking === booking.id;

                return (
                  <div
                    key={booking.id}
                    className="bg-surface-container border border-white/5 hover:border-primary/30 transition-all"
                    data-testid={`appointment-${booking.id}`}
                  >
                    {/* Main Info */}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-6">
                        {/* Left: Time & Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            {/* Time */}
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                              <span className="font-mono text-[14px] leading-[1] tracking-[0.15em] font-medium text-primary">
                                {time}
                              </span>
                            </div>
                            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
                              {booking.duration_minutes} MIN
                            </span>
                            {/* Status Badge */}
                            <span
                              className={`
                                px-3 py-1 font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase
                                ${booking.status === 'confirmed' ? 'bg-primary/10 border border-primary/20 text-primary' : ''}
                                ${booking.status === 'pending' ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-500' : ''}
                                ${booking.status === 'cancelled' ? 'bg-error/10 border border-error/20 text-error' : ''}
                                ${booking.status === 'completed' ? 'bg-green-500/10 border border-green-500/20 text-green-500' : ''}
                              `}
                            >
                              {booking.status}
                            </span>
                          </div>

                          {/* Service */}
                          <h4 className="font-hanken text-[18px] leading-[1.6] font-normal text-on-surface mb-3">
                            {service?.name || 'Service'}
                          </h4>

                          {/* Customer */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">person</span>
                            <span className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface">
                              {booking.customer_name}
                            </span>
                          </div>

                          {/* Staff */}
                          {staff && (
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">badge</span>
                              <span className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface-variant">
                                Staff: {staff.name}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-col items-end gap-3">
                          {booking.price && (
                            <div className="text-right">
                              <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-1">
                                Price
                              </p>
                              <p className="font-hanken text-[20px] leading-[1.4] font-semibold text-primary">
                                ₾{(booking.price / 100).toFixed(2)}
                              </p>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                              className="px-4 py-2 border border-white/10 hover:border-primary/30 transition-colors"
                              data-testid={`details-btn-${booking.id}`}
                            >
                              <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[16px]">
                                  {isExpanded ? 'expand_less' : 'expand_more'}
                                </span>
                                <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface uppercase">
                                  Details
                                </span>
                              </span>
                            </button>
                            <button
                              className="px-4 py-2 border border-white/10 hover:border-primary/30 transition-colors"
                              data-testid={`edit-btn-${booking.id}`}
                            >
                              <span className="material-symbols-outlined text-primary text-[16px]">edit</span>
                            </button>
                            <button
                              className="px-4 py-2 border border-white/10 hover:border-error/30 transition-colors"
                              data-testid={`cancel-btn-${booking.id}`}
                            >
                              <span className="material-symbols-outlined text-error text-[16px]">close</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-3 border-t border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2">
                              Contact Information
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-on-surface-variant text-[16px]">phone</span>
                                <span className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface">
                                  {booking.customer_phone || 'No phone'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-on-surface-variant text-[16px]">email</span>
                                <span className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface">
                                  {booking.customer_email || 'No email'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2">
                              Booking ID
                            </p>
                            <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface">
                              {booking.id}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
