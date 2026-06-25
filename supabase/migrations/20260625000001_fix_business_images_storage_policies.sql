-- Fix business-images storage write policies.
--
-- The insert/update/delete policies called
--   get_business_id_from_storage_path(businesses.name)
-- i.e. they passed each business's *display name* into a function that casts the
-- first path segment to uuid. Any business whose name isn't a UUID (all of them)
-- made the EXISTS subquery throw "invalid input syntax for type uuid", which
-- failed EVERY upload/update/delete — even for super-admins.
--
-- Correct behaviour: derive the business id from the *object's own path* (the
-- `name` column of storage.objects, e.g. "<business-uuid>/cover-123.jpg") and
-- allow the write when the uploader is a super-admin OR owns that business.

-- Harden the helper: return null (not an error) when the first path segment
-- isn't a UUID, so a malformed path can never crash a policy again.
create or replace function public.get_business_id_from_storage_path(path text)
returns uuid
language sql
stable
as $function$
  select case
    when split_part(path, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then split_part(path, '/', 1)::uuid
    else null
  end;
$function$;

-- INSERT
drop policy if exists "Business owners can upload their images" on storage.objects;
create policy "Business owners can upload their images"
  on storage.objects for insert
  with check (
    bucket_id = 'business-images'
    and auth.role() = 'authenticated'
    and (
      (((auth.jwt() -> 'app_metadata') ->> 'is_super_admin')::boolean = true)
      or public.get_business_id_from_storage_path(name) in (
        select id from public.businesses where owner_id = auth.uid()
      )
    )
  );

-- UPDATE
drop policy if exists "Business owners can update their images" on storage.objects;
create policy "Business owners can update their images"
  on storage.objects for update
  using (
    bucket_id = 'business-images'
    and auth.role() = 'authenticated'
    and (
      (((auth.jwt() -> 'app_metadata') ->> 'is_super_admin')::boolean = true)
      or public.get_business_id_from_storage_path(name) in (
        select id from public.businesses where owner_id = auth.uid()
      )
    )
  )
  with check (
    bucket_id = 'business-images'
    and auth.role() = 'authenticated'
    and (
      (((auth.jwt() -> 'app_metadata') ->> 'is_super_admin')::boolean = true)
      or public.get_business_id_from_storage_path(name) in (
        select id from public.businesses where owner_id = auth.uid()
      )
    )
  );

-- DELETE
drop policy if exists "Business owners can delete their images" on storage.objects;
create policy "Business owners can delete their images"
  on storage.objects for delete
  using (
    bucket_id = 'business-images'
    and auth.role() = 'authenticated'
    and (
      (((auth.jwt() -> 'app_metadata') ->> 'is_super_admin')::boolean = true)
      or public.get_business_id_from_storage_path(name) in (
        select id from public.businesses where owner_id = auth.uid()
      )
    )
  );
