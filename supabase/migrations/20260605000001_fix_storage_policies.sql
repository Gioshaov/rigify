-- Fix storage policies to check business ownership

-- Helper function to extract business_id from storage path
-- Path format: {business_id}/cover-{timestamp}.jpg or {business_id}/logo-{timestamp}.jpg
create or replace function public.get_business_id_from_storage_path(path text)
returns uuid as $$
  select split_part(path, '/', 1)::uuid;
$$ language sql stable;

-- Update policy: only allow business owners or super admins to update images
drop policy if exists "Business owners can update their images" on storage.objects;
create policy "Business owners can update their images"
  on storage.objects for update
  using (
    bucket_id = 'business-images'
    and auth.role() = 'authenticated'
    and (
      -- Business owner
      exists (
        select 1 from public.businesses
        where id = public.get_business_id_from_storage_path(name)
        and owner_id = auth.uid()
      )
      -- OR super admin
      or (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
    )
  )
  with check (
    bucket_id = 'business-images'
    and auth.role() = 'authenticated'
    and (
      -- Business owner
      exists (
        select 1 from public.businesses
        where id = public.get_business_id_from_storage_path(name)
        and owner_id = auth.uid()
      )
      -- OR super admin
      or (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
    )
  );

-- Update policy: only allow business owners or super admins to delete images
drop policy if exists "Business owners can delete their images" on storage.objects;
create policy "Business owners can delete their images"
  on storage.objects for delete
  using (
    bucket_id = 'business-images'
    and auth.role() = 'authenticated'
    and (
      -- Business owner
      exists (
        select 1 from public.businesses
        where id = public.get_business_id_from_storage_path(name)
        and owner_id = auth.uid()
      )
      -- OR super admin
      or (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
    )
  );

-- Update policy: only allow business owners or super admins to insert images
drop policy if exists "Authenticated users can upload business images" on storage.objects;
create policy "Business owners can upload their images"
  on storage.objects for insert
  with check (
    bucket_id = 'business-images'
    and auth.role() = 'authenticated'
    and (
      -- Business owner
      exists (
        select 1 from public.businesses
        where id = public.get_business_id_from_storage_path(name)
        and owner_id = auth.uid()
      )
      -- OR super admin
      or (auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean = true
    )
  );
