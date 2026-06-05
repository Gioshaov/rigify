'use client'

import { createClient } from "@/lib/supabase/client";
import { BusinessGrid } from "./BusinessGrid";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useTranslations } from "@/lib/hooks/useTranslations";
import { CITIES } from "@/lib/constants/cities";

export default function BusinessesPage() {
  const { tr, lang } = useTranslations();
  const searchParams = useSearchParams();
  const cityFilter = searchParams.get('city');

  const [user, setUser] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      // Check if user is logged in
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      // Fetch active businesses, optionally filtered by city
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

      // Apply city filter if provided
      if (cityFilter) {
        query = query.eq("city", cityFilter);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching businesses:", error);
      }

      setBusinesses(data || []);
      setLoading(false);
    }

    loadData();
  }, [cityFilter]);

  // Get city object for translation
  const cityObj = cityFilter ? CITIES.find(c => c.id === cityFilter) : null;
  const cityName = cityObj ? cityObj[lang] : null;

  return (
    <main className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <header className="border-b border-outline-variant">
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
      <section className="border-b border-outline-variant">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <p className="label-mono text-primary mb-stack-md">
            {cityName ? `${cityName.toUpperCase()} · ` : `${tr.browsePage.browse[lang]} · `}{businesses.length} {tr.browsePage.studios[lang]}
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
          {loading ? (
            <div className="text-center py-section-gap">
              <p className="label-mono text-on-surface-variant">{tr.common.loading[lang]}</p>
            </div>
          ) : (
            <>
              <BusinessGrid businesses={businesses} />

              {businesses.length === 0 && (
                <div className="text-center py-section-gap border border-outline-variant bg-surface">
                  <p className="label-mono text-on-surface-variant mb-stack-md">
                    {tr.browsePage.noBusinesses[lang]}
                  </p>
                  <p className="text-body-lg text-on-surface-variant">
                    {tr.browsePage.checkBackSoon[lang]}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant mt-section-gap">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col md:flex-row justify-between gap-stack-md text-on-surface-variant">
          <p className="label-mono">© {new Date().getFullYear()} RIGIFY</p>
          <p className="label-mono">RIGIFY.GE</p>
        </div>
      </footer>
    </main>
  );
}
