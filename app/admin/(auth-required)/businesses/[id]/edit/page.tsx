import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EditBusinessForm } from './EditBusinessForm';

export default async function EditBusinessPage({
  params,
}: {
  params: { id: string };
}) {
  // Verify super admin access
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.is_super_admin !== true) {
    redirect('/admin/login');
  }

  // Use admin client to fetch business data
  const admin = createAdminClient();

  const [
    { data: business, error: businessError },
    { data: staff },
    { data: categories }
  ] = await Promise.all([
    admin
      .from('businesses')
      .select(`
        *,
        business_categories (
          category_id
        )
      `)
      .eq('id', params.id)
      .single(),
    admin
      .from('staff')
      .select('id, name, email, role, is_active, created_at')
      .eq('business_id', params.id)
      .order('created_at', { ascending: false }),
    admin
      .from('categories')
      .select('id, name, name_ka')
      .order('name')
  ]);

  if (businessError || !business) {
    redirect('/admin');
  }

  return (
    <EditBusinessForm
      business={business}
      categoryIds={business.business_categories?.map((bc: any) => bc.category_id) || []}
      staff={staff || []}
      allCategories={categories || []}
    />
  );
}
