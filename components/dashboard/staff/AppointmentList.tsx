"use client";

import { useState } from "react";

type AppointmentStatus = "CONFIRMED" | "PENDING" | "COMPLETED" | "NO-SHOW";

type Appointment = {
  id: string;
  day: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  clientName: string;
  clientPhone: string;
  service: string;
  duration: string;
  status: AppointmentStatus;
};

const initialAppointments: Appointment[] = [
  {
    id: "1",
    day: "MON",
    date: "09",
    timeStart: "14:00",
    timeEnd: "15:30",
    clientName: "Ana Beridze",
    clientPhone: "+995 599 111 001",
    service: "Haircut & Blow Dry",
    duration: "90 MIN SESSION",
    status: "CONFIRMED",
  },
  {
    id: "2",
    day: "TUE",
    date: "10",
    timeStart: "10:00",
    timeEnd: "11:00",
    clientName: "Giorgi Makharadze",
    clientPhone: "+995 599 111 002",
    service: "Beard Trim",
    duration: "60 MIN SESSION",
    status: "PENDING",
  },
  {
    id: "3",
    day: "TUE",
    date: "10",
    timeStart: "11:30",
    timeEnd: "12:30",
    clientName: "Elena Kvaratskhelia",
    clientPhone: "+995 599 111 003",
    service: "Manicure",
    duration: "60 MIN SESSION",
    status: "CONFIRMED",
  },
  {
    id: "4",
    day: "MON",
    date: "09",
    timeStart: "09:00",
    timeEnd: "10:00",
    clientName: "David Tsereteli",
    clientPhone: "+995 599 111 004",
    service: "Classic Shave",
    duration: "60 MIN SESSION",
    status: "COMPLETED",
  },
  {
    id: "5",
    day: "SUN",
    date: "08",
    timeStart: "16:00",
    timeEnd: "17:00",
    clientName: "Mariam Japaridze",
    clientPhone: "+995 599 111 005",
    service: "Hair Coloring",
    duration: "60 MIN SESSION",
    status: "NO-SHOW",
  },
];

export function AppointmentList() {
  const [filter, setFilter] = useState<"UPCOMING" | "ALL">("UPCOMING");
  const [searchQuery, setSearchQuery] = useState("");
  const [appointments, setAppointments] = useState(initialAppointments);
  const [phoneVisible, setPhoneVisible] = useState<Record<string, boolean>>({});

  const togglePhone = (id: string) => {
    setPhoneVisible((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const markComplete = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: "COMPLETED" as AppointmentStatus } : apt))
    );
  };

  const markNoShow = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: "NO-SHOW" as AppointmentStatus } : apt))
    );
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-900/40 text-green-400 border border-green-800";
      case "PENDING":
        return "bg-amber-900/40 text-amber-400 border border-amber-800";
      case "COMPLETED":
        return "bg-zinc-800 text-zinc-500 border-0";
      case "NO-SHOW":
        return "bg-red-900/40 text-red-400 border border-red-800";
    }
  };

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold text-on-surface mb-3">
          My Appointments
        </h1>
        <p className="font-hanken text-[14px] leading-[1.5] font-normal text-on-surface-variant">
          Your upcoming schedule for the current session.
        </p>
      </div>

      {/* Controls Row */}
      <div className="mb-8 flex items-center gap-4">
        {/* LEFT: Toggle Pills */}
        <div className="flex gap-2">
          <button
            data-testid="appointments-filter-upcoming-btn"
            onClick={() => setFilter("UPCOMING")}
            className={`px-6 py-2 font-mono text-xs uppercase tracking-widest transition-all ${
              filter === "UPCOMING"
                ? "bg-primary text-on-primary font-bold"
                : "bg-surface-container-low text-on-surface-variant border border-outline-variant"
            }`}
          >
            UPCOMING
          </button>
          <button
            data-testid="appointments-filter-all-btn"
            onClick={() => setFilter("ALL")}
            className={`px-6 py-2 font-mono text-xs uppercase tracking-widest transition-all ${
              filter === "ALL"
                ? "bg-primary text-on-primary font-bold"
                : "bg-surface-container-low text-on-surface-variant border border-outline-variant"
            }`}
          >
            ALL
          </button>
        </div>

        {/* CENTER: Search Input */}
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant">
            search
          </span>
          <input
            data-testid="appointments-search-input"
            type="text"
            placeholder="SEARCH APPOINTMENTS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border border-white/10 pl-12 pr-4 py-3 text-on-surface font-mono text-xs uppercase tracking-widest placeholder:text-on-surface-variant/60 focus:border-primary outline-none transition-colors"
          />
        </div>

        {/* RIGHT: Count */}
        <div className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">
          ● {appointments.length} APPOINTMENTS
        </div>
      </div>

      {/* Appointment Cards */}
      <div className="space-y-4 mb-8">
        {appointments.map((apt) => {
          const isActive = apt.status === "CONFIRMED" || apt.status === "PENDING";
          const isNoShow = apt.status === "NO-SHOW";

          return (
            <div
              key={apt.id}
              data-testid={`appointment-card-${apt.id}`}
              className={`bg-surface border-l-4 border-amber-400 border border-l-4 border-outline-variant/20 p-6 flex items-center gap-6 ${
                !isActive ? "opacity-60" : ""
              }`}
            >
              {/* DATE/TIME Block */}
              <div className="w-[120px] shrink-0">
                <div
                  className={`font-mono text-sm font-bold uppercase tracking-wider mb-1 ${
                    isNoShow ? "text-red-400" : "text-on-surface"
                  }`}
                >
                  {apt.day} {apt.date}
                </div>
                <div className="font-mono text-xs text-primary tracking-wider">
                  {apt.timeStart} – {apt.timeEnd}
                </div>
              </div>

              {/* CLIENT Block */}
              <div className="w-[180px] shrink-0 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-surface-container-high shrink-0" />
                <div>
                  <div className="font-hanken text-sm font-bold text-on-surface mb-1">
                    {apt.clientName}
                  </div>
                  <div className="font-mono text-[10px] text-primary uppercase tracking-wider">
                    {apt.duration}
                  </div>
                </div>
              </div>

              {/* SERVICE */}
              <div className="flex-1 font-mono text-xs uppercase tracking-widest text-on-surface">
                {apt.service}
              </div>

              {/* STATUS Badge */}
              <div
                className={`px-3 py-1 font-mono text-[10px] uppercase tracking-widest ${getStatusBadge(
                  apt.status
                )}`}
              >
                {apt.status}
              </div>

              {/* PHONE Icon Button (only for active) */}
              {isActive && (
                <div className="flex items-center gap-2">
                  <button
                    data-testid={`appointment-phone-btn-${apt.id}`}
                    onClick={() => togglePhone(apt.id)}
                    className="w-8 h-8 bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                      phone
                    </span>
                  </button>
                  {phoneVisible[apt.id] && (
                    <span className="font-mono text-xs text-on-surface-variant">
                      {apt.clientPhone}
                    </span>
                  )}
                </div>
              )}

              {/* THREE-DOT Icon (only for active) */}
              {isActive && (
                <div className="w-8 h-8 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant/60">
                    more_vert
                  </span>
                </div>
              )}

              {/* ACTION BUTTONS (only for active) */}
              {isActive && (
                <div className="flex gap-2">
                  <button
                    data-testid={`appointment-complete-btn-${apt.id}`}
                    onClick={() => markComplete(apt.id)}
                    className="bg-green-900 hover:bg-green-800 text-white text-xs uppercase tracking-widest px-4 py-2 transition-colors font-mono"
                  >
                    COMPLETE
                  </button>
                  <button
                    data-testid={`appointment-noshow-btn-${apt.id}`}
                    onClick={() => markNoShow(apt.id)}
                    className="bg-red-900 hover:bg-red-800 text-white text-xs uppercase tracking-widest px-4 py-2 transition-colors font-mono"
                  >
                    NO-SHOW
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      <div className="bg-surface border border-dashed border-outline-variant/40 p-16 flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-4">
          event
        </span>
        <div className="font-hanken text-sm text-on-surface mb-2">No more appointments</div>
        <div className="font-hanken text-xs text-on-surface-variant">
          You&apos;re all caught up for the selected period.
        </div>
      </div>
    </div>
  );
}
