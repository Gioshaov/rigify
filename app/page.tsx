'use client'

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { SiteNav } from "@/components/navigation/SiteNav";

export default function HomePage() {
  const categories = [
    {
      name: "Hair Salons",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHeqsjr9sht1Gl8-MdQdHV7rmmihBjI_yv3g4J-JsgNQa47Sskn0U_qEx_KtAyG2Y5fc8wu-6I2TCEilFkLJ3CQgpz_QeaJciarwzh2Pfm4696aUAKHIhsRjmJyoLHeRVaUPPsTWBYJYUbeIk-fFU1lUi1dxQMfM6Z3H8o8HZ221LdigiCBCkoRb2WG7OtcyuH__oFrpKs-q6Chb7cVQo5HqC7BBRS8SaNcX3M-dPeoov6-40FXuwxhI9JPhmnK22Kmcfk0Qx_Ftg",
      href: "/businesses?category=hair"
    },
    {
      name: "Barbershops",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQwakR8Q5VF2ZsLImc1VZC90fzToIefLCDbb5hj2nlDtRdvcc-iLNs1T-lWiLtjhRwlqQI5w9QoPylUx40T6W6eAIq6UkNHjIli780EL_B5BUA29PlRIlbufWtencqCIf-0sPF_Pmt-vv7JUl8akEZVSl8Lffep3zUbr8BTMwZWNKkqf15sgGq-8Hqq4txWJuDld5tFQkybrhpRcPlgUfJCGeWyUM9Cv5g1nViTK_0IXMija0RsYqI38h8bc2pEMYIIG6EUsaUzgo",
      href: "/businesses?category=barber"
    },
    {
      name: "Nail Salons",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqUdjOSD-xc0mABGTFwOazbd5udjwGOr7Drau01uKQlBZEGXoEkuG59bZBU76zBcPjzHU7lIFz8vUI8R8sDcKJyigGMWRuTwPzcuaw3P8t3cu3cgWITmSR2snJpPL4nUc_tNaMfhdIc6CJwK-3_fOpir__Jl_3XaOJ3gNDClqBuRVY6TPvGI_CVwnjimrvmcdp1PfA_6TXmEawgzBl6Bzm6kwDOachoDuKe7hZT1AbzHznXPFbDvhjN2V5m4AhPbeJLobiWkj03Xk",
      href: "/businesses?category=nails"
    },
    {
      name: "Massage & Spa",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmyAPAuhZmdsSBuo5f8usexopqoLfPgjZnkhPvvnH0bn6ICMOvOknMVAM8OlXM0ceyx5d1LAqqqY7U5POb3ldj31gBE9vsvORvQudTtqOgYo2Jdcx0xSoD_9Ba2X2gwhb6V0CdjkS6Q-kzwZRzvu3ZC6tmGzOFPxgI_RwDfj_reMoRfTP2pk0EgD_H4P_9D9EfrQfNp_Rqqs55fF28GARj2HMGTE2Pd0ntwO06LMrO_mumogtojbn-QaAlIeqdP8FvNkmatVuMlXE",
      href: "/businesses?category=massage"
    },
    {
      name: "Cosmetology",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWrhjQH7D12EYRosNP9sO8ZTyg5D8wY30EZyXA8Gk9ZVn7sylNsXM6oLJCKQhUuW5bXEckIhejC68B01OVrKZFozB4YfmmxA9z266er5VEt4eDYLBJQsPV1z6EI1CcswZNMkLSdSz9QOti0RF-JJOm32qWiUSzdn2Nc4Kz1AyOuguo8uc4jekkfvg27wNfQYJu4GxNizAWtFekVpSoIX8QuVwOQ7DSF4SQ7fR9ieWdDD24Ivy8pVdTXe4EEIEnFSRg6ROD8Xzgh6w",
      href: "/businesses?category=cosmetology"
    },
    {
      name: "Tattoo & Piercing",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWO2NuKRMlVxTdjc-f0e21-YYWcsf71D_By00uNSrbUi1EZ2aBpWeijKtnqIQOIeZ_cHntPnTHK5WedlED75w3AZeHkECSpbMH3gtoYGWHtfofSQk9qcVFo_4417fIhGz9V-MFN5Al6dMXYR6HaLXjMWYvPupoLrMKmQz6FUDRlmNIvp6sDZZ5j4gcYA7sm8Qgkufgc7-6GJCyZ33SWk5wbxeQrDK3mH942lChpzTniOP3xHN5IDATERO3TUD_8NSSJG11cCoRlx0",
      href: "/businesses?category=tattoo"
    }
  ];

  return (
    <div className="min-h-dvh bg-background text-on-surface">
      <a data-testid="home-skip-to-main-link" href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteNav />

      <main id="main-content">
      {/* Hero Section */}
      <section className="relative flex flex-col justify-center py-section-gap lg:min-h-[520px]">
        <Container>
          <div className="relative">
            <div className="max-w-3xl space-y-8">
              <div className="flex items-center gap-2">
                <span className="w-8 h-[1px] bg-primary"></span>
              </div>
              <h1 className="font-hanken text-display-lg md:text-[64px] leading-tight text-white tracking-tighter font-bold">
                Book Beauty & Wellness <br />Appointments in <span className="text-primary italic">Georgia</span>
              </h1>
              <p className="font-hanken text-body-lg text-on-surface-variant max-w-xl">
                Discover local professionals in Tbilisi. Experience a curated marketplace of world-class artisans and wellness practitioners.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link data-testid="hero-browse-studios-btn" href="/businesses?reset=1" className="bg-primary text-on-primary px-10 py-5 font-mono text-data-label uppercase tracking-widest transition-all duration-300 hover:brightness-110 active:scale-[0.98] text-center">
                  Browse Studios
                </Link>
                <Link data-testid="hero-for-businesses-btn" href="/for-businesses" className="border border-white/20 text-white px-10 py-5 font-mono text-data-label uppercase tracking-widest transition-all duration-300 hover:border-primary hover:text-primary active:scale-[0.98] text-center">
                  For Businesses
                </Link>
              </div>
            </div>

            {/* Hero Image Frame (Desktop only) */}
            <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-1/3 aspect-[4/5] border border-white/10 p-4 bg-surface-container-lowest">
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDl91M7x3SfK7ePZrib2pMktEZNPCptK4Hssn8flQ5_FmUq5MFMQD98Lj-IOOXd64FATAIcSy6oE7mDhm6xT7rYIea8llgJy9bdThdUSUak5jTOOXw94aGHbElOix8zKs-qp2CMwnYdZE5Dl0iS26c7Mxf13Ldd0vnPfL_cGhOtYh4FOpSnsziYQnSM5BoT6QG0MFpS14zKU2rGZIgHwBO3cAubkNcMsQn-7olKlrl-OXJ9qnexVvgo4nk_0g2MPewiSmHanD2llc8"
                  alt="Premium beauty treatment"
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-transform duration-700 hover:scale-110"
                  priority
                />
                <div className="absolute bottom-4 left-4 bg-surface/80 backdrop-blur-md px-4 py-2 border-l-2 border-primary">
                  <span className="font-mono text-[10px] text-primary uppercase tracking-[0.2em]">Elite Artisans</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Categories Grid */}
      <section className="py-section-gap">
        <Container>
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-hanken text-headline-md text-white font-semibold">Categories</h2>
            </div>
            <div className="hidden md:block h-[1px] flex-grow mx-12 bg-white/10"></div>
            <Link data-testid="view-all-categories-link" href="/businesses?reset=1" className="font-mono text-[10px] text-on-surface-variant hover:text-primary uppercase flex items-center gap-2 tracking-[0.2em]">
              View All Categories <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                data-testid={`category-card-${index}`}
                href={category.href}
                className="group relative bg-surface-container overflow-hidden aspect-video md:aspect-[16/7]"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover opacity-50 grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-80"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="relative h-full p-8 flex flex-col justify-end bg-gradient-to-t from-surface to-transparent">
                  <h3 className="font-hanken text-headline-md text-white mb-2 font-semibold">{category.name}</h3>
                  <div className="h-0.5 w-0 bg-primary transition-all duration-500 group-hover:w-16"></div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Cities Section */}
      <section className="py-section-gap">
        <Container>
          <div className="text-center mb-16">
            <p className="font-mono text-data-label text-primary uppercase tracking-[0.4em] mb-4">The Expansion</p>
            <h2 className="font-mono text-display-lg-mobile text-white uppercase font-bold">Regional Presence</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Tbilisi - Active */}
            <div className="flex-1 border border-primary p-8 bg-surface-container-high transition-transform duration-300 hover:-translate-y-2">
              <div className="flex justify-between items-start mb-12">
                <span className="material-symbols-outlined text-primary text-4xl">location_on</span>
                <div className="px-3 py-1 border border-primary text-primary font-mono text-[10px] uppercase tracking-[0.2em]">Active</div>
              </div>
              <h3 className="font-mono text-display-lg-mobile text-white mb-4 font-bold">Tbilisi</h3>
              <p className="font-hanken text-body-md text-on-surface-variant mb-8">
                The heart of Georgian beauty. Over 200+ premium studios and independent artisans ready for booking.
              </p>
              <Link data-testid="explore-tbilisi-link" href="/businesses?reset=1" className="flex items-center gap-2 text-primary font-mono text-data-label uppercase group cursor-pointer">
                Explore City <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-2">east</span>
              </Link>
            </div>

            {/* Batumi - Coming Soon */}
            <div className="flex-1 border border-white/10 p-8 bg-surface-container opacity-60 transition-all duration-300 hover:opacity-100 group">
              <div className="flex justify-between items-start mb-12">
                <span className="material-symbols-outlined text-on-surface-variant text-4xl">waves</span>
                <div className="px-3 py-1 border border-white/20 text-on-surface-variant font-mono text-[10px] uppercase tracking-[0.2em]">Coming Soon</div>
              </div>
              <h3 className="font-mono text-display-lg-mobile text-white mb-4 font-bold">Batumi</h3>
              <p className="font-hanken text-body-md text-on-surface-variant mb-8">
                Coastal elegance meets premium wellness. Bringing the Rigify standard to the Black Sea coast this summer.
              </p>
              <div className="h-[1px] w-12 bg-white/20 group-hover:bg-primary transition-colors duration-300"></div>
            </div>

            {/* Kutaisi - Coming Soon */}
            <div className="flex-1 border border-white/10 p-8 bg-surface-container opacity-60 transition-all duration-300 hover:opacity-100 group">
              <div className="flex justify-between items-start mb-12">
                <span className="material-symbols-outlined text-on-surface-variant text-4xl">architecture</span>
                <div className="px-3 py-1 border border-white/20 text-on-surface-variant font-mono text-[10px] uppercase tracking-[0.2em]">Coming Soon</div>
              </div>
              <h3 className="font-mono text-display-lg-mobile text-white mb-4 font-bold">Kutaisi</h3>
              <p className="font-hanken text-body-md text-on-surface-variant mb-8">
                Preserving tradition while embracing modern grooming. Our network is expanding to the historic capital soon.
              </p>
              <div className="h-[1px] w-12 bg-white/20 group-hover:bg-primary transition-colors duration-300"></div>
            </div>
          </div>
        </Container>
      </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-white/10 py-16 mb-20 md:mb-0">
        <Container className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="font-mono text-display-lg-mobile text-primary uppercase mb-6 tracking-tighter font-bold">RIGIFY</h2>
            <p className="font-hanken text-body-md text-on-surface-variant max-w-sm mb-8">
              The ultimate destination for luxury beauty and wellness services in Georgia. Connecting elite practitioners with discerning clients.
            </p>
            <div className="flex gap-4">
              <a data-testid="footer-facebook-link" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-primary hover:text-primary transition-all" href="#" aria-label="Facebook">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a data-testid="footer-instagram-link" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-primary hover:text-primary transition-all" href="#" aria-label="Instagram">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a data-testid="footer-email-link" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-primary hover:text-primary transition-all" href="#" aria-label="Email">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <ul className="space-y-4 font-hanken text-body-md text-on-surface-variant">
              <li><Link data-testid="footer-browse-studios" href="/businesses?reset=1" className="hover:text-primary transition-colors">Browse Studios</Link></li>
              <li><Link data-testid="footer-reviews" href="/" className="hover:text-primary transition-colors">Reviews</Link></li>
              <li><Link data-testid="footer-register-business" href="/for-businesses" className="hover:text-primary transition-colors">Register Business</Link></li>
              <li><Link data-testid="footer-support" href="/help" className="hover:text-primary transition-colors">Support</Link></li>
            </ul>
          </div>
        </Container>

        <Container className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">
          <span>© 2024 RIGIFY. All rights reserved.</span>
          <div className="flex gap-8">
            <Link data-testid="footer-privacy-policy" href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link data-testid="footer-terms-of-service" href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </Container>
      </footer>

    </div>
  );
}
