import { createClient } from '@/lib/supabase/server'
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

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <a href="/admin" className="text-sm text-gray-400 hover:text-white">
          ← Back to businesses
        </a>
      </div>

      <h1 className="text-2xl font-bold mb-6">Edit Business</h1>

      <EditBusinessForm business={business} />
    </div>
  )
}
