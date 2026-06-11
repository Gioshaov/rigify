import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StaffDirectoryClient } from "./StaffDirectoryClient";
import { formatTbilisi } from "@/lib/utils/datetime";

export default async function StaffDirectoryPage() {
  const supabase = createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Get business
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user.id)
    .single();

  if (!business) {
    redirect('/dashboard');
  }

  // Fetch all staff (including inactive)
  const { data: staffData, error: staffError } = await supabase
    .from('staff')
    .select('id, name, role, specialty, is_active, created_at, email')
    .eq('business_id', business.id)
    .order('name', { ascending: true });

  if (staffError) {
    console.error('Error fetching staff:', staffError);
  }

  // Transform staff data to match UI expectations
  const staff = (staffData || []).map((member) => {
    return {
      id: member.id,
      name: member.name,
      role: member.specialty || (member.role === 'manager' ? 'Manager' : 'Staff'),
      status: member.is_active ? "ON SHIFT" as const : "OFF" as const,
      statusDetail: member.is_active ? "Active" : "Inactive",
      email: member.email || "",
      added: formatTbilisi(member.created_at, "MMM d, yyyy"),
      photoUrl: undefined,
      dbRole: member.role, // Keep original DB role for updates
      isActive: member.is_active,
    };
  });

  return <StaffDirectoryClient initialStaff={staff} businessId={business.id} />;
}
