import { createClient } from "@/lib/supabase/server";
import { formatTbilisi } from "@/lib/utils/datetime";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardOverviewPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch business data
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name, city, salome_enabled, is_active")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) redirect("/login");

  // Fetch today's appointments and staff in parallel
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const [appointmentsResult, staffResult] = await Promise.all([
    supabase
      .from("bookings")
      .select(
        `
        id,
        customer_name,
        appointment_datetime,
        status,
        price,
        services!left(name),
        staff!left(name)
      `
      )
      .eq("business_id", business.id)
      .gte("appointment_datetime", startOfDay.toISOString())
      .lt("appointment_datetime", endOfDay.toISOString())
      .neq("status", "cancelled")
      .order("appointment_datetime", { ascending: true }),
    supabase
      .from("staff")
      .select("id, name, role, is_active")
      .eq("business_id", business.id)
      .order("name", { ascending: true }),
  ]);

  const todaysAppointments = (appointmentsResult.data || []).map((booking) => ({
    ...booking,
    services: Array.isArray(booking.services) ? booking.services[0] : booking.services,
    staff: Array.isArray(booking.staff) ? booking.staff[0] : booking.staff,
  }));

  // Calculate stats
  const appointmentsToday = todaysAppointments.length;
  const completedToday = todaysAppointments.filter((a) => a.status === "completed").length;
  const remainingToday = todaysAppointments.filter((a) =>
    ["confirmed", "pending"].includes(a.status)
  ).length;
  const revenueToday = todaysAppointments.reduce(
    (sum, a) => sum + (a.price ? Number(a.price) : 0),
    0
  );

  const activeStaff = staffResult.data || [];

  // Format date for greeting
  const now = new Date();
  const weekday = formatTbilisi(now, "EEEE");
  const formattedDate = formatTbilisi(now, "MMMM d, yyyy");

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top Greeting */}
      <div className="mb-6">
        <h1 className="text-white font-bold text-3xl">Good morning, {business.name}.</h1>
        <p className="text-zinc-400 font-mono text-sm mt-1">
          {weekday}, {formattedDate} · {business.city || "Tbilisi"}
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {/* Card 1 - Appointments Today */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-5 relative">
          <span className="material-symbols-outlined absolute top-5 right-5 text-[20px] text-zinc-600">
            event
          </span>
          <p className="text-zinc-500 uppercase tracking-widest text-[10px]">APPOINTMENTS TODAY</p>
          <p className="font-mono text-amber-400 text-3xl font-bold mt-2">{appointmentsToday}</p>
          <p className="text-zinc-500 text-xs mt-1">
            {completedToday} completed · {remainingToday} remaining
          </p>
        </div>

        {/* Card 2 - Salome AI */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-5 relative">
          <span className="material-symbols-outlined absolute top-5 right-5 text-[20px] text-zinc-600">
            mic
          </span>
          <p className="text-zinc-500 uppercase tracking-widest text-[10px]">SALOME AI</p>
          <div className="flex items-center gap-2 mt-2">
            {business.salome_enabled && (
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            )}
            <p
              className={`font-mono text-xl font-bold ${
                business.salome_enabled ? "text-green-400" : "text-zinc-500"
              }`}
            >
              {business.salome_enabled ? "Active" : "Inactive"}
            </p>
          </div>
          <p className="text-zinc-500 text-xs mt-1">
            {business.salome_enabled ? "Handling calls" : "Not configured"}
          </p>
        </div>

        {/* Card 3 - Revenue Today */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-5 relative">
          <span className="material-symbols-outlined absolute top-5 right-5 text-[20px] text-zinc-600">
            payments
          </span>
          <p className="text-zinc-500 uppercase tracking-widest text-[10px]">REVENUE TODAY</p>
          <p className="font-mono text-amber-400 text-3xl font-bold mt-2">
            ₾{revenueToday.toFixed(0)}
          </p>
          <p className="text-zinc-500 text-xs mt-1">From {appointmentsToday} appointments</p>
        </div>

        {/* Card 4 - Business Status */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-5 relative">
          <span className="material-symbols-outlined absolute top-5 right-5 text-[20px] text-zinc-600">
            store
          </span>
          <p className="text-zinc-500 uppercase tracking-widest text-[10px]">BUSINESS STATUS</p>
          <p
            className={`font-mono text-xl font-bold mt-2 ${
              business.is_active ? "text-green-400" : "text-zinc-500"
            }`}
          >
            {business.is_active ? "Live" : "Inactive"}
          </p>
          <p className="text-zinc-500 text-xs mt-1">
            {business.is_active ? "Accepting bookings" : "Profile not published"}
          </p>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="flex gap-6">
        {/* Left Column - Today's Schedule */}
        <div className="flex-1">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-0.5 h-4 bg-amber-400" />
              <h2 className="text-amber-400 uppercase tracking-widest text-[11px] font-bold">
                TODAY'S SCHEDULE
              </h2>
            </div>
            <Link
              href="/dashboard/appointments"
              className="text-zinc-500 hover:text-amber-400 text-xs transition-colors"
            >
              VIEW ALL →
            </Link>
          </div>

          {/* Appointments List */}
          {todaysAppointments.length > 0 ? (
            <div className="space-y-1.5">
              {todaysAppointments.map((apt) => {
                const isCompleted = apt.status === "completed";
                return (
                  <div
                    key={apt.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-sm px-4 py-3 grid grid-cols-[70px_1fr_1fr_90px_110px] items-center relative overflow-hidden"
                  >
                    {/* Left colored bar */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                        isCompleted ? "bg-green-500" : "bg-amber-400"
                      }`}
                    />

                    {/* Content */}
                    <div className={`contents ${isCompleted ? "opacity-60" : ""}`}>
                      <div
                        className={`font-mono text-sm ${
                          isCompleted ? "text-zinc-500" : "text-amber-400"
                        }`}
                      >
                        {formatTbilisi(apt.appointment_datetime, "HH:mm")}
                      </div>
                      <div
                        className={`font-semibold text-sm ${
                          isCompleted ? "text-zinc-400" : "text-white"
                        }`}
                      >
                        {apt.customer_name}
                      </div>
                      <div className="text-zinc-400 text-sm">{apt.services?.name || "—"}</div>
                      <div className="text-zinc-500 text-xs uppercase tracking-wide">
                        {apt.staff?.name || "—"}
                      </div>
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
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-12 flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-[32px] text-zinc-700 mb-3">
                event_busy
              </span>
              <p className="text-zinc-500 text-sm">No appointments scheduled for today.</p>
            </div>
          )}
        </div>

        {/* Right Column - Staff + Quick Actions */}
        <div className="w-72 flex-shrink-0 space-y-6">
          {/* Staff on Shift */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-0.5 h-4 bg-amber-400" />
              <h2 className="text-amber-400 uppercase tracking-widest text-[11px] font-bold">
                STAFF ON SHIFT
              </h2>
            </div>

            {activeStaff.length > 0 ? (
              <div className="space-y-1.5">
                {activeStaff.map((member) => {
                  const initials = member.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div
                      key={member.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-sm px-4 py-3 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-700 text-white text-xs font-mono flex items-center justify-center">
                        {initials}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">{member.name}</p>
                        <p className="text-zinc-500 uppercase text-[10px] tracking-widest">
                          {member.role || "STAFF"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            member.is_active ? "bg-green-400" : "bg-zinc-600"
                          }`}
                        />
                        <span
                          className={`text-[10px] uppercase tracking-widest ${
                            member.is_active ? "text-green-400" : "text-zinc-500"
                          }`}
                        >
                          {member.is_active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-sm p-6 text-center">
                <p className="text-zinc-500 text-sm">No staff configured.</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-0.5 h-4 bg-amber-400" />
              <h2 className="text-amber-400 uppercase tracking-widest text-[11px] font-bold">
                QUICK ACTIONS
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Add Booking */}
              <Link
                href="/dashboard/appointments/new"
                className="bg-zinc-900 border border-zinc-800 hover:border-amber-400/30 rounded-sm p-4 transition-all hover:-translate-y-0.5 block"
              >
                <span className="material-symbols-outlined text-amber-400 text-[18px] block mb-2">
                  add_circle
                </span>
                <h3 className="text-white uppercase tracking-widest text-[10px] font-bold mb-1">
                  ADD BOOKING
                </h3>
                <p className="text-zinc-500 text-[10px] leading-relaxed">
                  Manually create a new appointment
                </p>
              </Link>

              {/* Manage Staff */}
              <Link
                href="/dashboard/staff"
                className="bg-zinc-900 border border-zinc-800 hover:border-amber-400/30 rounded-sm p-4 transition-all hover:-translate-y-0.5 block"
              >
                <span className="material-symbols-outlined text-amber-400 text-[18px] block mb-2">
                  group
                </span>
                <h3 className="text-white uppercase tracking-widest text-[10px] font-bold mb-1">
                  MANAGE STAFF
                </h3>
                <p className="text-zinc-500 text-[10px] leading-relaxed">
                  Update shifts and availability
                </p>
              </Link>

              {/* Edit Services */}
              <Link
                href="/dashboard/services"
                className="bg-zinc-900 border border-zinc-800 hover:border-amber-400/30 rounded-sm p-4 transition-all hover:-translate-y-0.5 block"
              >
                <span className="material-symbols-outlined text-amber-400 text-[18px] block mb-2">
                  content_cut
                </span>
                <h3 className="text-white uppercase tracking-widest text-[10px] font-bold mb-1">
                  EDIT SERVICES
                </h3>
                <p className="text-zinc-500 text-[10px] leading-relaxed">
                  Modify prices and durations
                </p>
              </Link>

              {/* Salome Settings */}
              <Link
                href="/dashboard/salome"
                className="bg-zinc-900 border border-amber-400/20 bg-amber-950/10 hover:border-amber-400/30 rounded-sm p-4 transition-all hover:-translate-y-0.5 block"
              >
                <span className="material-symbols-outlined text-amber-400 text-[18px] block mb-2">
                  mic
                </span>
                <h3 className="text-white uppercase tracking-widest text-[10px] font-bold mb-1">
                  SALOME SETTINGS
                </h3>
                <p className="text-zinc-500 text-[10px] leading-relaxed">
                  Configure your AI receptionist
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
