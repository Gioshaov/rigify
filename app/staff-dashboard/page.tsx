import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ShiftStatusCard } from "./ShiftStatusCard";

export default async function StaffDashboardOverviewPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get staff record with business name
  const { data: staff } = await supabase
    .from("staff")
    .select("id, name, role, business_id, businesses(name)")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!staff) redirect("/login");

  const staffName = staff.name || "Staff Member";
  const businessName = (staff.businesses as any)?.name || "Your Business";

  const appointments = [
    {
      id: "1",
      time: "10:00",
      client: "Nino T.",
      service: "Gel Manicure",
      duration: "90 MIN",
      status: "COMPLETED" as const,
    },
    {
      id: "2",
      time: "12:00",
      client: "Ana M.",
      service: "Haircut & Blow Dry",
      duration: "90 MIN",
      status: "COMPLETED" as const,
    },
    {
      id: "3",
      time: "14:30",
      client: "Sarah K.",
      service: "Haircut & Blow Dry",
      duration: "90 MIN",
      status: "UPCOMING" as const,
    },
    {
      id: "4",
      time: "17:00",
      client: "Tamar G.",
      service: "Wash & Blow Dry",
      duration: "60 MIN",
      status: "UPCOMING" as const,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Section 1 - Greeting + Stats + Shift Card */}
      <div className="flex gap-6">
        {/* Left Column */}
        <div className="flex-1">
          <h1 className="text-white font-bold text-3xl">Good morning, {staffName}.</h1>
          <p className="text-zinc-400 text-sm mt-1">Here&apos;s your day at {businessName}.</p>

          {/* 2x2 Stat Cards Grid */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {/* Card 1 - Appointments Today */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
              <p className="text-zinc-500 uppercase tracking-widest text-[10px]">
                APPOINTMENTS TODAY
              </p>
              <p className="font-mono text-amber-400 text-2xl font-bold mt-1">04</p>
            </div>

            {/* Card 2 - Next Client */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
              <p className="text-zinc-500 uppercase tracking-widest text-[10px]">NEXT CLIENT</p>
              <p className="text-white font-bold text-base mt-1">Sarah K.</p>
              <p className="text-zinc-400 text-xs font-mono mt-0.5">14:30 · Haircut & Blow Dry</p>
            </div>

            {/* Card 3 - Earnings Today */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
              <p className="text-zinc-500 uppercase tracking-widest text-[10px]">EARNINGS TODAY</p>
              <p className="font-mono text-amber-400 text-2xl font-bold mt-1">₾140</p>
            </div>

            {/* Card 4 - Clients This Week */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-4">
              <p className="text-zinc-500 uppercase tracking-widest text-[10px]">
                CLIENTS THIS WEEK
              </p>
              <p className="font-mono text-amber-400 text-2xl font-bold mt-1">11</p>
            </div>
          </div>
        </div>

        {/* Right Column - Shift Status Card */}
        <ShiftStatusCard />
      </div>

      {/* Section 2 - Today's Schedule */}
      <div className="mt-8">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-0.5 h-4 bg-amber-400" />
          <h2 className="text-amber-400 uppercase tracking-widest text-[11px] font-bold">
            TODAY&apos;S SCHEDULE
          </h2>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[100px_1fr_1fr_80px_120px] text-zinc-500 uppercase tracking-widest text-[10px] px-4 pb-2 border-b border-zinc-800">
          <div>TIME</div>
          <div>CLIENT</div>
          <div>SERVICE</div>
          <div>DURATION</div>
          <div>STATUS</div>
        </div>

        {/* Appointment Rows */}
        <div className="space-y-1 mt-1">
          {appointments.map((apt) => {
            const isCompleted = apt.status === "COMPLETED";
            return (
              <div
                key={apt.id}
                className="grid grid-cols-[100px_1fr_1fr_80px_120px] items-center px-4 py-4 border-b border-zinc-800/50 bg-zinc-900 rounded-sm relative overflow-hidden"
              >
                {/* Left colored bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                    isCompleted ? "bg-green-500" : "bg-amber-400"
                  }`}
                />

                {/* Content wrapper with opacity for completed */}
                <div
                  className={`contents ${isCompleted ? "opacity-60" : ""}`}
                  data-testid={`appointment-row-${apt.id}`}
                >
                  <div
                    className={`font-mono text-sm ${
                      isCompleted ? "text-zinc-500" : "text-amber-400"
                    }`}
                  >
                    {apt.time}
                  </div>
                  <div
                    className={`font-semibold text-sm ${
                      isCompleted ? "text-zinc-400" : "text-white"
                    }`}
                  >
                    {apt.client}
                  </div>
                  <div className="text-zinc-400 text-sm">{apt.service}</div>
                  <div className="text-zinc-500 text-xs font-mono">{apt.duration}</div>
                  <div>
                    <span
                      className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm inline-block ${
                        isCompleted
                          ? "bg-green-950 text-green-400 border border-green-900/50"
                          : "bg-amber-950 text-amber-400 border border-amber-900/50"
                      }`}
                    >
                      {apt.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3 - Quick Actions */}
      <div className="mt-8">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-0.5 h-4 bg-amber-400" />
          <h2 className="text-amber-400 uppercase tracking-widest text-[11px] font-bold">
            QUICK ACTIONS
          </h2>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-3 gap-4">
          {/* Card 1 - Block Time Off */}
          <div className="bg-zinc-900 border border-dashed border-zinc-700 hover:border-amber-400/30 rounded-sm p-5 transition-all hover:-translate-y-0.5 cursor-pointer">
            <span className="material-symbols-outlined text-amber-400 text-[20px] mb-3 block">
              event_busy
            </span>
            <h3 className="text-white uppercase tracking-widest text-[11px] font-bold">
              BLOCK TIME OFF
            </h3>
            <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
              Update your availability and personal schedule.
            </p>
          </div>

          {/* Card 2 - Full Week View */}
          <div className="bg-zinc-900 border border-zinc-800 hover:border-amber-400/30 rounded-sm p-5 transition-all hover:-translate-y-0.5 cursor-pointer">
            <span className="material-symbols-outlined text-amber-400 text-[20px] mb-3 block">
              calendar_month
            </span>
            <h3 className="text-white uppercase tracking-widest text-[11px] font-bold">
              FULL WEEK VIEW
            </h3>
            <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
              Review your appointments for the next 7 days.
            </p>
          </div>

          {/* Card 3 - Client History */}
          <div className="bg-zinc-900 border border-zinc-800 hover:border-amber-400/30 rounded-sm p-5 transition-all hover:-translate-y-0.5 cursor-pointer">
            <span className="material-symbols-outlined text-amber-400 text-[20px] mb-3 block">
              history
            </span>
            <h3 className="text-white uppercase tracking-widest text-[11px] font-bold">
              CLIENT HISTORY
            </h3>
            <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
              Access previous services and style notes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
