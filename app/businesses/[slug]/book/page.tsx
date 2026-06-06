"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// Generate calendar days for current month
function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0

  const days = [];

  // Previous month placeholders
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push({ day: null, disabled: true });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, disabled: false });
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

export default function BookAppointmentPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(12);
  const [selectedTime, setSelectedTime] = useState<string>("10:15 AM");

  const calendarDays = generateCalendarDays(currentYear, currentMonth);
  const timeSlots = generateTimeSlots();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
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

  const formattedSummary = selectedDate && selectedTime
    ? `${monthNames[currentMonth].slice(0, 3)} ${selectedDate}, ${currentYear} at ${selectedTime}`
    : "Select date and time";

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 w-full z-50 flex items-center justify-between px-margin-mobile md:px-margin-desktop h-16 bg-surface border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-on-surface active:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <Link href="/">
            <span className="font-hanken text-[32px] leading-[40px] font-bold text-primary tracking-tighter">
              RIGIFY
            </span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex gap-6">
            <Link
              href="/"
              className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface hover:text-primary transition-colors duration-200"
            >
              HOME
            </Link>
            <Link
              href="/businesses"
              className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface hover:text-primary transition-colors duration-200"
            >
              BROWSE
            </Link>
            <Link
              href="/customer/dashboard"
              className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-primary transition-colors duration-200"
            >
              MY BOOKINGS
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary">language</span>
          {user && (
            <div className="w-10 h-10 bg-surface-container-high border border-white/10 overflow-hidden">
              <Image
                src={user.user_metadata?.avatar_url || "/default-avatar.png"}
                alt="User Profile"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          )}
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
                  onClick={handlePrevMonth}
                  className="w-10 h-10 flex items-center justify-center border border-white/10 hover:border-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-on-surface">
                    chevron_left
                  </span>
                </button>
                <button
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
                  className={`
                    aspect-square flex items-center justify-center font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium border
                    ${
                      dayObj.disabled
                        ? "text-on-surface-variant/20"
                        : dayObj.day === selectedDate
                        ? "bg-primary text-background border-primary"
                        : "text-on-surface border-white/5 hover:bg-surface-variant cursor-pointer transition-colors"
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
              <div className="h-[400px] overflow-y-auto pr-4 grid grid-cols-2 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`
                      p-3 font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium border transition-all
                      ${
                        time === selectedTime
                          ? "bg-primary text-background border-primary"
                          : "bg-surface text-on-surface-variant border-white/5 hover:border-primary/50"
                      }
                    `}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary & CTA */}
            <div className="bg-surface-elevated border border-primary/20 p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold">
                    SELECTED APPOINTMENT
                  </p>
                  <p className="font-hanken text-[18px] leading-[1.6] font-normal text-pure-white">
                    {formattedSummary}
                  </p>
                </div>
                <span
                  className="material-symbols-outlined text-primary scale-125"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <button className="w-full bg-primary text-background font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium py-4 hover:bg-primary-fixed-dim transition-all active:scale-[0.98] uppercase">
                Confirm Booking
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface h-20 px-margin-mobile border-t border-white/10">
        <Link href="/" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">home</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Home
          </span>
        </Link>
        <Link href="/businesses" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">search</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Browse
          </span>
        </Link>
        <Link
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
        <Link href="/for-businesses" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">business_center</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Business
          </span>
        </Link>
      </nav>
    </div>
  );
}
