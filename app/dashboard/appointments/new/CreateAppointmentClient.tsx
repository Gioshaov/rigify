'use client'

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAppointment } from "../actions";
import { MONTH_NAMES } from "@/lib/utils/calendar";

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price_min: number | null;
  price_max: number | null;
};

type Staff = {
  id: string;
  name: string;
  specialty: string | null;
};

type CreateAppointmentClientProps = {
  businessId: string;
  services: Service[];
  staff: Staff[];
};

export function CreateAppointmentClient({
  businessId,
  services,
  staff,
}: CreateAppointmentClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [notes, setNotes] = useState("");

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];

    // Previous month placeholders
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - i),
        isDisabled: true,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      date.setHours(0, 0, 0, 0);
      const isPast = date < today;
      days.push({
        day: i,
        isCurrentMonth: true,
        date: date,
        isToday: date.getTime() === today.getTime(),
        isDisabled: isPast,
      });
    }

    // Next month placeholders
    const remainingDays = 42 - days.length; // 6 rows x 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth + 1, i),
        isDisabled: true,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Generate time slots (9 AM to 9 PM, 30-minute intervals)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 9; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 21 && minute > 0) break; // Stop at 21:00
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (date: Date, isCurrentMonth: boolean, isDisabled: boolean) => {
    if (!isCurrentMonth || isDisabled) return;
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!selectedServiceId) {
      setError("Please select a service");
      return;
    }

    if (!selectedDate) {
      setError("Please select a date");
      return;
    }

    if (!selectedTime) {
      setError("Please select a time");
      return;
    }

    setLoading(true);

    const formattedDate = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;

    const result = await createAppointment({
      businessId,
      serviceId: selectedServiceId,
      staffId: selectedStaffId || null,
      date: formattedDate,
      startTime: selectedTime,
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      notes: notes || undefined,
    });

    if (result.success) {
      router.push('/dashboard/appointments');
    } else {
      setError(result.message || "Failed to create appointment");
      setLoading(false);
    }
  };

  const selectedService = services.find(s => s.id === selectedServiceId);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <Link
          data-testid="back-to-appointments-link"
          href="/dashboard/appointments"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase">
            Back to Appointments
          </span>
        </Link>
        <h1 className="font-hanken text-[32px] leading-[1.2] tracking-tighter font-bold text-white">
          Create New Appointment
        </h1>
        <p className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface-variant mt-2">
          Manually book an appointment for a walk-in customer or phone call
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Message */}
        {error && (
          <div data-testid="appointment-error-message" className="p-4 border border-error bg-error/10">
            <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] text-error uppercase">
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Customer Information */}
        <div className="bg-surface-container border border-white/10 p-6">
          <h2 className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-bold text-primary uppercase mb-6">
            Customer Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customerName" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
                Customer Name *
              </label>
              <input
                data-testid="customer-name-input"
                id="customerName"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. John Smith"
                className="w-full bg-background border border-white/10 focus:border-primary px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-colors font-hanken text-[14px] leading-[1.5]"
              />
            </div>
            <div>
              <label htmlFor="customerPhone" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
                Phone Number *
              </label>
              <input
                data-testid="customer-phone-input"
                id="customerPhone"
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="555123456"
                className="w-full bg-background border border-white/10 focus:border-primary px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-colors font-hanken text-[14px] leading-[1.5]"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="customerEmail" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
                Email (Optional)
              </label>
              <input
                data-testid="customer-email-input"
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full bg-background border border-white/10 focus:border-primary px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-colors font-hanken text-[14px] leading-[1.5]"
              />
            </div>
          </div>
        </div>

        {/* Service Selection */}
        <div className="bg-surface-container border border-white/10 p-6">
          <h2 className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-bold text-primary uppercase mb-6">
            Service Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="service" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
                Service *
              </label>
              <select
                data-testid="service-select"
                id="service"
                required
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full bg-background border border-white/10 focus:border-primary px-4 py-3 text-on-surface outline-none transition-colors font-hanken text-[14px] leading-[1.5]"
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.duration_minutes} min)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="staff" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
                Staff Member
              </label>
              <select
                data-testid="staff-select"
                id="staff"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full bg-background border border-white/10 focus:border-primary px-4 py-3 text-on-surface outline-none transition-colors font-hanken text-[14px] leading-[1.5]"
              >
                <option value="">Any Available</option>
                {staff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.specialty ? `- ${member.specialty}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {selectedService && (
            <div className="mt-4 p-4 bg-background border border-white/5">
              <p className="font-hanken text-[14px] leading-[1.5] text-on-surface-variant">
                Duration: <span className="text-white">{selectedService.duration_minutes} minutes</span>
                {(selectedService.price_min !== null || selectedService.price_max !== null) && (
                  <>
                    {" • "}
                    Price: <span className="text-white">
                      {selectedService.price_min === selectedService.price_max
                        ? `₾${(selectedService.price_min ?? 0).toFixed(0)}`
                        : `₾${(selectedService.price_min ?? 0).toFixed(0)} - ₾${(selectedService.price_max ?? 0).toFixed(0)}`}
                    </span>
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Date & Time Selection */}
        <div className="bg-surface-container border border-white/10 p-6">
          <h2 className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-bold text-primary uppercase mb-6">
            Date & Time
          </h2>

          {/* Calendar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-hanken text-[20px] leading-[1.3] font-semibold text-white">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="calendar-prev-month-btn"
                  onClick={handlePrevMonth}
                  className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-primary/30 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary">chevron_left</span>
                </button>
                <button
                  type="button"
                  data-testid="calendar-next-month-btn"
                  onClick={handleNextMonth}
                  className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-primary/30 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                <div key={day} className="text-center">
                  <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase">
                    {day}
                  </span>
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((dayObj) => {
                const isSelected = selectedDate?.getTime() === dayObj.date.getTime();
                return (
                  <button
                    type="button"
                    key={dayObj.date.toISOString()}
                    data-testid={`calendar-day-${dayObj.day}`}
                    onClick={() => handleDateClick(dayObj.date, dayObj.isCurrentMonth, dayObj.isDisabled)}
                    disabled={!dayObj.isCurrentMonth || dayObj.isDisabled}
                    className={`
                      aspect-square flex items-center justify-center border transition-all
                      ${
                        !dayObj.isCurrentMonth || dayObj.isDisabled
                          ? "text-on-surface-variant/20 border-white/5 cursor-not-allowed"
                          : isSelected
                          ? "bg-primary/10 border-primary text-primary cursor-pointer"
                          : dayObj.isToday
                          ? "border-primary text-primary cursor-pointer hover:bg-surface-variant"
                          : "text-on-surface border-white/5 hover:bg-surface-variant hover:border-primary/30 cursor-pointer"
                      }
                    `}
                  >
                    <span className="font-hanken text-[14px] leading-[1.5] font-normal">
                      {dayObj.day}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Dropdown */}
          {selectedDate && (
            <div>
              <label htmlFor="timeSlot" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
                Select Time *
              </label>
              <select
                data-testid="time-slot-select"
                id="timeSlot"
                required
                value={selectedTime || ""}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full bg-background border border-white/10 focus:border-primary px-4 py-3 text-on-surface outline-none transition-colors font-hanken text-[14px] leading-[1.5]"
              >
                <option value="">Select a time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-surface-container border border-white/10 p-6">
          <label htmlFor="notes" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
            Notes (Optional)
          </label>
          <textarea
            data-testid="appointment-notes-textarea"
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special requests or notes..."
            className="w-full bg-background border border-white/10 focus:border-primary px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-colors font-hanken text-[14px] leading-[1.5] resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            data-testid="create-appointment-btn"
            disabled={loading}
            className="flex-1 bg-primary text-on-primary py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-container active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Appointment"}
          </button>
          <Link
            data-testid="cancel-create-link"
            href="/dashboard/appointments"
            className="flex-1 bg-transparent border border-white/10 text-on-surface-variant hover:text-primary hover:border-primary/30 py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold transition-all text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
