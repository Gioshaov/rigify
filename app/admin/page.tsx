import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = createClient()

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, subdomain, status, phone, city, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Businesses</h1>
        <a
          href="/admin/onboard"
          className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Onboard New Business
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 text-left">
              <th className="pb-3 pr-4">Business</th>
              <th className="pb-3 pr-4">Subdomain</th>
              <th className="pb-3 pr-4">City</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {businesses?.map((b) => (
              <tr key={b.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 pr-4 font-medium">{b.name}</td>
                <td className="py-3 pr-4 text-gray-400">{b.subdomain ? `${b.subdomain}.rigify.ge` : '—'}</td>
                <td className="py-3 pr-4 text-gray-400">{b.city}</td>
                <td className="py-3 pr-4">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    b.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="py-3 pr-4 text-gray-400">
                  {new Date(b.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
