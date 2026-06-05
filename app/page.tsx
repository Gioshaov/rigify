'use client'

import Link from "next/link";
import { useState, useEffect } from "react";
import { CATEGORIES } from "@/lib/constants/categories";
import { createClient } from "@/lib/supabase/client";
import { CitiesSection } from "@/components/marketing/CitiesSection";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useTranslations } from "@/lib/hooks/useTranslations";

export default function HomePage() {
  const { tr, t, lang } = useTranslations();
  const [user, setUser] = useState<any>(null);
  const [dashboardLink, setDashboardLink] = useState("/login");

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (currentUser) {
        setUser(currentUser);

        const [
          { data: business },
          { data: customer }
        ] = await Promise.all([
          supabase.from("businesses").select("id").eq("owner_id", currentUser.id).maybeSingle(),
          supabase.from("customers").select("id").eq("id", currentUser.id).maybeSingle()
        ]);

        setDashboardLink(business ? "/dashboard" : customer ? "/customer/dashboard" : "/login");
      }
    }

    loadUser();
  }, []);

  return (
    <main className="min-h-screen bg-background text-on-surface">
        <header>
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between">
          <Link href="/" className="font-mono text-data-label uppercase tracking-[0.2em] text-primary">
            RIGIFY
          </Link>
          <nav className="hidden md:flex items-center gap-stack-lg">
            <Link href="/" className="label-mono hover:text-primary">{tr.common.home[lang]}</Link>
            <Link href="/businesses" className="label-mono hover:text-primary">{tr.common.browse[lang]}</Link>
            <Link href="/for-businesses" className="label-mono hover:text-primary">{tr.common.forBusiness[lang]}</Link>
            {user ? (
              <>
                <Link href={dashboardLink} className="label-mono hover:text-primary">{tr.common.myAccount[lang]}</Link>
                <form action="/logout" method="post" className="inline">
                  <button type="submit" className="btn-secondary !py-2">
                    {tr.common.signOut[lang]}
                  </button>
                </form>
                <LanguageToggle />
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary !py-2">{tr.common.signIn[lang]}</Link>
                <LanguageToggle />
              </>
            )}
          </nav>
        </div>
      </header>

      <section>
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <p className="label-mono text-primary mb-stack-md">{tr.homepage.hero.subtitle[lang]}</p>
          <h1 className="text-display-lg-mobile md:text-display-lg max-w-3xl">
            {tr.homepage.hero.title[lang]}
          </h1>
          <p className="mt-stack-lg text-body-lg text-on-surface-variant max-w-2xl">
            {tr.homepage.hero.description[lang]}
          </p>
          <div className="mt-stack-lg flex flex-wrap gap-stack-md">
            <Link href="/tbilisi/hair" className="btn-primary">{tr.homepage.hero.browseStudios[lang]}</Link>
            <Link href="/for-businesses" className="btn-secondary">{tr.common.forBusiness[lang]}</Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <p className="label-mono mb-stack-lg">{tr.homepage.categories[lang]}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                href={`/tbilisi/${c.id}`}
                className="p-gutter hover:bg-surface transition-colors group"
              >
                <p className="text-headline-md">{c[lang]}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CitiesSection />

      <footer>
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col md:flex-row justify-between gap-stack-md text-on-surface-variant">
          <p className="label-mono">© {new Date().getFullYear()} RIGIFY</p>
          <p className="label-mono">RIGIFY.GE</p>
        </div>
      </footer>
    </main>
  );
}
