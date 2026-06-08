'use client'

type Booking = {
  id: string;
  appointment_datetime: string;
  status: string;
  duration_minutes: number;
  services: { name: string } | { name: string }[];
  staff: { name: string } | { name: string }[] | null;
  customer_name: string;
};

type DayAppointmentsProps = {
  selectedDate: Date | null;
  bookings: Booking[];
  onClose: () => void;
};

export function DayAppointments({ selectedDate, bookings, onClose }: DayAppointmentsProps) {
  if (!selectedDate) {
    return (
      <div className="bg-surface-container border border-white/5 p-8 text-center">
        <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-primary text-[32px]">event</span>
        </div>
        <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
          Select a date to view appointments
        </p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Sort bookings by time
  const sortedBookings = [...bookings].sort((a, b) =>
    new Date(a.appointment_datetime).getTime() - new Date(b.appointment_datetime).getTime()
  );

  return (
    <div className="bg-surface-container border border-white/5">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold uppercase mb-2">
            SELECTED DATE
          </p>
          <h3 className="font-hanken text-[20px] leading-[1.4] font-semibold text-primary">
            {formatDate(selectedDate)}
          </h3>
          <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface-variant mt-2">
            {bookings.length} {bookings.length === 1 ? 'Appointment' : 'Appointments'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center border border-white/10 hover:border-primary/30 transition-colors"
          data-testid="close-day-view-btn"
        >
          <span className="material-symbols-outlined text-primary text-[18px]">close</span>
        </button>
      </div>

      {/* Appointments List */}
      <div className="max-h-[600px] overflow-y-auto">
        {sortedBookings.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-surface-container-low border border-white/5 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-on-surface-variant text-[24px]">event_busy</span>
            </div>
            <p className="font-hanken text-[14px] leading-[1.5] font-normal text-text-secondary">
              No appointments scheduled
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {sortedBookings.map((booking) => {
              const service = Array.isArray(booking.services) ? booking.services[0] : booking.services;
              const staff = booking.staff && (Array.isArray(booking.staff) ? booking.staff[0] : booking.staff);

              return (
                <div
                  key={booking.id}
                  className="p-6 hover:bg-surface-container-low transition-colors group"
                  data-testid={`appointment-${booking.id}`}
                >
                  {/* Time */}
                  <div className="flex items-start gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
                      <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-primary">
                        {formatTime(booking.appointment_datetime)}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
                      {booking.duration_minutes} MIN
                    </span>
                  </div>

                  {/* Service */}
                  <h4 className="font-hanken text-[16px] leading-[1.5] font-normal text-on-surface mb-2">
                    {service?.name || 'Service'}
                  </h4>

                  {/* Customer */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-[16px]">person</span>
                    <span className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface-variant">
                      {booking.customer_name}
                    </span>
                  </div>

                  {/* Staff */}
                  {staff && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-on-surface-variant text-[16px]">badge</span>
                      <span className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface-variant">
                        {staff.name}
                      </span>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
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
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="w-8 h-8 flex items-center justify-center border border-white/10 hover:border-primary/30 transition-colors"
                        data-testid={`edit-appointment-${booking.id}`}
                      >
                        <span className="material-symbols-outlined text-primary text-[16px]">edit</span>
                      </button>
                      <button
                        className="w-8 h-8 flex items-center justify-center border border-white/10 hover:border-error/30 transition-colors"
                        data-testid={`cancel-appointment-${booking.id}`}
                      >
                        <span className="material-symbols-outlined text-error text-[16px]">close</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
