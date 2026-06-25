-- Remove Russian-language columns. The app no longer reads or writes these
-- (Russian was dropped from the product); this removes the data surface too.
alter table public.businesses drop column if exists name_ru;
alter table public.businesses drop column if exists description_ru;
alter table public.services   drop column if exists name_ru;
