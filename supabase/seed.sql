-- Seed: Mitte Beauty Salon (Tbilisi, Vake district)
-- Run this AFTER all migrations. The owner_id is intentionally NULL — after
-- registering at /register, run the UPDATE statement at the bottom of this
-- file (un-comment, fill in your user id) to claim the seed business.

-- ----- Mitte Beauty -----
insert into public.businesses (
  id, owner_id, slug, name, name_ka, description, description_ka,
  category, city, district, address, address_ka, phone, email, instagram,
  hours, salome_enabled, salome_phone, rating, review_count
) values (
  '11111111-1111-1111-1111-111111111111',
  null,
  'mitte-beauty',
  'Mitte Beauty Salon',
  'მიტე სილამაზის სალონი',
  'Premium hair and beauty studio in the heart of Vake — five award-winning stylists and an editorial colour bar.',
  'პრემიუმ თმისა და სილამაზის სტუდია ვაკეში — ხუთი დაჯილდოებული სტილისტი და სარედაქციო ფერების ბარი.',
  'hair',
  'tbilisi',
  'vake',
  '12 Chavchavadze Ave, Tbilisi',
  '12 ჭავჭავაძის გამზ., თბილისი',
  '+995 32 220 4040',
  'hello@mittebeauty.ge',
  '@mitte.beauty',
  jsonb_build_object(
    'mon', jsonb_build_object('open', '10:00', 'close', '20:00'),
    'tue', jsonb_build_object('open', '10:00', 'close', '20:00'),
    'wed', jsonb_build_object('open', '10:00', 'close', '20:00'),
    'thu', jsonb_build_object('open', '10:00', 'close', '20:00'),
    'fri', jsonb_build_object('open', '10:00', 'close', '21:00'),
    'sat', jsonb_build_object('open', '11:00', 'close', '19:00'),
    'sun', null
  ),
  true,
  '+995 32 999 0001',
  4.9,
  0
);

-- ----- Services -----
insert into public.services (business_id, name, name_ka, category, duration_minutes, price_min, price_max, sort_order) values
  ('11111111-1111-1111-1111-111111111111', 'Signature Haircut', 'ხელმოწერის შეჭრა',     'hair',  60,  120,  180, 1),
  ('11111111-1111-1111-1111-111111111111', 'Single-Process Colour', 'ერთეტაპიანი ღებვა', 'hair',  90,  220,  320, 2),
  ('11111111-1111-1111-1111-111111111111', 'Editorial Highlights', 'სარედაქციო ღია ღერები', 'hair', 180, 380,  620, 3),
  ('11111111-1111-1111-1111-111111111111', 'Olaplex Bond Treatment', 'ოლაპლექსის მკურნალობა', 'hair', 45, 90,   140, 4),
  ('11111111-1111-1111-1111-111111111111', 'Blow-Dry Styling', 'სტილისტური ჩაშრობა',       'hair',  45,  70,   110, 5),
  ('11111111-1111-1111-1111-111111111111', 'Brow Architecture', 'წარბების არქიტექტურა',   'brows', 30,  50,    80, 6);

-- ----- Staff -----
insert into public.staff (id, business_id, name, name_ka, specialty, specialty_ka, sort_order) values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111111', 'Nino Beridze',    'ნინო ბერიძე',    'Creative Director, Colour', 'შემოქმედებითი დირექტორი, ფერი', 1),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111111', 'Salome Khazaradze','სალომე ხაზარაძე','Senior Stylist',           'უფროსი სტილისტი',              2),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111111', 'Giorgi Tsiklauri','გიორგი წიკლაური', 'Barber & Brow Specialist','ბარბერი & წარბების სპეციალისტი', 3);

-- ----- A few bookings (next 7 days) to exercise overlap logic later -----
-- The bookings_compute_end trigger fills end_datetime automatically.
insert into public.bookings (business_id, service_id, staff_id, customer_name, customer_phone, appointment_datetime, duration_minutes, booking_source, price)
select
  '11111111-1111-1111-1111-111111111111',
  (select id from public.services where business_id = '11111111-1111-1111-1111-111111111111' and name = 'Signature Haircut'),
  '22222222-2222-2222-2222-222222222201',
  'Mariam G.', '+995 555 010101',
  (now() at time zone 'Asia/Tbilisi')::date + interval '1 day' + time '11:00',
  60, 'web', 150
;

insert into public.bookings (business_id, service_id, staff_id, customer_name, customer_phone, appointment_datetime, duration_minutes, booking_source, price)
select
  '11111111-1111-1111-1111-111111111111',
  (select id from public.services where business_id = '11111111-1111-1111-1111-111111111111' and name = 'Editorial Highlights'),
  '22222222-2222-2222-2222-222222222201',
  'Tamta L.', '+995 555 020202',
  (now() at time zone 'Asia/Tbilisi')::date + interval '2 days' + time '13:30',
  180, 'voice', 480
;

insert into public.bookings (business_id, service_id, staff_id, customer_name, customer_phone, appointment_datetime, duration_minutes, booking_source, price)
select
  '11111111-1111-1111-1111-111111111111',
  (select id from public.services where business_id = '11111111-1111-1111-1111-111111111111' and name = 'Brow Architecture'),
  '22222222-2222-2222-2222-222222222203',
  'Lela K.', '+995 555 030303',
  (now() at time zone 'Asia/Tbilisi')::date + interval '3 days' + time '16:00',
  30, 'instagram', 60
;

-- ----- Subscription (trial) -----
insert into public.subscriptions (business_id, plan, status, trial_ends_at, salome_enabled, salome_plan, languages, monthly_call_limit)
values ('11111111-1111-1111-1111-111111111111', 'growth', 'trial', now() + interval '14 days', true, 'standard', array['ka','en'], 500);

-- ----- Claim the seed business after you register -----
-- 1. Visit /register and create an account.
-- 2. Find your user id:    select id, email from auth.users;
-- 3. Run:
--    update public.businesses
--       set owner_id = '<your-auth.users.id>'
--     where slug = 'mitte-beauty';
