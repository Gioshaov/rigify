-- Create storage bucket for business images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-images',
  'business-images',
  true,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Allow public access to read images
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
  on storage.objects for select
  using (bucket_id = 'business-images');

-- Allow authenticated users to upload images
drop policy if exists "Authenticated users can upload business images" on storage.objects;
create policy "Authenticated users can upload business images"
  on storage.objects for insert
  with check (
    bucket_id = 'business-images'
    and auth.role() = 'authenticated'
  );

-- Allow business owners to update their own business images
drop policy if exists "Business owners can update their images" on storage.objects;
create policy "Business owners can update their images"
  on storage.objects for update
  using (
    bucket_id = 'business-images'
    and auth.role() = 'authenticated'
  )
  with check (
    bucket_id = 'business-images'
    and auth.role() = 'authenticated'
  );

-- Allow business owners to delete their own business images
drop policy if exists "Business owners can delete their images" on storage.objects;
create policy "Business owners can delete their images"
  on storage.objects for delete
  using (
    bucket_id = 'business-images'
    and auth.role() = 'authenticated'
  );
