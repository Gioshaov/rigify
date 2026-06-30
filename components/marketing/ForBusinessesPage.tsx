"use client";

import { useState, FormEvent } from "react";
import { SiteNav } from "@/components/navigation/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { CountryCodeSelect } from "@/components/ui/CountryCodeSelect";
import { FilterDropdown } from "@/components/ui/FilterDropdown";

export default function ForBusinessesPage() {
  const [formData, setFormData] = useState({
    name: "",
    business_name: "",
    phone: "",
    city: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  // Phone is entered as country dial-code + local number (matching /customer-register);
  // both combine into the existing formData.phone, which still POSTs unchanged.
  const [countryCode, setCountryCode] = useState("+995");
  const [phoneNumber, setPhoneNumber] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit request");
        setLoading(false);
        return;
      }

      setShowSuccess(true);
      setFormData({ name: "", business_name: "", phone: "", city: "", message: "" });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function scrollToContact() {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }

  // Shared card chrome for the bento grid.
  const cardBase =
    "bg-surface-container border border-white/10 p-gutter hover:border-primary/30 transition-colors";
  const eyebrow =
    "font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold uppercase block";
  const fieldLabel =
    "block font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2";
  const fieldInput =
    "w-full px-4 py-3 bg-surface-container-low border border-white/10 focus:border-primary text-on-surface placeholder:text-outline outline-none transition-all";

  return (
    <div className="min-h-dvh bg-background font-hanken text-on-surface antialiased">
      <a data-testid="for-businesses-skip-to-main-link" href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteNav />

      <main id="main-content">
        {/* Hero — compact, centered */}
        <section className="border-b border-white/10 bg-surface">
          <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-16">
            <div className="max-w-2xl mx-auto text-center">
              <span className={`${eyebrow} mb-stack-md`}>For Businesses</span>
              <h1 className="font-hanken text-[40px] leading-[1.1] tracking-tighter font-bold md:text-[56px] text-primary uppercase mb-stack-md">
                Grow Your Salon with Rigify
              </h1>
              <p className="font-hanken text-[16px] leading-[1.6] font-normal text-text-secondary mb-stack-lg">
                Online booking, AI voice receptionist, and Instagram chatbots — all in one platform. Built for beauty and wellness businesses in Georgia.
              </p>
              <button
                data-testid="for-businesses-get-started-btn"
                onClick={scrollToContact}
                className="bg-primary text-background px-10 py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-all active:scale-95 inline-flex items-center gap-3 group"
              >
                Get Started
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform" aria-hidden="true">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* Bento grid */}
        <section className="border-b border-white/10 bg-background">
          <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-16">
            <h2 className="sr-only">What you get with Rigify</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md">

              {/* Missed Calls */}
              <div data-testid="problem-card-missed-calls" className={cardBase}>
                <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center mb-stack-md">
                  <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">phone_missed</span>
                </div>
                <h3 className="font-hanken text-[18px] leading-[1.3] font-semibold text-primary mb-stack-sm">
                  Missed Calls = Lost Revenue
                </h3>
                <p className="font-hanken text-[14px] leading-[1.5] font-normal text-text-secondary">
                  Your phone rings while you&apos;re with a client. You miss the call, they book somewhere else.
                </p>
              </div>

              {/* Your Own Booking Page (wide) */}
              <div data-testid="feature-booking-page" className={`md:col-span-2 flex flex-col justify-center ${cardBase}`}>
                <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary mb-stack-sm">
                  Your Own Booking Page
                </h3>
                <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary max-w-xl">
                  Beautiful, mobile-friendly page where customers book 24/7. Share it on Instagram, Facebook, or Google.
                </p>
              </div>

              {/* Paper Notebooks & Chaos */}
              <div data-testid="problem-card-notebook" className={cardBase}>
                <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center mb-stack-md">
                  <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">book</span>
                </div>
                <h3 className="font-hanken text-[18px] leading-[1.3] font-semibold text-primary mb-stack-sm">
                  Paper Notebooks & Chaos
                </h3>
                <p className="font-hanken text-[14px] leading-[1.5] font-normal text-text-secondary">
                  Managing appointments in a notebook is messy, error-prone, and unprofessional.
                </p>
              </div>

              {/* Dashboard & Calendar */}
              <div data-testid="feature-dashboard" className={`flex flex-col justify-center ${cardBase}`}>
                <h3 className="font-hanken text-[18px] leading-[1.3] font-semibold text-primary mb-stack-sm">
                  Dashboard & Calendar
                </h3>
                <p className="font-hanken text-[14px] leading-[1.5] font-normal text-text-secondary">
                  See all bookings, manage staff schedules, and track revenue from one clean dashboard.
                </p>
              </div>

              {/* No Online Presence */}
              <div data-testid="problem-card-no-presence" className={cardBase}>
                <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center mb-stack-md">
                  <span className="material-symbols-outlined text-primary text-[20px]" aria-hidden="true">search_off</span>
                </div>
                <h3 className="font-hanken text-[18px] leading-[1.3] font-semibold text-primary mb-stack-sm">
                  No Online Presence
                </h3>
                <p className="font-hanken text-[14px] leading-[1.5] font-normal text-text-secondary">
                  Customers can&apos;t find you online. They book with competitors who have modern booking systems.
                </p>
              </div>

              {/* Salome — featured spotlight (wide). Carries feature-ai-receptionist
                  testid: the standalone "Salome — AI Voice Receptionist" feature card
                  was folded in here to avoid duplicating the spotlight. */}
              <div data-testid="feature-ai-receptionist" className={`md:col-span-2 ${cardBase}`}>
                <span className={`${eyebrow} mb-stack-md`}>Meet Salome</span>
                <div className="flex items-start gap-stack-md mb-stack-md">
                  <div className="w-12 h-12 shrink-0 bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[24px]" aria-hidden="true">mic</span>
                  </div>
                  <h3 className="font-hanken text-[28px] leading-[1.2] tracking-tighter font-bold md:text-[36px] text-primary">
                    Your AI Receptionist That Never Sleeps
                  </h3>
                </div>
                <p className="font-hanken text-[16px] leading-[1.6] font-normal text-text-secondary max-w-2xl mb-stack-md">
                  Salome speaks Georgian and English fluently. She checks availability in real-time, books appointments, and sends confirmations — all through a phone call.
                </p>
                <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-outline uppercase">
                  No training required • Works 24/7 • Sounds human
                </p>
              </div>

              {/* Social Chatbots */}
              <div data-testid="feature-instagram-link" className={`flex flex-col justify-center ${cardBase}`}>
                <h3 className="font-hanken text-[18px] leading-[1.3] font-semibold text-primary mb-stack-sm">
                  Instagram & Facebook Chatbots
                </h3>
                <p className="font-hanken text-[14px] leading-[1.5] font-normal text-text-secondary">
                  Customers book directly through DMs. No back-and-forth messaging, just instant bookings.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Waitlist — heading left, form right */}
        <section id="contact" className="border-b border-white/10 bg-surface">
          <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-16">
            <div className="grid md:grid-cols-2 gap-stack-lg items-start">
              {/* Left: heading */}
              <div>
                <span className={`${eyebrow} mb-stack-md`}>Get Early Access</span>
                <h2 className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold md:text-[48px] text-primary mb-stack-md">
                  Join the Waitlist
                </h2>
                <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary max-w-md">
                  We&apos;re launching in Tbilisi first. Leave your details and we&apos;ll contact you within 48 hours.
                </p>
              </div>

              {/* Right: form (wiring preserved from audit) */}
              <div>
                {showSuccess ? (
                  <div data-testid="for-businesses-success-message" role="status" className="bg-primary/10 border border-primary p-gutter text-center">
                    <div className="w-20 h-20 bg-primary/20 border border-primary flex items-center justify-center mx-auto mb-stack-md">
                      <span
                        className="material-symbols-outlined text-primary text-[40px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                        aria-hidden="true"
                      >
                        check_circle
                      </span>
                    </div>
                    <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary mb-stack-md">
                      Request Received!
                    </h3>
                    <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary mb-stack-lg">
                      We&apos;ll review your request and contact you within 48 hours.
                    </p>
                    <button
                      data-testid="for-businesses-send-another-btn"
                      onClick={() => {
                        setShowSuccess(false);
                        setPhoneNumber("");
                        setCountryCode("+995");
                      }}
                      className="text-primary hover:underline font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase inline-flex items-center min-h-[44px] active:scale-95 transition-transform"
                    >
                      Send Another Request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-stack-md">
                    <div className="grid md:grid-cols-2 gap-stack-md">
                      <div>
                        <label htmlFor="contact-name" className={fieldLabel}>
                          Full Name *
                        </label>
                        <input
                          data-testid="contact-name-input"
                          id="contact-name"
                          autoComplete="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={fieldInput}
                          placeholder="Your full name"
                        />
                      </div>

                      <div>
                        <label htmlFor="contact-business" className={fieldLabel}>
                          Business Name *
                        </label>
                        <input
                          data-testid="contact-business-input"
                          id="contact-business"
                          autoComplete="organization"
                          type="text"
                          required
                          value={formData.business_name}
                          onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                          className={fieldInput}
                          placeholder="Salon/Studio name"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-stack-md">
                      <div>
                        <label htmlFor="contact-phone" className={fieldLabel}>
                          Phone Number *
                        </label>
                        <div className="flex gap-2">
                          <CountryCodeSelect
                            testId="contact-country-code-select"
                            value={countryCode}
                            onChange={(dial) => {
                              setCountryCode(dial);
                              setFormData({ ...formData, phone: phoneNumber ? `${dial} ${phoneNumber.replace(/\s/g, "")}` : "" });
                            }}
                          />
                          <input
                            data-testid="contact-phone-input"
                            id="contact-phone"
                            autoComplete="tel"
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/[^0-9\s]/g, "");
                              setPhoneNumber(digits);
                              setFormData({ ...formData, phone: digits ? `${countryCode} ${digits.replace(/\s/g, "")}` : "" });
                            }}
                            className={`flex-1 min-w-0 ${fieldInput}`}
                            placeholder="555 123 456"
                          />
                        </div>
                      </div>

                      <div>
                        <span className={fieldLabel}>City</span>
                        <FilterDropdown
                          testId="contact-city-dropdown"
                          optionTestId="contact-city"
                          ariaLabel="City"
                          value={formData.city}
                          onChange={(v) => setFormData({ ...formData, city: v })}
                          options={[
                            { value: "", label: "Select City" },
                            { value: "tbilisi", label: "Tbilisi" },
                            { value: "batumi", label: "Batumi" },
                            { value: "kutaisi", label: "Kutaisi" },
                            { value: "other", label: "Other" },
                          ]}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-message" className={fieldLabel}>
                        Message (Optional)
                      </label>
                      <textarea
                        data-testid="contact-message-textarea"
                        id="contact-message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={4}
                        className={`${fieldInput} resize-none`}
                        placeholder="Tell us about your business..."
                      />
                    </div>

                    {error && (
                      <p role="alert" className="text-sm text-error font-hanken"><span aria-hidden="true">⚠️</span> {error}</p>
                    )}

                    <button
                      data-testid="contact-submit-btn"
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary text-background py-5 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Sending..." : "Send Request"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>

      <SiteFooter className="mb-20 md:mb-0" />

    </div>
  );
}
