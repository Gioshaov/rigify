import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
    .select("id, name, phone, email")
    .eq("id", user.id)
    .single();

  if (!customer) {
    return (
      <div className="max-w-2xl">
        <div className="bg-surface-container border border-white/5 p-12 text-center">
          <span className="material-symbols-outlined text-error text-[48px] mb-4">person_off</span>
          <h1 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary mb-2">
            Profile Not Found
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold text-primary mb-3">
          Profile Settings
        </h1>
        <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
          Manage your personal information and preferences
        </p>
      </div>

      <CustomerProfileForm action={updateCustomerProfileAction} customer={customer} />
    </div>
  );
}
