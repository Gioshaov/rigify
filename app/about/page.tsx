import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import Link from "next/link";

export default function AboutPage() {
  return (
    <MarketingLayout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-muted-gold uppercase mb-4">
            About Rigify
          </p>
          <h1 data-testid="about-title" className="font-hanken text-[48px] leading-[1.1] tracking-tighter font-bold text-primary mb-6">
            The Artisan Collective
          </h1>
          <p className="font-hanken text-[18px] leading-[1.6] text-on-surface-variant max-w-2xl mx-auto">
            Rigify is Georgia's premier beauty and wellness booking platform, connecting customers with talented artisans across Tbilisi and beyond.
          </p>
        </div>

        {/* Mission */}
        <section data-testid="about-mission" className="mb-16">
          <h2 className="font-hanken text-[32px] leading-[1.2] tracking-tighter font-bold text-white mb-6">
            Our Mission
          </h2>
          <div className="bg-surface-container border border-white/10 p-8">
            <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant mb-4">
              We believe every artisan deserves modern tools to grow their business, and every customer deserves a seamless booking experience. Rigify bridges this gap by providing:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px] mt-1">check_circle</span>
                <span className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
                  A unified platform for discovering and booking beauty services
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px] mt-1">check_circle</span>
                <span className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
                  Powerful business tools for salons, spas, and independent artisans
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px] mt-1">check_circle</span>
                <span className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
                  AI-powered voice booking through Salome, our Georgian-speaking assistant
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* How It Works */}
        <section data-testid="about-how-it-works" className="mb-16">
          <h2 className="font-hanken text-[32px] leading-[1.2] tracking-tighter font-bold text-white mb-6 text-center">
            How Rigify Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-surface-container border border-white/10 p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 border border-primary mx-auto mb-4 flex items-center justify-center">
                <span className="font-mono text-[24px] font-bold text-primary">1</span>
              </div>
              <h3 className="font-hanken text-[20px] leading-[1.3] font-semibold text-white mb-3">
                Discover
              </h3>
              <p className="font-hanken text-[14px] leading-[1.6] text-on-surface-variant">
                Browse hundreds of salons, spas, and independent artisans across Georgia. Filter by location, service, and rating.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-surface-container border border-white/10 p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 border border-primary mx-auto mb-4 flex items-center justify-center">
                <span className="font-mono text-[24px] font-bold text-primary">2</span>
              </div>
              <h3 className="font-hanken text-[20px] leading-[1.3] font-semibold text-white mb-3">
                Book
              </h3>
              <p className="font-hanken text-[14px] leading-[1.6] text-on-surface-variant">
                Select your service, choose a date and time, and confirm instantly. Book online, by phone with Salome AI, or via social media.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-surface-container border border-white/10 p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 border border-primary mx-auto mb-4 flex items-center justify-center">
                <span className="font-mono text-[24px] font-bold text-primary">3</span>
              </div>
              <h3 className="font-hanken text-[20px] leading-[1.3] font-semibold text-white mb-3">
                Experience
              </h3>
              <p className="font-hanken text-[14px] leading-[1.6] text-on-surface-variant">
                Arrive at your appointment and enjoy premium service from skilled artisans. Manage bookings easily through your dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section data-testid="about-values" className="mb-16">
          <h2 className="font-hanken text-[32px] leading-[1.2] tracking-tighter font-bold text-white mb-6">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-primary text-[24px]">star</span>
                <h3 className="font-hanken text-[18px] leading-[1.3] font-semibold text-white">
                  Quality First
                </h3>
              </div>
              <p className="font-hanken text-[14px] leading-[1.6] text-on-surface-variant">
                We partner only with verified, skilled artisans who maintain high standards of service and professionalism.
              </p>
            </div>

            <div className="bg-surface-container border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-primary text-[24px]">psychology</span>
                <h3 className="font-hanken text-[18px] leading-[1.3] font-semibold text-white">
                  Innovation
                </h3>
              </div>
              <p className="font-hanken text-[14px] leading-[1.6] text-on-surface-variant">
                From AI voice booking to social media bots, we leverage technology to make booking effortless for everyone.
              </p>
            </div>

            <div className="bg-surface-container border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-primary text-[24px]">diversity_3</span>
                <h3 className="font-hanken text-[18px] leading-[1.3] font-semibold text-white">
                  Community
                </h3>
              </div>
              <p className="font-hanken text-[14px] leading-[1.6] text-on-surface-variant">
                We're building a collective where artisans support each other and customers discover hidden gems across Georgia.
              </p>
            </div>

            <div className="bg-surface-container border border-white/10 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
                <h3 className="font-hanken text-[18px] leading-[1.3] font-semibold text-white">
                  Trust
                </h3>
              </div>
              <p className="font-hanken text-[14px] leading-[1.6] text-on-surface-variant">
                Transparent pricing, verified reviews, and secure bookings ensure peace of mind for both customers and businesses.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-surface-container border border-primary/30 p-8 text-center">
          <h2 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold text-white mb-4">
            Join the Rigify Community
          </h2>
          <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant mb-6">
            Whether you're a customer looking for your next appointment or a business ready to grow, we're here for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              data-testid="about-browse-cta"
              href="/businesses"
              className="bg-primary text-on-primary px-8 py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-container transition-colors"
            >
              Browse Studios
            </Link>
            <Link
              data-testid="about-business-cta"
              href="/register"
              className="border border-white/10 text-white px-8 py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-white/5 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  );
}
