import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CustomerSidebar } from "@/components/customer/CustomerSidebar";
import { UserMenu } from "@/components/ui/UserMenu";

export default async function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: customer } = await supabase
    .from("customers")
    .select("name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <a data-testid="customer-dashboard-skip-to-main-link" href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="flex min-h-screen bg-background text-on-surface font-hanken antialiased">
        <CustomerSidebar customerName={customer?.name} />
        <div className="flex-1 min-w-0">
          <header className="border-b border-white/10 px-8 h-16 flex items-center justify-between bg-surface">
            <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-primary uppercase">
              My Account
            </p>
            <UserMenu />
          </header>
          <main id="main-content" className="px-8 py-12">{children}</main>
        </div>
      </div>
    </>
  );
}
