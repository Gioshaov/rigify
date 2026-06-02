import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditBusinessForm } from './EditBusinessForm'

export default async function EditBusinessPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: business, error } = await supabase
    .from('businesses')
    .select('id, name, subdomain, slug, phone, address, city, status')
    .eq('id', params.id)
    .single()

  if (error || !business) {
    redirect('/admin')
  }

  // Get staff for this business (use admin client since super admin doesn't own the business)
  const admin = createAdminClient()
  const { data: staff } = await admin
    .from('staff')
    .select('id, name, role, is_active, created_at')
    .eq('business_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <a href="/admin" className="text-sm text-gray-400 hover:text-white">
          ← Back to businesses
        </a>
      </div>

      <h1 className="text-2xl font-bold mb-6">Edit Business</h1>

      <EditBusinessForm business={business} />

      {/* Staff Section */}
      <div className="mt-12 pt-8 border-t border-white/10">
        <h2 className="text-xl font-bold mb-4">Staff Members</h2>
        {!staff || staff.length === 0 ? (
          <p className="text-gray-400 text-sm">No staff members for this business</p>
        ) : (
          <div className="bg-white/5 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-400">Name</th>
                  <th className="text-left px-4 py-3 text-gray-400">Role</th>
                  <th className="text-left px-4 py-3 text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 text-gray-400">Added</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3">{member.name}</td>
                    <td className="px-4 py-3 capitalize">{member.role}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        member.is_active
                          ? 'bg-green-900 text-green-300'
                          : 'bg-gray-800 text-gray-400'
                      }`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
