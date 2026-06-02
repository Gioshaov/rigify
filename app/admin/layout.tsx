import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSignOutButton } from './AdminSignOutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Super admin check — set this flag manually in Supabase Auth dashboard
  // on your own user: app_metadata.is_super_admin = true
  const isSuperAdmin = user.app_metadata?.is_super_admin === true
  if (!isSuperAdmin) redirect('/')

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-6">
        <span className="font-bold text-lg">Rigify Admin</span>
        <a href="/admin" className="text-sm text-gray-400 hover:text-white">Businesses</a>
        <a href="/admin/onboard" className="text-sm text-gray-400 hover:text-white">Onboard New</a>
        <div className="flex-1" />
        <AdminSignOutButton />
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
