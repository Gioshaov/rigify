"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserMenu } from "@/components/ui/UserMenu";
import { formatPrice, formatDuration } from "@/lib/utils/formatting";

interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_min: number;
  price_max: number;
}

interface Staff {
  id: string;
  name: string;
  specialty: string | null;
}

interface Business {
  id: string;
  name: string;
  slug: string;
}

interface BookAppointmentContentProps {
  business: Business;
  services: Service[];
  staff: Staff[];
  selectedService: Service | null;
}

// Generate calendar days for current month
function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0

  // Get today at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];

  // Previous month placeholders
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push({ day: null, disabled: true });
  }

  // Current month days - disable past dates
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    date.setHours(0, 0, 0, 0);
    const isPast = date < today;
    days.push({ day: i, disabled: isPast });
  }

  return days;
}

// Generate time slots from 9 AM to 9 PM in 15-minute intervals
function generateTimeSlots() {
  const slots = [];
  for (let hour = 9; hour < 21; hour++) {
    for (let min = 0; min < 60; min += 15) {
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const displayMin = min === 0 ? "00" : min;
      const timeString = `${displayHour}:${displayMin} ${ampm}`;
      slots.push(timeString);
    }
  }
  return slots;
}

export function BookAppointmentContent({
  business,
  services,
  staff,
  selectedService: initialSelectedService
}: BookAppointmentContentProps) {
  const router = useRouter();

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null); // null = "Any Staff"
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Use the service from props
  const selectedService = initialSelectedService;

  const calendarDays = generateCalendarDays(currentYear, currentMonth);
  const timeSlots = generateTimeSlots();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Fetch available slots when date or service changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate || !selectedService) {
        setAvailableSlots([]);
        return;
      }

      setIsLoadingAvailability(true);
      setBookingError(null);

      const bookingDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;

      try {
        const staffParam = selectedStaff && selectedStaff !== "any" ? `&staffId=${selectedStaff}` : '';
        const response = await fetch(
          `/api/availability?businessId=${business.id}&serviceId=${selectedService.id}&date=${bookingDate}${staffParam}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch availability');
        }

        const data = await response.json();
        // Convert 24-hour slots to 12-hour format to match UI
        const slots12h = data.slots.map((slot24: string) => {
          const [hours, minutes] = slot24.split(':').map(Number);
          const ampm = hours >= 12 ? "PM" : "AM";
          const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
          const displayMin = minutes === 0 ? "00" : minutes;
          return `${displayHour}:${displayMin} ${ampm}`;
        });
        setAvailableSlots(slots12h);
      } catch (error) {
        console.error('Error fetching availability:', error);
        setBookingError('Failed to load available slots. Please try again.');
        setAvailableSlots([]);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, currentMonth, currentYear, selectedService, selectedStaff, business.id]);

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

  const formattedSummary = selectedDate && selectedTime
    ? `${monthNames[currentMonth].slice(0, 3)} ${selectedDate}, ${currentYear} at ${selectedTime}`
    : "Select date and time";

  // Helper function to convert 12-hour time to 24-hour format
  const convertTo24Hour = (time12: string): string => {
    const [time, period] = time12.split(' ');
    let [hours, minutes] = time.split(':');

    if (period === 'PM' && hours !== '12') {
      hours = String(Number(hours) + 12);
    } else if (period === 'AM' && hours === '12') {
      hours = '00';
    }

    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setIsBooking(true);
    setBookingError(null);

    const bookingDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    const time24 = convertTo24Hour(selectedTime);

    try {
      // Call the production-ready /api/bookings endpoint
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: business.id,
          serviceId: selectedService.id,
          date: bookingDate,
          startTime: time24,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || undefined,
          staffId: selectedStaff === "any" ? null : selectedStaff // "any" = auto-assign
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setIsBooking(false);
        setBookingError(result.error || 'Failed to create booking. Please try again.');
        return;
      }

      // Success - redirect to confirmation page
      router.push(`/businesses/${business.slug}/booking-confirmed?id=${result.bookingId}`);
    } catch (error) {
      setIsBooking(false);
      setBookingError('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 w-full z-50 flex items-center justify-between px-margin-mobile md:px-margin-desktop h-16 bg-surface border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            data-testid="back-btn"
            onClick={() => router.back()}
            className="text-on-surface active:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <Link data-testid="logo-link" href="/">
            <span className="font-hanken text-[32px] leading-[40px] font-bold text-primary tracking-tighter">
              RIGIFY
            </span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex gap-6">
            <Link
              data-testid="nav-home"
              href="/"
              className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface hover:text-primary transition-colors duration-200"
            >
              HOME
            </Link>
            <Link
              data-testid="nav-browse"
              href="/businesses?view=list"
              className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface hover:text-primary transition-colors duration-200"
            >
              BROWSE
            </Link>
            <Link
              data-testid="nav-my-bookings"
              href="/customer/dashboard"
              className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-primary transition-colors duration-200"
            >
              MY BOOKINGS
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span data-testid="language-toggle" className="material-symbols-outlined text-primary">language</span>
          <UserMenu />
        </div>
      </header>

      <main className="flex-grow w-full max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-8 mb-24">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-4">
            <h1 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary uppercase tracking-widest">
              Select Date & Time
            </h1>
            <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-muted-gold">
              STEP 03 / 05
            </span>
          </div>
          <div className="w-full h-1 bg-white/5 relative">
            <div
              className="absolute top-0 left-0 h-full bg-primary transition-all duration-500"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left Column: Calendar */}
          <section className="lg:col-span-7 bg-surface-container-low p-6 md:p-8 border border-white/10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-hanken text-[24px] leading-[1.3] font-semibold text-pure-white">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <div className="flex gap-4">
                <button
                  data-testid="calendar-prev-month-btn"
                  onClick={handlePrevMonth}
                  className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface">
                    chevron_left
                  </span>
                </button>
                <button
                  data-testid="calendar-next-month-btn"
                  onClick={handleNextMonth}
                  className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>

            {/* Calendar Header */}
            <div className="grid grid-cols-7 text-center mb-4">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
                <div
                  key={day}
                  className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold pb-4"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dayObj, index) => (
                <div
                  key={index}
                  data-testid={dayObj.day ? `calendar-day-${dayObj.day}` : `calendar-day-empty-${index}`}
                  className={`
                    aspect-square flex items-center justify-center font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium border transition-all
                    ${
                      dayObj.disabled
                        ? "text-on-surface-variant/20 border-white/5 cursor-not-allowed"
                        : dayObj.day === selectedDate
                        ? "bg-primary text-background border-primary cursor-pointer"
                        : "text-on-surface border-white/5 hover:bg-surface-variant hover:border-primary/30 cursor-pointer"
                    }
                  `}
                  onClick={() => !dayObj.disabled && dayObj.day && setSelectedDate(dayObj.day)}
                >
                  {dayObj.day || ""}
                </div>
              ))}
            </div>
          </section>

          {/* Right Column: Time Slots */}
          <section className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-surface-container-low border border-white/10 p-6 md:p-8 flex-grow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-muted-gold">
                  AVAILABLE SLOTS
                </h3>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    schedule
                  </span>
                  <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface">
                    {selectedDate || "—"} {monthNames[currentMonth].slice(0, 3).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Staff Selection Dropdown */}
              {staff.length > 0 && (
                <div className="mb-6">
                  <label
                    htmlFor="staff-select"
                    className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-primary uppercase block mb-2"
                  >
                    Select Staff Member <span className="text-error">*</span>
                  </label>
                  <select
                    id="staff-select"
                    data-testid="staff-select"
                    value={selectedStaff ?? ""}
                    onChange={(e) => setSelectedStaff(e.target.value || null)}
                    className="w-full bg-surface-container-low border border-white/10 focus:border-primary px-4 py-3 font-mono text-[12px] tracking-[0.15em] font-medium text-primary uppercase outline-none appearance-none cursor-pointer transition-colors"
                    required
                  >
                    <option value="" disabled>
                      Choose your staff member...
                    </option>
                    <option value="any">Any Available Staff</option>
                    {staff.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isLoadingAvailability ? (
                <div className="h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin rounded-full mx-auto mb-3"></div>
                    <p className="font-mono text-[10px] tracking-[0.2em] text-on-surface-variant">LOADING SLOTS...</p>
                  </div>
                </div>
              ) : !selectedDate ? (
                <div className="h-[400px] flex items-center justify-center">
                  <p className="font-mono text-[12px] tracking-[0.15em] text-on-surface-variant">SELECT A DATE FIRST</p>
                </div>
              ) : (
                <div className="h-[400px] overflow-y-auto pr-4 grid grid-cols-2 gap-2">
                  {timeSlots.map((time) => {
                    const isAvailable = availableSlots.includes(time);
                    const isDisabled = !isAvailable;

                    return (
                      <button
                        key={time}
                        data-testid={`time-slot-${time.replace(/[:\s]/g, '-').toLowerCase()}`}
                        onClick={() => !isDisabled && setSelectedTime(time)}
                        disabled={isDisabled}
                        className={`
                          p-3 font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium border transition-all
                          ${
                            isDisabled
                              ? "bg-surface/50 text-on-surface-variant/30 border-white/5 cursor-not-allowed line-through"
                              : time === selectedTime
                              ? "bg-primary text-background border-primary cursor-pointer"
                              : "bg-surface text-on-surface-variant border-white/5 hover:border-primary hover:bg-surface-variant active:scale-95 cursor-pointer"
                          }
                        `}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Summary & CTA */}
            <div className="bg-surface-elevated border border-primary/20 p-6">
              {/* Service Info */}
              {selectedService ? (
                <div className="mb-6 pb-6 border-b border-white/10">
                  <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold mb-2">
                    SELECTED SERVICE
                  </p>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-hanken text-[20px] leading-[1.3] font-semibold text-primary mb-1">
                        {selectedService.name}
                      </h3>
                      {selectedService.description && (
                        <p className="font-mono text-[11px] leading-[1.4] tracking-[0.1em] text-on-surface-variant">
                          {selectedService.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="material-symbols-outlined text-primary text-[16px]">schedule</span>
                        <span className="font-mono text-[11px] leading-[1] tracking-[0.15em] font-medium text-on-surface">
                          {formatDuration(selectedService.duration_minutes)}
                        </span>
                      </div>
                    </div>
                    <span className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-primary">
                      {formatPrice(selectedService.price_min ?? 0, selectedService.price_max)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mb-6 pb-6 border-b border-white/10">
                  <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-error mb-2">
                    NO SERVICE SELECTED
                  </p>
                  <p className="font-hanken text-[14px] leading-[1.5] text-on-surface-variant">
                    Please go back and select a service to continue.
                  </p>
                </div>
              )}

              {/* Date & Time Summary */}
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
                <div>
                  <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold">
                    DATE & TIME
                  </p>
                  <p className="font-hanken text-[16px] leading-[1.6] font-normal text-pure-white">
                    {formattedSummary}
                  </p>
                </div>
                <span
                  className="material-symbols-outlined text-primary scale-125"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {selectedService && selectedDate && selectedTime ? "check_circle" : "schedule"}
                </span>
              </div>

              {/* Customer Details Form */}
              <div className="mb-6">
                <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold mb-4">
                  YOUR DETAILS
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-2">
                      Full Name *
                    </label>
                    <input
                      data-testid="customer-name-input"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-surface border border-white/10 px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-2">
                      Phone Number *
                    </label>
                    <input
                      data-testid="customer-phone-input"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="5XX XXX XXX"
                      className="w-full bg-surface border border-white/10 px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-2">
                      Email (Optional)
                    </label>
                    <input
                      data-testid="customer-email-input"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-surface border border-white/10 px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {bookingError && (
                <div className="mb-4 p-4 bg-error/10 border border-error/20">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-error text-[18px]">error</span>
                    <p className="font-hanken text-[14px] leading-[1.5] text-error">
                      {bookingError}
                    </p>
                  </div>
                </div>
              )}

              <button
                data-testid="confirm-booking-btn"
                onClick={handleConfirmBooking}
                disabled={!selectedService || !selectedDate || !selectedTime || !customerName.trim() || !customerPhone.trim() || (staff.length > 0 && !selectedStaff) || isBooking}
                className="w-full bg-primary text-background font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium py-4 hover:bg-primary-fixed-dim transition-all active:scale-[0.98] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBooking ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-background border-t-transparent animate-spin rounded-full"></div>
                    Creating Booking...
                  </span>
                ) : (
                  selectedService ? "Confirm Booking" : "Select Service First"
                )}
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface h-20 px-margin-mobile border-t border-white/10">
        <Link data-testid="mobile-nav-home" href="/" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">home</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Home
          </span>
        </Link>
        <Link data-testid="mobile-nav-browse" href="/businesses?view=list" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">search</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Browse
          </span>
        </Link>
        <Link
          data-testid="mobile-nav-my-bookings"
          href="/customer/dashboard"
          className="flex flex-col items-center justify-center text-primary border-t-2 border-primary pt-1"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            event_available
          </span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            My Bookings
          </span>
        </Link>
        <Link data-testid="mobile-nav-business" href="/for-businesses" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">business_center</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Business
          </span>
        </Link>
      </nav>
    </div>
  );
}
