import { createClient } from "@/lib/supabase/server";
import { CustomerProfileForm } from "./CustomerProfileForm";
import { updateCustomerProfileAction } from "./actions";

export default async function CustomerProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <section>
        <h1 className="text-headline-md">Please sign in</h1>
      </section>
    );
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!customer) {
    return (
      <section>
        <h1 className="text-headline-md">Profile not found</h1>
      </section>
    );
  }

  return (
    <section className="max-w-2xl">
      <div>
        <h1 className="text-headline-md">Profile</h1>
        <p className="mt-stack-sm text-on-surface-variant">
          Manage your personal information
        </p>
      </div>

      <CustomerProfileForm action={updateCustomerProfileAction} customer={customer} />
    </section>
  );
}
