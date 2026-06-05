import { createClient } from '@/lib/supabase/server'
import { AdminBusinessTable } from './AdminBusinessTable'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.is_super_admin !== true) {
    redirect('/admin/login')
  }

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, subdomain, status, phone, city, district, created_at')
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

      <AdminBusinessTable businesses={businesses || []} />
    </div>
  )
}
