import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CustomerSidebar } from "@/components/customer/CustomerSidebar";

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
    <div className="flex min-h-screen bg-background text-on-surface">
      <CustomerSidebar customerName={customer?.name} />
      <div className="flex-1 min-w-0">
        <header className="border-b border-outline-variant px-gutter md:px-margin-desktop h-16 flex items-center justify-between">
          <p className="label-mono">MY ACCOUNT</p>
          <p className="label-mono text-on-surface-variant">{user.email}</p>
        </header>
        <main className="px-gutter md:px-margin-desktop py-stack-lg">{children}</main>
      </div>
    </div>
  );
}
