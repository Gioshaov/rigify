import { createClient } from "@/lib/supabase/server";
import { BusinessGrid } from "./BusinessGrid";
import Link from "next/link";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { getServerTranslations } from "@/lib/utils/server-translations";
import { CITIES } from "@/lib/constants/cities";

export default async function BusinessesPage({
  searchParams
}: {
  searchParams: Promise<{ city?: string }>
}) {
  const { tr, lang } = getServerTranslations();
  const supabase = createClient();
  const params = await searchParams;
  const cityFilter = params.city;

  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from("businesses")
    .select(`
      id,
      slug,
      name,
      description,
      city,
      district,
      address,
      cover_image_url,
      logo_url,
      rating,
      review_count,
      business_categories (
        category_id
      )
    `)
    .eq("is_active", true);

  const validCities = CITIES.map(c => c.id);
  if (cityFilter && validCities.includes(cityFilter)) {
    query = query.eq("city", cityFilter);
  }

  const { data: businesses } = await query.order("created_at", { ascending: false });

  const cityObj = cityFilter ? CITIES.find(c => c.id === cityFilter) : null;
  const cityName = cityObj ? cityObj[lang] : null;

  return (
    <main className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <header>
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between">
          <Link href="/" className="font-mono text-data-label uppercase tracking-[0.2em] text-primary">
            RIGIFY
          </Link>
          <nav className="flex items-center gap-stack-md">
            {user ? (
              <>
                <Link href="/customer/dashboard" className="label-mono hover:text-primary hidden md:block">
                  {tr.common.myAccount[lang]}
                </Link>
                <form action="/logout" method="post" className="inline">
                  <button type="submit" className="btn-secondary !py-2">
                    {tr.common.signOut[lang]}
                  </button>
                </form>
                <LanguageToggle />
              </>
            ) : (
              <>
                <Link href="/login" className="label-mono hover:text-primary hidden md:block">
                  {tr.common.signIn[lang]}
                </Link>
                <Link href="/customer-register" className="btn-secondary !py-2">
                  {tr.common.signUp[lang]}
                </Link>
                <LanguageToggle />
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section>
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <p className="label-mono text-primary mb-stack-md">
            {cityName ? `${cityName.toUpperCase()} · ` : `${tr.browsePage.browse[lang]} · `}{businesses?.length || 0} {tr.browsePage.studios[lang]}
          </p>
          <h1 className="text-display-lg-mobile md:text-display-lg max-w-3xl">
            {cityName
              ? tr.browsePage.beautyInCity[lang].replace('{city}', cityName)
              : tr.browsePage.discoverProfessionals[lang]}
          </h1>
          <p className="mt-stack-lg text-body-lg text-on-surface-variant max-w-2xl">
            {tr.browsePage.bookAppointments[lang]}{cityName ? tr.browsePage.inCity[lang].replace('{city}', cityName) : tr.browsePage.acrossGeorgia[lang]}.
          </p>
        </div>
      </section>

      {/* Businesses */}
      <section>
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <BusinessGrid businesses={businesses || []} />

          {(!businesses || businesses.length === 0) && (
            <div className="text-center py-section-gap border border-outline-variant bg-surface">
              <p className="label-mono text-on-surface-variant mb-stack-md">
                {tr.browsePage.noBusinesses[lang]}
              </p>
              <p className="text-body-lg text-on-surface-variant">
                {tr.browsePage.checkBackSoon[lang]}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-section-gap">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col md:flex-row justify-between gap-stack-md text-on-surface-variant">
          <p className="label-mono">© {new Date().getFullYear()} RIGIFY</p>
          <p className="label-mono">RIGIFY.GE</p>
        </div>
      </footer>
    </main>
  );
}
