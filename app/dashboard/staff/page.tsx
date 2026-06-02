import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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

  return (
    <section>
      <div className="flex items-start justify-between">
        <div>
          <p className="label-mono text-primary">STAFF</p>
          <h1 className="mt-stack-sm text-headline-md">Staff management</h1>
          <p className="mt-stack-md text-on-surface-variant max-w-xl">
            Staff members can log in to access a limited dashboard with role-based permissions.
          </p>
        </div>
        <Link href="/dashboard/staff/invite" className="btn-primary">
          Invite Staff
        </Link>
      </div>

      <div className="mt-stack-lg">
        {!staff || staff.length === 0 ? (
          <div className="text-center py-12 border border-outline-variant rounded-lg">
            <p className="text-on-surface-variant mb-4">No staff members yet</p>
            <Link href="/dashboard/staff/invite" className="text-primary hover:underline">
              Invite your first staff member →
            </Link>
          </div>
        ) : (
          <div className="border border-outline-variant rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface border-b border-outline-variant">
                <tr>
                  <th className="text-left px-4 py-3 text-label-sm">Name</th>
                  <th className="text-left px-4 py-3 text-label-sm">Role</th>
                  <th className="text-left px-4 py-3 text-label-sm">Status</th>
                  <th className="text-left px-4 py-3 text-label-sm">Added</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id} className="border-b border-outline-variant last:border-0">
                    <td className="px-4 py-3">{member.name}</td>
                    <td className="px-4 py-3 capitalize">{member.role}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        member.is_active
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
