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
    <>
      <a data-testid="dashboard-skip-to-main-link" href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="flex min-h-screen bg-background text-on-surface font-hanken antialiased">
        <Sidebar businessName={business?.name} city={business?.city} />
        <div className="flex-1 min-w-0">
          <DashboardHeader userEmail={user.email ?? ''} />
          <main id="main-content" className="px-8 py-12">{children}</main>
        </div>
      </div>
    </>
  );
}
