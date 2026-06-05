import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StaffPageContent } from "@/components/dashboard/StaffPageContent";

export default async function StaffPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get the business for this owner
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_id", user.id)
    .single();

  if (!business) {
    return <div>No business found</div>;
  }

  // Get all staff for this business
  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("id, name, user_id, role, is_active, created_at")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  if (staffError) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-800 rounded-lg">
        <p className="text-red-300">Failed to load staff list: {staffError.message}</p>
      </div>
    );
  }

  return <StaffPageContent staff={staff || []} />;
}
