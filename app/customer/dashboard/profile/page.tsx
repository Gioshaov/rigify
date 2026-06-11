import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CustomerProfileForm } from "./CustomerProfileForm";
import { updateCustomerProfileAction } from "./actions";

export default async function CustomerProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("id, name, phone, email, created_at")
    .eq("id", user.id)
    .single();

  // Count total bookings for this customer (use id for efficiency)
  const { count: bookingCount } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", user.id);

  if (!customer) {
    return (
      <div className="max-w-2xl">
        <div className="bg-surface-container border border-white/5 p-12 text-center space-y-6">
          <span className="material-symbols-outlined text-error text-[48px] block">person_off</span>
          <h1 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary mb-2">
            Profile Not Found
          </h1>
          <p className="font-hanken text-[14px] text-on-surface-variant mb-4">
            Your customer profile could not be loaded. Please try logging out and back in.
          </p>
          <Link
            href="/logout"
            className="inline-block bg-primary text-on-primary px-6 py-3 font-mono text-[12px] tracking-[0.15em] uppercase hover:bg-primary-container transition-colors"
          >
            Sign Out
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto" data-testid="customer-profile-page">
      {/* Stitch Design: my_profile_rigify */}

      {/* Header with Background Glow */}
      <div className="relative mb-16">
        <div className="absolute -left-10 top-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="space-y-4 relative z-10">
          <h1 className="font-hanken text-[48px] leading-[1.1] tracking-[-0.02em] font-bold text-primary uppercase">
            My Profile
          </h1>
          <div className="h-1 w-12 bg-primary"></div>
        </div>
      </div>

      <CustomerProfileForm
        action={updateCustomerProfileAction}
        customer={customer}
        bookingCount={bookingCount ?? 0}
      />
    </div>
  );
}
