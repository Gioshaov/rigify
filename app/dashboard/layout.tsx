import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: business } = await supabase
    .from("businesses")
    .select("name, city")
    .eq("owner_id", user.id)
    .maybeSingle();

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar businessName={business?.name} city={business?.city} />
      <div className="flex-1 min-w-0">
        <DashboardHeader userEmail={user.email} />
        <main className="px-gutter md:px-margin-desktop py-stack-lg">{children}</main>
      </div>
    </div>
  );
}
