import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BusinessProfileForm } from "./BusinessProfileForm";

export default async function BusinessProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get business
  const { data: business, error } = await supabase
    .from("businesses")
    .select(`
      *,
      business_categories (
        category_id
      )
    `)
    .eq("owner_id", user.id)
    .single();

  if (error || !business) {
    return (
      <div className="p-gutter">
        <p className="label-mono text-error">No business found for this account.</p>
      </div>
    );
  }

  // Get categories for the form
  const categoryIds = business.business_categories.map((bc: any) => bc.category_id);

  return (
    <div>
      <div className="border-b border-outline-variant px-gutter md:px-margin-desktop py-stack-lg">
        <p className="label-mono text-primary mb-stack-sm">SETTINGS</p>
        <h1 className="text-display-md-mobile md:text-headline-lg">Business Profile</h1>
        <p className="mt-stack-sm text-body-md text-on-surface-variant">
          Manage your business information, images, and contact details.
        </p>
      </div>

      <div className="px-gutter md:px-margin-desktop py-stack-lg">
        <BusinessProfileForm business={business} categoryIds={categoryIds} />
      </div>
    </div>
  );
}
