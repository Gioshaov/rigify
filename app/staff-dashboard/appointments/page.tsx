import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppointmentList } from "@/components/dashboard/staff/AppointmentList";

export default async function StaffAppointmentsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify user is staff
  const { data: staff } = await supabase
    .from("staff")
    .select("id, name")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!staff) redirect("/login");

  return <AppointmentList />;
}
