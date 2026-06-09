import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StaffSidebar } from "@/components/dashboard/StaffSidebar";
import { UserMenu } from "@/components/ui/UserMenu";

export default async function StaffDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get staff record with permissions
  const { data: staff } = await supabase
    .from("staff")
    .select(`
      *,
      businesses!inner(name, city),
      staff_permissions(*)
    `)
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!staff) redirect("/login");

  const permissions = staff.staff_permissions?.[0] || {
    can_view_appointments: true,
    can_edit_appointments: true,
    can_view_customers: true,
    can_view_services: true,
    can_edit_services: false,
    can_view_staff: true,
    can_edit_staff: false,
    can_view_settings: false,
    can_edit_settings: false,
    can_view_salome: false,
    can_edit_salome: false,
  };

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <StaffSidebar staff={staff} permissions={permissions} />
      <div className="flex-1 min-w-0">
        <header className="border-b border-outline-variant px-gutter md:px-margin-desktop h-16 flex items-center justify-between">
          <p className="label-mono">STAFF DASHBOARD</p>
          <UserMenu />
        </header>
        <main className="px-gutter md:px-margin-desktop py-stack-lg">{children}</main>
      </div>
    </div>
  );
}
