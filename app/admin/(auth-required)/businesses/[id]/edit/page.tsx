import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditBusinessForm } from './EditBusinessForm'

export default async function EditBusinessPage({ params }: { params: { id: string } }) {
  // Use admin client for super admin access (middleware already verified super admin status)
  const admin = createAdminClient()

  const { data: business, error } = await admin
    .from('businesses')
    .select(`
      *,
      business_categories (
        category_id
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !business) {
    redirect('/admin')
  }

  // Get staff for this business
  const { data: staff } = await admin
    .from('staff')
    .select('id, name, email, role, is_active, created_at')
    .eq('business_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl">
      <div className="mb-4">
        <a href="/admin" className="text-sm text-gray-400 hover:text-white">
          ← Back to businesses
        </a>
      </div>

      <h1 className="text-2xl font-bold mb-4">Edit Business</h1>

      <EditBusinessForm
        business={business}
        categoryIds={business.business_categories?.map((bc: any) => bc.category_id) || []}
        staff={staff}
      />
    </div>
  )
}
