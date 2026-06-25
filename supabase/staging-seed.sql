-- =====================================================================
-- Rigify STAGING seed — reusable mock data for the staging environment.
--
-- 8 businesses across all cities & categories, plus services, staff,
-- business_categories, reviews, bookings and subscriptions.
--
-- ⚠️ STAGING ONLY. Never run against production — it deletes and re-inserts
--    the fixed-UUID mock rows (id prefix b0000000-0000-0000-0000-).
--
-- Apply with:  npm run seed:staging        (uses the Supabase Management API)
-- or paste into the staging project's SQL Editor and Run.
--
-- Idempotent: wrapped in a transaction; re-running clears its own mock rows
-- first, so it can be used to reset staging data at any time.
-- =====================================================================
begin;

-- Clean any prior mock rows (children cascade where FKs allow; explicit for safety)
delete from public.bookings  where business_id in (select id from public.businesses where id::text like 'b0000000-0000-0000-0000-%');
delete from public.reviews   where business_id in (select id from public.businesses where id::text like 'b0000000-0000-0000-0000-%');
delete from public.services  where business_id in (select id from public.businesses where id::text like 'b0000000-0000-0000-0000-%');
delete from public.staff     where business_id in (select id from public.businesses where id::text like 'b0000000-0000-0000-0000-%');
delete from public.subscriptions where business_id in (select id from public.businesses where id::text like 'b0000000-0000-0000-0000-%');
delete from public.business_categories where business_id in (select id from public.businesses where id::text like 'b0000000-0000-0000-0000-%');
delete from public.businesses where id::text like 'b0000000-0000-0000-0000-%';

-- ---------- helper for standard weekly hours ----------
-- (inlined per-row below via jsonb_build_object)

-- ===================== BUSINESSES =====================
-- is_test = false is deliberate: these mock businesses must be visible in the
-- public marketplace on staging (the businesses_public_select RLS policy filters
-- out is_test = true rows). They are isolated instead by the b0000000-... id range.
insert into public.businesses
  (id, slug, name, name_ka, description, description_ka, category, city, district,
   address, address_ka, phone, email, instagram, cover_image_url, hours,
   salome_enabled, salome_phone, latitude, longitude, status, is_active, is_test)
values
-- 1. Mitte Beauty — hair — Tbilisi/Vake
('b0000000-0000-0000-0000-000000000001','mitte-beauty','Mitte Beauty Salon','მიტე სილამაზის სალონი',
 'Premium hair and beauty studio in the heart of Vake — award-winning stylists and an editorial colour bar.',
 'პრემიუმ თმისა და სილამაზის სტუდია ვაკეში — დაჯილდოებული სტილისტები და სარედაქციო ფერების ბარი.',
 'hair','tbilisi','Vake','12 Chavchavadze Ave, Tbilisi','12 ჭავჭავაძის გამზ., თბილისი','+995 32 220 4040','hello@mittebeauty.ge','@mitte.beauty',
 'https://picsum.photos/seed/mitte/800/600',
 jsonb_build_object('mon',jsonb_build_object('open','10:00','close','20:00'),'tue',jsonb_build_object('open','10:00','close','20:00'),'wed',jsonb_build_object('open','10:00','close','20:00'),'thu',jsonb_build_object('open','10:00','close','20:00'),'fri',jsonb_build_object('open','10:00','close','21:00'),'sat',jsonb_build_object('open','11:00','close','19:00'),'sun',null),
 true,'+995 32 999 0001',41.7095,44.7560,'active',true,false),

-- 2. Luxe Nails — nails — Tbilisi/Saburtalo
('b0000000-0000-0000-0000-000000000002','luxe-nails','Luxe Nails Studio','ლუქს ფრჩხილების სტუდია',
 'Boutique nail studio specialising in gel, nail extensions and nail art.',
 'ბუტიკ ფრჩხილების სტუდია — გელი, ფრჩხილის გაგრძელება და ნეილ-არტი.',
 'nails','tbilisi','Saburtalo','5 Kostava St, Tbilisi','5 კოსტავას ქ., თბილისი','+995 32 244 1212','book@luxenails.ge','@luxe.nails.tbilisi',
 'https://picsum.photos/seed/luxenails/800/600',
 jsonb_build_object('mon',jsonb_build_object('open','11:00','close','20:00'),'tue',jsonb_build_object('open','11:00','close','20:00'),'wed',jsonb_build_object('open','11:00','close','20:00'),'thu',jsonb_build_object('open','11:00','close','20:00'),'fri',jsonb_build_object('open','11:00','close','20:00'),'sat',jsonb_build_object('open','11:00','close','18:00'),'sun',null),
 false,null,41.7233,44.7523,'active',true,false),

-- 3. Derma Skin Clinic — skin — Tbilisi/Vera
('b0000000-0000-0000-0000-000000000003','derma-skin-clinic','Derma Skin Clinic','დერმა კანის კლინიკა',
 'Medical-grade facials, peels and laser treatments led by certified dermatologists.',
 'სამედიცინო დონის სახის მოვლა, პილინგი და ლაზერული პროცედურები სერტიფიცირებული დერმატოლოგებით.',
 'skin','tbilisi','Vera','28 Melikishvili St, Tbilisi','28 მელიქიშვილის ქ., თბილისი','+995 32 255 7878','care@dermaclinic.ge','@derma.clinic.ge',
 'https://picsum.photos/seed/derma/800/600',
 jsonb_build_object('mon',jsonb_build_object('open','09:00','close','18:00'),'tue',jsonb_build_object('open','09:00','close','18:00'),'wed',jsonb_build_object('open','09:00','close','18:00'),'thu',jsonb_build_object('open','09:00','close','18:00'),'fri',jsonb_build_object('open','09:00','close','18:00'),'sat',jsonb_build_object('open','10:00','close','15:00'),'sun',null),
 true,'+995 32 999 0003',41.7080,44.7910,'active',true,false),

-- 4. Serenity Massage & Spa — massage — Tbilisi/Mtatsminda
('b0000000-0000-0000-0000-000000000004','serenity-spa','Serenity Massage & Spa','სერენიტი მასაჟი & სპა',
 'A calm retreat offering deep-tissue, hot-stone and aromatherapy massage.',
 'მშვიდი სივრცე — ღრმა ქსოვილოვანი, ცხელი ქვებითა და არომათერაპიული მასაჟი.',
 'massage','tbilisi','Mtatsminda','3 Betlemi St, Tbilisi','3 ბეთლემის ქ., თბილისი','+995 32 298 3030','relax@serenityspa.ge','@serenity.tbilisi',
 'https://picsum.photos/seed/serenity/800/600',
 jsonb_build_object('mon',jsonb_build_object('open','10:00','close','21:00'),'tue',jsonb_build_object('open','10:00','close','21:00'),'wed',jsonb_build_object('open','10:00','close','21:00'),'thu',jsonb_build_object('open','10:00','close','21:00'),'fri',jsonb_build_object('open','10:00','close','22:00'),'sat',jsonb_build_object('open','10:00','close','22:00'),'sun',jsonb_build_object('open','12:00','close','20:00')),
 false,null,41.6950,44.7980,'active',true,false),

-- 5. Sharp Cuts Barbershop — barber — Tbilisi/Old Tbilisi
('b0000000-0000-0000-0000-000000000005','sharp-cuts','Sharp Cuts Barbershop','შარპ-ქათს ბარბერშოპი',
 'Classic and modern cuts, hot-towel shaves and beard sculpting for the modern gentleman.',
 'კლასიკური და თანამედროვე შეჭრა, ცხელი პირსახოცით პარსვა და წვერის ფორმირება.',
 'barber','tbilisi','Old Tbilisi','17 Kote Abkhazi St, Tbilisi','17 კოტე აფხაზის ქ., თბილისი','+995 32 277 5050','book@sharpcuts.ge','@sharpcuts.ge',
 'https://picsum.photos/seed/sharpcuts/800/600',
 jsonb_build_object('mon',jsonb_build_object('open','11:00','close','21:00'),'tue',jsonb_build_object('open','11:00','close','21:00'),'wed',jsonb_build_object('open','11:00','close','21:00'),'thu',jsonb_build_object('open','11:00','close','21:00'),'fri',jsonb_build_object('open','11:00','close','22:00'),'sat',jsonb_build_object('open','11:00','close','22:00'),'sun',jsonb_build_object('open','12:00','close','18:00')),
 false,null,41.6900,44.8080,'active',true,false),

-- 6. Glow Makeup Bar — makeup — Tbilisi/Vake
('b0000000-0000-0000-0000-000000000006','glow-makeup-bar','Glow Makeup Bar','გლოუ მაკიაჟის ბარი',
 'Event, bridal and editorial makeup by a team of pro MUAs. Lashes and styling too.',
 'ღონისძიების, საქორწინო და სარედაქციო მაკიაჟი პროფესიონალი ვიზაჟისტებისგან.',
 'makeup','tbilisi','Vake','40 Abashidze St, Tbilisi','40 აბაშიძის ქ., თბილისი','+995 32 233 6699','hello@glowbar.ge','@glow.makeup.bar',
 'https://picsum.photos/seed/glowbar/800/600',
 jsonb_build_object('mon',jsonb_build_object('open','10:00','close','20:00'),'tue',jsonb_build_object('open','10:00','close','20:00'),'wed',jsonb_build_object('open','10:00','close','20:00'),'thu',jsonb_build_object('open','10:00','close','20:00'),'fri',jsonb_build_object('open','09:00','close','21:00'),'sat',jsonb_build_object('open','08:00','close','21:00'),'sun',jsonb_build_object('open','09:00','close','18:00')),
 false,null,41.7120,44.7700,'active',true,false),

-- 7. Black Sea Beauty — hair — Batumi
('b0000000-0000-0000-0000-000000000007','black-sea-beauty','Black Sea Beauty','შავი ზღვის სილამაზე',
 'Seaside salon in Batumi offering cuts, colour and bridal hair with a view.',
 'ზღვისპირა სალონი ბათუმში — შეჭრა, ღებვა და საქორწინო ვარცხნილობა.',
 'hair','batumi','Old Boulevard','9 Ninoshvili St, Batumi','9 ნინოშვილის ქ., ბათუმი','+995 422 27 4040','hello@blackseabeauty.ge','@blacksea.beauty',
 'https://picsum.photos/seed/blacksea/800/600',
 jsonb_build_object('mon',jsonb_build_object('open','10:00','close','20:00'),'tue',jsonb_build_object('open','10:00','close','20:00'),'wed',jsonb_build_object('open','10:00','close','20:00'),'thu',jsonb_build_object('open','10:00','close','20:00'),'fri',jsonb_build_object('open','10:00','close','21:00'),'sat',jsonb_build_object('open','10:00','close','21:00'),'sun',jsonb_build_object('open','11:00','close','18:00')),
 true,'+995 422 99 0007',41.6520,41.6360,'active',true,false),

-- 8. Rioni Brow Lab — brows — Kutaisi
('b0000000-0000-0000-0000-000000000008','rioni-brow-lab','Rioni Brow Lab','რიონი წარბების ლაბი',
 'Brow lamination, microblading and lash lifts in central Kutaisi.',
 'წარბების ლამინაცია, მიკრობლეიდინგი და წამწამების აწევა ქუთაისის ცენტრში.',
 'brows','kutaisi','Centre','11 Tsereteli St, Kutaisi','11 წერეთლის ქ., ქუთაისი','+995 431 24 1515','book@rionibrow.ge','@rioni.brow.lab',
 'https://picsum.photos/seed/rioni/800/600',
 jsonb_build_object('mon',jsonb_build_object('open','11:00','close','19:00'),'tue',jsonb_build_object('open','11:00','close','19:00'),'wed',jsonb_build_object('open','11:00','close','19:00'),'thu',jsonb_build_object('open','11:00','close','19:00'),'fri',jsonb_build_object('open','11:00','close','19:00'),'sat',jsonb_build_object('open','11:00','close','17:00'),'sun',null),
 false,null,42.2670,42.7050,'active',true,false);

-- ===================== BUSINESS CATEGORIES =====================
insert into public.business_categories (business_id, category_id) values
 ('b0000000-0000-0000-0000-000000000001','hair'),
 ('b0000000-0000-0000-0000-000000000001','brows'),
 ('b0000000-0000-0000-0000-000000000002','nails'),
 ('b0000000-0000-0000-0000-000000000003','skin'),
 ('b0000000-0000-0000-0000-000000000004','massage'),
 ('b0000000-0000-0000-0000-000000000005','barber'),
 ('b0000000-0000-0000-0000-000000000006','makeup'),
 ('b0000000-0000-0000-0000-000000000006','brows'),
 ('b0000000-0000-0000-0000-000000000007','hair'),
 ('b0000000-0000-0000-0000-000000000007','makeup'),
 ('b0000000-0000-0000-0000-000000000008','brows');

-- ===================== SERVICES =====================
insert into public.services (business_id, name, name_ka, category, duration_minutes, price_min, price_max, sort_order) values
 -- Mitte (hair)
 ('b0000000-0000-0000-0000-000000000001','Signature Haircut','ხელმოწერის შეჭრა','hair',60,120,180,1),
 ('b0000000-0000-0000-0000-000000000001','Single-Process Colour','ერთეტაპიანი ღებვა','hair',90,220,320,2),
 ('b0000000-0000-0000-0000-000000000001','Editorial Highlights','სარედაქციო ღია ღერები','hair',180,380,620,3),
 ('b0000000-0000-0000-0000-000000000001','Olaplex Bond Treatment','ოლაპლექსის მკურნალობა','hair',45,90,140,4),
 ('b0000000-0000-0000-0000-000000000001','Brow Architecture','წარბების არქიტექტურა','brows',30,50,80,5),
 -- Luxe Nails
 ('b0000000-0000-0000-0000-000000000002','Classic Manicure','კლასიკური მანიკიური','nails',45,40,60,1),
 ('b0000000-0000-0000-0000-000000000002','Gel Manicure','გელის მანიკიური','nails',75,70,110,2),
 ('b0000000-0000-0000-0000-000000000002','Russian Pedicure','რუსული პედიკიური','nails',90,90,140,3),
 ('b0000000-0000-0000-0000-000000000002','Nail Art (per set)','ნეილ-არტი','nails',60,60,150,4),
 -- Derma (skin)
 ('b0000000-0000-0000-0000-000000000003','Deep-Cleanse Facial','ღრმა წმენდის ფეშელი','skin',60,100,140,1),
 ('b0000000-0000-0000-0000-000000000003','Chemical Peel','ქიმიური პილინგი','skin',45,150,220,2),
 ('b0000000-0000-0000-0000-000000000003','Laser Hair Removal (small)','ლაზერული ეპილაცია','skin',30,80,120,3),
 ('b0000000-0000-0000-0000-000000000003','Hydrafacial','ჰიდრაფეშელი','skin',75,180,260,4),
 -- Serenity (massage)
 ('b0000000-0000-0000-0000-000000000004','Swedish Massage 60','შვედური მასაჟი 60','massage',60,110,110,1),
 ('b0000000-0000-0000-0000-000000000004','Deep-Tissue Massage 90','ღრმა ქსოვილოვანი 90','massage',90,160,160,2),
 ('b0000000-0000-0000-0000-000000000004','Hot-Stone Therapy','ცხელი ქვების თერაპია','massage',75,150,190,3),
 ('b0000000-0000-0000-0000-000000000004','Aromatherapy Massage','არომათერაპიული მასაჟი','massage',60,130,130,4),
 -- Sharp Cuts (barber)
 ('b0000000-0000-0000-0000-000000000005','Classic Cut','კლასიკური შეჭრა','barber',45,40,60,1),
 ('b0000000-0000-0000-0000-000000000005','Skin Fade','სქინ-ფეიდი','barber',50,50,70,2),
 ('b0000000-0000-0000-0000-000000000005','Hot-Towel Shave','ცხელი პირსახოცით პარსვა','barber',40,45,65,3),
 ('b0000000-0000-0000-0000-000000000005','Beard Sculpt','წვერის ფორმირება','barber',30,30,45,4),
 -- Glow Makeup
 ('b0000000-0000-0000-0000-000000000006','Event Makeup','ღონისძიების მაკიაჟი','makeup',60,120,180,1),
 ('b0000000-0000-0000-0000-000000000006','Bridal Makeup + Trial','საქორწინო მაკიაჟი + ცდა','makeup',150,350,500,2),
 ('b0000000-0000-0000-0000-000000000006','Lash Application','წამწამების დაკვრა','makeup',45,60,90,3),
 -- Black Sea Beauty (hair)
 ('b0000000-0000-0000-0000-000000000007','Womens Cut & Style','ქალის შეჭრა & სტაილი','hair',60,90,140,1),
 ('b0000000-0000-0000-0000-000000000007','Balayage','ბალაიაჟი','hair',180,300,520,2),
 ('b0000000-0000-0000-0000-000000000007','Bridal Hair','საქორწინო ვარცხნილობა','hair',90,200,320,3),
 -- Rioni Brow Lab (brows)
 ('b0000000-0000-0000-0000-000000000008','Brow Lamination','წარბების ლამინაცია','brows',45,60,90,1),
 ('b0000000-0000-0000-0000-000000000008','Microblading','მიკრობლეიდინგი','brows',120,250,350,2),
 ('b0000000-0000-0000-0000-000000000008','Lash Lift','წამწამების აწევა','brows',60,70,100,3);

-- ===================== STAFF =====================
insert into public.staff (business_id, name, name_ka, specialty, specialty_ka, sort_order) values
 ('b0000000-0000-0000-0000-000000000001','Nino Beridze','ნინო ბერიძე','Creative Director, Colour','შემოქმედებითი დირექტორი, ფერი',1),
 ('b0000000-0000-0000-0000-000000000001','Salome Khazaradze','სალომე ხაზარაძე','Senior Stylist','უფროსი სტილისტი',2),
 ('b0000000-0000-0000-0000-000000000001','Giorgi Tsiklauri','გიორგი წიკლაური','Barber & Brow Specialist','ბარბერი & წარბები',3),
 ('b0000000-0000-0000-0000-000000000002','Ana Kapanadze','ანა კაპანაძე','Lead Nail Technician','წამყვანი მანიკიურის სპეციალისტი',1),
 ('b0000000-0000-0000-0000-000000000002','Mariam Lomidze','მარიამ ლომიძე','Nail Artist','ნეილ-არტისტი',2),
 ('b0000000-0000-0000-0000-000000000003','Dr. Tamar Gelashvili','დრ. თამარ გელაშვილი','Dermatologist','დერმატოლოგი',1),
 ('b0000000-0000-0000-0000-000000000003','Eka Nadiradze','ეკა ნადირაძე','Aesthetician','კოსმეტოლოგი',2),
 ('b0000000-0000-0000-0000-000000000004','Levan Kvaratskhelia','ლევან კვარაცხელია','Massage Therapist','მასაჟისტი',1),
 ('b0000000-0000-0000-0000-000000000004','Keti Bochorishvili','ქეთი ბოჭორიშვილი','Spa Therapist','სპა თერაპევტი',2),
 ('b0000000-0000-0000-0000-000000000005','Dato Maisuradze','დათო მაისურაძე','Master Barber','მასტერ ბარბერი',1),
 ('b0000000-0000-0000-0000-000000000005','Irakli Jorjadze','ირაკლი ჯორჯაძე','Barber','ბარბერი',2),
 ('b0000000-0000-0000-0000-000000000006','Sopho Torder','სოფო ტორდუა','Lead MUA','წამყვანი ვიზაჟისტი',1),
 ('b0000000-0000-0000-0000-000000000006','Nia Chkheidze','ნია ჩხეიძე','Makeup Artist','ვიზაჟისტი',2),
 ('b0000000-0000-0000-0000-000000000007','Tako Verdzeuli','თაკო ვერძეული','Senior Colourist','უფროსი კოლორისტი',1),
 ('b0000000-0000-0000-0000-000000000007','Maka Tsetskhladze','მაკა ცეცხლაძე','Stylist','სტილისტი',2),
 ('b0000000-0000-0000-0000-000000000008','Elene Kacharava','ელენე კაჭარავა','Brow & Lash Artist','წარბ-წამწამის არტისტი',1);

-- ===================== REVIEWS =====================
insert into public.reviews (business_id, customer_name, rating, comment, created_at) values
 ('b0000000-0000-0000-0000-000000000001','Mariam G.',5,'Best colour work in Tbilisi. Nino is a genius.', now() - interval '20 days'),
 ('b0000000-0000-0000-0000-000000000001','Tamta L.',5,'Editorial highlights came out perfect.', now() - interval '12 days'),
 ('b0000000-0000-0000-0000-000000000001','Ana B.',4,'Lovely cut, slightly long wait.', now() - interval '5 days'),
 ('b0000000-0000-0000-0000-000000000002','Lika M.',5,'Gel manicure lasted three weeks!', now() - interval '15 days'),
 ('b0000000-0000-0000-0000-000000000002','Salome T.',4,'Great nail art, cozy studio.', now() - interval '8 days'),
 ('b0000000-0000-0000-0000-000000000003','Nino K.',5,'Hydrafacial left my skin glowing.', now() - interval '18 days'),
 ('b0000000-0000-0000-0000-000000000003','Eka D.',4,'Professional team, clean clinic.', now() - interval '6 days'),
 ('b0000000-0000-0000-0000-000000000004','Giorgi P.',5,'Deep-tissue massage was exactly what I needed.', now() - interval '10 days'),
 ('b0000000-0000-0000-0000-000000000004','Keti R.',5,'So relaxing, hot stones were amazing.', now() - interval '3 days'),
 ('b0000000-0000-0000-0000-000000000005','Luka G.',5,'Cleanest fade I have had. Highly recommend.', now() - interval '9 days'),
 ('b0000000-0000-0000-0000-000000000005','Sandro K.',4,'Solid shave, good vibe.', now() - interval '4 days'),
 ('b0000000-0000-0000-0000-000000000006','Mari Q.',5,'Bridal makeup was flawless all day.', now() - interval '22 days'),
 ('b0000000-0000-0000-0000-000000000006','Nutsa V.',4,'Loved the event look.', now() - interval '7 days'),
 ('b0000000-0000-0000-0000-000000000007','Tina B.',5,'Balayage by the sea — dreamy.', now() - interval '14 days'),
 ('b0000000-0000-0000-0000-000000000008','Sofo L.',5,'Brow lamination changed my mornings.', now() - interval '11 days'),
 ('b0000000-0000-0000-0000-000000000008','Ana T.',4,'Great microblading result.', now() - interval '2 days');

-- NOTE: businesses.rating and review_count are maintained automatically by the
-- reviews_recompute_rating trigger (recompute_business_rating()), which fires on
-- each review insert above. No manual sync needed.

-- ===================== A FEW BOOKINGS (next days) =====================
-- end_datetime is filled by the bookings_compute_end trigger.
insert into public.bookings (business_id, service_id, staff_id, customer_name, customer_phone, appointment_datetime, duration_minutes, booking_source, price)
select 'b0000000-0000-0000-0000-000000000001',
       (select id from public.services where business_id='b0000000-0000-0000-0000-000000000001' and name='Signature Haircut'),
       (select id from public.staff where business_id='b0000000-0000-0000-0000-000000000001' and name='Nino Beridze'),
       'Mariam G.','+995 555 010101',
       (now() at time zone 'Asia/Tbilisi')::date + interval '1 day' + time '11:00', 60,'web',150;

insert into public.bookings (business_id, service_id, staff_id, customer_name, customer_phone, appointment_datetime, duration_minutes, booking_source, price)
select 'b0000000-0000-0000-0000-000000000001',
       (select id from public.services where business_id='b0000000-0000-0000-0000-000000000001' and name='Editorial Highlights'),
       (select id from public.staff where business_id='b0000000-0000-0000-0000-000000000001' and name='Nino Beridze'),
       'Tamta L.','+995 555 020202',
       (now() at time zone 'Asia/Tbilisi')::date + interval '2 days' + time '13:30', 180,'voice',480;

insert into public.bookings (business_id, service_id, staff_id, customer_name, customer_phone, appointment_datetime, duration_minutes, booking_source, price)
select 'b0000000-0000-0000-0000-000000000002',
       (select id from public.services where business_id='b0000000-0000-0000-0000-000000000002' and name='Gel Manicure'),
       (select id from public.staff where business_id='b0000000-0000-0000-0000-000000000002' and name='Ana Kapanadze'),
       'Lika M.','+995 555 030303',
       (now() at time zone 'Asia/Tbilisi')::date + interval '1 day' + time '15:00', 75,'instagram',90;

insert into public.bookings (business_id, service_id, staff_id, customer_name, customer_phone, appointment_datetime, duration_minutes, booking_source, price)
select 'b0000000-0000-0000-0000-000000000004',
       (select id from public.services where business_id='b0000000-0000-0000-0000-000000000004' and name='Deep-Tissue Massage 90'),
       (select id from public.staff where business_id='b0000000-0000-0000-0000-000000000004' and name='Levan Kvaratskhelia'),
       'Giorgi P.','+995 555 040404',
       (now() at time zone 'Asia/Tbilisi')::date + interval '3 days' + time '18:00', 90,'web',160;

-- ===================== SUBSCRIPTIONS =====================
insert into public.subscriptions (business_id, plan, status, trial_ends_at, salome_enabled, salome_plan, languages, monthly_call_limit) values
 ('b0000000-0000-0000-0000-000000000001','growth','trial', now() + interval '14 days', true,'standard', array['ka','en','ru'],500),
 ('b0000000-0000-0000-0000-000000000003','growth','active', null, true,'standard', array['ka','en'],500),
 ('b0000000-0000-0000-0000-000000000007','starter','active', null, true,'basic', array['ka','en','ru'],200);

commit;

-- ===================== SUMMARY =====================
-- Scoped to the seed's own mock rows (b0000000-... businesses) so the counts
-- reflect what this file inserted, not any other staging data.
with mock as (select id from public.businesses where id::text like 'b0000000-0000-0000-0000-%')
select 'businesses' as t, count(*) from mock
union all select 'services', count(*) from public.services where business_id in (select id from mock)
union all select 'staff', count(*) from public.staff where business_id in (select id from mock)
union all select 'business_categories', count(*) from public.business_categories where business_id in (select id from mock)
union all select 'reviews', count(*) from public.reviews where business_id in (select id from mock)
union all select 'bookings', count(*) from public.bookings where business_id in (select id from mock)
union all select 'subscriptions', count(*) from public.subscriptions where business_id in (select id from mock);
