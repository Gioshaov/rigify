import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  // Super admin check
  const isSuperAdmin = user.app_metadata?.is_super_admin === true
  if (!isSuperAdmin) redirect('/admin/login')

  return <>{children}</>
}
