'use client'

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { CalendarView } from "./CalendarView";
import { AppointmentsListView } from "./AppointmentsListView";

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

type Staff = {
  id: string;
  name: string;
};

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price_min: number;
};

type AppointmentsContentProps = {
  bookings: Booking[];
  staff: Staff[];
  services: Service[];
  businessId: string;
};

export function AppointmentsContent({ bookings, staff, services, businessId }: AppointmentsContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read from URL or use defaults
  const viewMode = (searchParams.get('view') as 'calendar' | 'list') || 'calendar';
  const statusFilter = searchParams.get('status') || 'all';
  const staffFilter = searchParams.get('staff') || 'all';

  // Helper to update URL params
  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      params.set(key, value);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    if (statusFilter !== 'all' && booking.status !== statusFilter) return false;

    if (staffFilter !== 'all') {
      if (!booking.staff) return false;

      // Check if the selected staff is assigned to this booking
      if (Array.isArray(booking.staff)) {
        // If staff is an array, check if any staff member matches
        const hasMatchingStaff = booking.staff.some(s => s.id === staffFilter);
        if (!hasMatchingStaff) return false;
      } else {
        // If staff is a single object, check if it matches
        if (booking.staff.id !== staffFilter) return false;
      }
    }

    return true;
  });

  // Get status counts
  const statusCounts = {
    all: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  return (
    <div>
      {/* View Toggle & Filters */}
      <div className="mb-8 space-y-6">
        {/* View Mode Toggle & Create Button */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
          <button
            onClick={() => updateFilters({ view: 'calendar' })}
            className={`
              px-6 py-3 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-medium transition-all
              ${viewMode === 'calendar'
                ? 'bg-primary text-background'
                : 'border border-white/10 text-on-surface hover:border-primary/30'
              }
            `}
            data-testid="calendar-view-btn"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              Calendar View
            </span>
          </button>
          <button
            onClick={() => updateFilters({ view: 'list' })}
            className={`
              px-6 py-3 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-medium transition-all
              ${viewMode === 'list'
                ? 'bg-primary text-background'
                : 'border border-white/10 text-on-surface hover:border-primary/30'
              }
            `}
            data-testid="list-view-btn"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">list</span>
              List View
            </span>
          </button>
          </div>

          {/* Create Appointment Button */}
          <Link
            href="/dashboard/appointments/new"
            className="bg-primary text-background px-8 py-3 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-all active:scale-95 flex items-center gap-2"
            data-testid="create-appointment-btn"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Create Appointment
          </Link>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
              Status:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateFilters({ status: 'all' })}
                className={`
                  px-4 py-2 font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase font-medium transition-all
                  ${statusFilter === 'all'
                    ? 'border-2 border-primary text-primary'
                    : 'border border-white/10 text-on-surface-variant hover:border-primary/30'
                  }
                `}
                data-testid="filter-all"
              >
                All ({statusCounts.all})
              </button>
              <button
                onClick={() => updateFilters({ status: 'confirmed' })}
                className={`
                  px-4 py-2 font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase font-medium transition-all
                  ${statusFilter === 'confirmed'
                    ? 'border-2 border-primary text-primary'
                    : 'border border-white/10 text-on-surface-variant hover:border-primary/30'
                  }
                `}
                data-testid="filter-confirmed"
              >
                Confirmed ({statusCounts.confirmed})
              </button>
              <button
                onClick={() => updateFilters({ status: 'pending' })}
                className={`
                  px-4 py-2 font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase font-medium transition-all
                  ${statusFilter === 'pending'
                    ? 'border-2 border-primary text-primary'
                    : 'border border-white/10 text-on-surface-variant hover:border-primary/30'
                  }
                `}
                data-testid="filter-pending"
              >
                Pending ({statusCounts.pending})
              </button>
              <button
                onClick={() => updateFilters({ status: 'completed' })}
                className={`
                  px-4 py-2 font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase font-medium transition-all
                  ${statusFilter === 'completed'
                    ? 'border-2 border-primary text-primary'
                    : 'border border-white/10 text-on-surface-variant hover:border-primary/30'
                  }
                `}
                data-testid="filter-completed"
              >
                Completed ({statusCounts.completed})
              </button>
            </div>
          </div>

          {/* Staff Filter */}
          {staff.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
                Staff:
              </span>
              <select
                value={staffFilter}
                onChange={(e) => updateFilters({ staff: e.target.value })}
                className="bg-surface-container border border-white/10 px-4 py-2 font-mono text-[10px] leading-[1] tracking-[0.2em] uppercase font-medium text-on-surface outline-none hover:border-primary/30 transition-colors"
                data-testid="staff-filter"
              >
                <option value="all">All Staff</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'calendar' ? (
        <CalendarView bookings={filteredBookings} businessId={businessId} />
      ) : (
        <AppointmentsListView bookings={filteredBookings} />
      )}
    </div>
  );
}
