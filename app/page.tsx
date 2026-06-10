'use client'

import Link from "next/link";
import Image from "next/image";
import { UserMenu } from "@/components/ui/UserMenu";
import { BrowseLink } from "@/components/navigation/BrowseLink";

export default function HomePage() {
  const categories = [
    {
      name: "Hair Salons",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHeqsjr9sht1Gl8-MdQdHV7rmmihBjI_yv3g4J-JsgNQa47Sskn0U_qEx_KtAyG2Y5fc8wu-6I2TCEilFkLJ3CQgpz_QeaJciarwzh2Pfm4696aUAKHIhsRjmJyoLHeRVaUPPsTWBYJYUbeIk-fFU1lUi1dxQMfM6Z3H8o8HZ221LdigiCBCkoRb2WG7OtcyuH__oFrpKs-q6Chb7cVQo5HqC7BBRS8SaNcX3M-dPeoov6-40FXuwxhI9JPhmnK22Kmcfk0Qx_Ftg",
      href: "/tbilisi/hair"
    },
    {
      name: "Barbershops",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQwakR8Q5VF2ZsLImc1VZC90fzToIefLCDbb5hj2nlDtRdvcc-iLNs1T-lWiLtjhRwlqQI5w9QoPylUx40T6W6eAIq6UkNHjIli780EL_B5BUA29PlRIlbufWtencqCIf-0sPF_Pmt-vv7JUl8akEZVSl8Lffep3zUbr8BTMwZWNKkqf15sgGq-8Hqq4txWJuDld5tFQkybrhpRcPlgUfJCGeWyUM9Cv5g1nViTK_0IXMija0RsYqI38h8bc2pEMYIIG6EUsaUzgo",
      href: "/tbilisi/barber"
    },
    {
      name: "Nail Salons",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCqUdjOSD-xc0mABGTFwOazbd5udjwGOr7Drau01uKQlBZEGXoEkuG59bZBU76zBcPjzHU7lIFz8vUI8R8sDcKJyigGMWRuTwPzcuaw3P8t3cu3cgWITmSR2snJpPL4nUc_tNaMfhdIc6CJwK-3_fOpir__Jl_3XaOJ3gNDClqBuRVY6TPvGI_CVwnjimrvmcdp1PfA_6TXmEawgzBl6Bzm6kwDOachoDuKe7hZT1AbzHznXPFbDvhjN2V5m4AhPbeJLobiWkj03Xk",
      href: "/tbilisi/nails"
    },
    {
      name: "Massage & Spa",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBmyAPAuhZmdsSBuo5f8usexopqoLfPgjZnkhPvvnH0bn6ICMOvOknMVAM8OlXM0ceyx5d1LAqqqY7U5POb3ldj31gBE9vsvORvQudTtqOgYo2Jdcx0xSoD_9Ba2X2gwhb6V0CdjkS6Q-kzwZRzvu3ZC6tmGzOFPxgI_RwDfj_reMoRfTP2pk0EgD_H4P_9D9EfrQfNp_Rqqs55fF28GARj2HMGTE2Pd0ntwO06LMrO_mumogtojbn-QaAlIeqdP8FvNkmatVuMlXE",
      href: "/tbilisi/massage"
    },
    {
      name: "Cosmetology",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWrhjQH7D12EYRosNP9sO8ZTyg5D8wY30EZyXA8Gk9ZVn7sylNsXM6oLJCKQhUuW5bXEckIhejC68B01OVrKZFozB4YfmmxA9z266er5VEt4eDYLBJQsPV1z6EI1CcswZNMkLSdSz9QOti0RF-JJOm32qWiUSzdn2Nc4Kz1AyOuguo8uc4jekkfvg27wNfQYJu4GxNizAWtFekVpSoIX8QuVwOQ7DSF4SQ7fR9ieWdDD24Ivy8pVdTXe4EEIEnFSRg6ROD8Xzgh6w",
      href: "/tbilisi/cosmetology"
    },
    {
      name: "Tattoo & Piercing",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWO2NuKRMlVxTdjc-f0e21-YYWcsf71D_By00uNSrbUi1EZ2aBpWeijKtnqIQOIeZ_cHntPnTHK5WedlED75w3AZeHkECSpbMH3gtoYGWHtfofSQk9qcVFo_4417fIhGz9V-MFN5Al6dMXYR6HaLXjMWYvPupoLrMKmQz6FUDRlmNIvp6sDZZ5j4gcYA7sm8Qgkufgc7-6GJCyZ33SWk5wbxeQrDK3mH942lChpzTniOP3xHN5IDATERO3TUD_8NSSJG11cCoRlx0",
      href: "/tbilisi/tattoo"
    }
  ];

  return (
    <main className="min-h-screen bg-background text-on-surface">
      {/* Top Navigation */}
      <header className="sticky top-0 w-full z-50 flex items-center justify-between px-margin-mobile md:px-margin-desktop h-16 bg-surface border-b border-white/10">
        <div className="flex items-center gap-4">
          <span data-testid="language-toggle" className="material-symbols-outlined text-primary cursor-pointer">language</span>
          <Link data-testid="logo-link" href="/" className="font-mono text-display-lg-mobile text-primary tracking-tighter uppercase font-bold">
            RIGIFY
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link data-testid="nav-home" href="/" className="font-mono text-data-label uppercase text-primary transition-colors duration-200">
            Home
          </Link>
          <BrowseLink testId="nav-browse" className="font-mono text-data-label uppercase text-on-surface hover:text-primary transition-colors duration-200">
            Browse
          </BrowseLink>
          <Link data-testid="nav-my-bookings" href="/customer/dashboard" className="font-mono text-data-label uppercase text-on-surface hover:text-primary transition-colors duration-200">
            My Bookings
          </Link>
          <Link data-testid="nav-for-business" href="/for-businesses" className="font-mono text-data-label uppercase text-on-surface hover:text-primary transition-colors duration-200">
            For Business
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </header>

      <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex flex-col justify-center py-20">
          <div className="max-w-3xl space-y-8">
            <div className="flex items-center gap-2">
              <span className="w-8 h-[1px] bg-primary"></span>
            </div>
            <h2 className="font-hanken text-display-lg md:text-[64px] leading-tight text-white tracking-tighter font-bold">
              Book Beauty & Wellness <br />Appointments in <span className="text-primary italic">Georgia</span>
            </h2>
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
        </section>

        {/* Categories Grid */}
        <section className="py-24">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="font-hanken text-headline-md text-white font-semibold">Categories</p>
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
                  <h4 className="font-hanken text-headline-md text-white mb-2 font-semibold">{category.name}</h4>
                  <div className="h-0.5 w-0 bg-primary transition-all duration-500 group-hover:w-16"></div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Cities Section */}
        <section className="py-24 mb-24">
          <div className="text-center mb-16">
            <h3 className="font-mono text-data-label text-primary uppercase tracking-[0.4em] mb-4">The Expansion</h3>
            <p className="font-mono text-display-lg-mobile text-white uppercase font-bold">Regional Presence</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Tbilisi - Active */}
            <div className="flex-1 border border-primary p-8 bg-surface-container-high transition-transform duration-300 hover:-translate-y-2">
              <div className="flex justify-between items-start mb-12">
                <span className="material-symbols-outlined text-primary text-4xl">location_on</span>
                <div className="px-3 py-1 border border-primary text-primary font-mono text-[10px] uppercase tracking-[0.2em]">Active</div>
              </div>
              <h5 className="font-mono text-display-lg-mobile text-white mb-4 font-bold">Tbilisi</h5>
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
              <h5 className="font-mono text-display-lg-mobile text-white mb-4 font-bold">Batumi</h5>
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
              <h5 className="font-mono text-display-lg-mobile text-white mb-4 font-bold">Kutaisi</h5>
              <p className="font-hanken text-body-md text-on-surface-variant mb-8">
                Preserving tradition while embracing modern grooming. Our network is expanding to the historic capital soon.
              </p>
              <div className="h-[1px] w-12 bg-white/20 group-hover:bg-primary transition-colors duration-300"></div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-white/10 py-16 px-margin-mobile md:px-margin-desktop mb-20 md:mb-0">
        <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="font-mono text-display-lg-mobile text-primary uppercase mb-6 tracking-tighter font-bold">RIGIFY</h2>
            <p className="font-hanken text-body-md text-on-surface-variant max-w-sm mb-8">
              The ultimate destination for luxury beauty and wellness services in Georgia. Connecting elite practitioners with discerning clients.
            </p>
            <div className="flex gap-4">
              <a data-testid="footer-facebook-link" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-primary hover:text-primary transition-all" href="#" aria-label="Facebook">
                <span className="material-symbols-outlined text-[20px]">face_nod</span>
              </a>
              <a data-testid="footer-instagram-link" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-primary hover:text-primary transition-all" href="#" aria-label="Instagram">
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              </a>
              <a data-testid="footer-email-link" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:border-primary hover:text-primary transition-all" href="#" aria-label="Email">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </a>
            </div>
          </div>

          <div>
            <h6 className="font-mono text-data-label text-white uppercase mb-6">Marketplace</h6>
            <ul className="space-y-4 font-hanken text-body-md text-on-surface-variant">
              <li><Link data-testid="footer-browse-studios" href="/businesses?reset=1" className="hover:text-primary transition-colors">Browse Studios</Link></li>
              <li><Link data-testid="footer-special-offers" href="#" className="hover:text-primary transition-colors">Special Offers</Link></li>
              <li><Link data-testid="footer-gift-cards" href="#" className="hover:text-primary transition-colors">Gift Cards</Link></li>
              <li><Link data-testid="footer-reviews" href="#" className="hover:text-primary transition-colors">Reviews</Link></li>
            </ul>
          </div>

          <div>
            <h6 className="font-mono text-data-label text-white uppercase mb-6">Partners</h6>
            <ul className="space-y-4 font-hanken text-body-md text-on-surface-variant">
              <li><Link data-testid="footer-register-business" href="/for-businesses" className="hover:text-primary transition-colors">Register Business</Link></li>
              <li><Link data-testid="footer-partner-dashboard" href="/dashboard" className="hover:text-primary transition-colors">Partner Dashboard</Link></li>
              <li><Link data-testid="footer-pricing" href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link data-testid="footer-support" href="#" className="hover:text-primary transition-colors">Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-container-max mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">
          <span>© 2024 RIGIFY. All rights reserved.</span>
          <div className="flex gap-8">
            <Link data-testid="footer-privacy-policy" href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link data-testid="footer-terms-of-service" href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface h-20 px-margin-mobile border-t border-white/10">
        <Link data-testid="mobile-nav-home" href="/" className="flex flex-col items-center justify-center text-primary border-t-2 border-primary pt-1 transition-transform active:scale-95">
          <span className="material-symbols-outlined">home</span>
          <span className="font-mono text-[10px] uppercase mt-1 tracking-[0.2em]">Home</span>
        </Link>
        <BrowseLink testId="mobile-nav-browse" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:text-primary/80 transition-transform active:scale-95">
          <span className="material-symbols-outlined">search</span>
          <span className="font-mono text-[10px] uppercase mt-1 tracking-[0.2em]">Browse</span>
        </BrowseLink>
        <Link data-testid="mobile-nav-my-bookings" href="/customer/dashboard" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:text-primary/80 transition-transform active:scale-95">
          <span className="material-symbols-outlined">event_available</span>
          <span className="font-mono text-[10px] uppercase mt-1 tracking-[0.2em]">My Bookings</span>
        </Link>
        <Link data-testid="mobile-nav-business" href="/for-businesses" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60 hover:text-primary/80 transition-transform active:scale-95">
          <span className="material-symbols-outlined">business_center</span>
          <span className="font-mono text-[10px] uppercase mt-1 tracking-[0.2em]">Business</span>
        </Link>
      </nav>
    </main>
  );
}
