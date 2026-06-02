import Link from "next/link";
import { CATEGORIES } from "@/lib/constants/categories";
import { CITIES } from "@/lib/constants/cities";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-on-surface">
      <header className="border-b border-outline-variant">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop h-16 flex items-center justify-between">
          <Link href="/" className="font-mono text-data-label uppercase tracking-[0.2em] text-primary">
            RIGIFY
          </Link>
          <nav className="hidden md:flex items-center gap-stack-lg">
            <Link href="/" className="label-mono hover:text-primary">Home</Link>
            <Link href="/tbilisi/hair" className="label-mono hover:text-primary">Categories</Link>
            <Link href="/for-businesses" className="label-mono hover:text-primary">For Business</Link>
            <Link href="/login" className="btn-secondary !py-2">Sign in</Link>
          </nav>
        </div>
      </header>

      <section className="border-b border-outline-variant">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <p className="label-mono text-primary mb-stack-md">PREMIUM · TBILISI · BATUMI · KUTAISI</p>
          <h1 className="text-display-lg-mobile md:text-display-lg max-w-3xl">
            Georgia&rsquo;s most precise way to book beauty and wellness.
          </h1>
          <p className="mt-stack-lg text-body-lg text-on-surface-variant max-w-2xl">
            From editorial colour to deep-tissue massage — discover vetted studios, book in seconds, and pay nothing extra.
          </p>
          <div className="mt-stack-lg flex flex-wrap gap-stack-md">
            <Link href="/tbilisi/hair" className="btn-primary">Browse studios</Link>
            <Link href="/for-businesses" className="btn-secondary">For Businesses</Link>
          </div>
        </div>
      </section>

      <section className="border-b border-outline-variant">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <p className="label-mono mb-stack-lg">CATEGORIES</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-outline-variant">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                href={`/tbilisi/${c.id}`}
                className="bg-background p-gutter hover:bg-surface transition-colors group"
              >
                <p className="font-mono text-data-label uppercase tracking-wider text-on-surface-variant group-hover:text-primary">
                  {c.id}
                </p>
                <p className="mt-stack-sm text-headline-md">{c.en}</p>
                <p className="text-body-md text-on-surface-variant">{c.ka}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-section-gap">
          <p className="label-mono mb-stack-lg">CITIES</p>
          <div className="flex flex-wrap gap-stack-md">
            {CITIES.map((city) => (
              <Link key={city.id} href={`/${city.id}/hair`} className="btn-secondary">
                {city.en} · {city.ka}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-outline-variant">
        <div className="mx-auto max-w-container px-margin-mobile md:px-margin-desktop py-stack-lg flex flex-col md:flex-row justify-between gap-stack-md text-on-surface-variant">
          <p className="label-mono">© {new Date().getFullYear()} RIGIFY</p>
          <p className="label-mono">RIGIFY.GE</p>
        </div>
      </footer>
    </main>
  );
}
