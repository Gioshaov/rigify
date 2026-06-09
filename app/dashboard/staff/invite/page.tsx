import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddArtisanForm } from "@/components/dashboard/staff/AddArtisanForm";

export default async function InviteStaffPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify user owns a business
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle grid pattern background */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      ></div>

      <div className="relative py-12 px-4 md:px-margin-desktop">
        <AddArtisanForm />
      </div>
    </div>
  );
}
