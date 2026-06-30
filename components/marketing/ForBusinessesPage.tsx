"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { SiteNav } from "@/components/navigation/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";

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

  return (
    <div className="min-h-dvh bg-background font-hanken text-on-surface antialiased">
      <a data-testid="for-businesses-skip-to-main-link" href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteNav />

      <main id="main-content">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-white/10 bg-surface">
          <div className="absolute inset-0 opacity-5 pointer-events-none" aria-hidden="true">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(230, 195, 100, 0.1) 35px, rgba(230, 195, 100, 0.1) 70px)`
            }}></div>
          </div>
          <div className="relative max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-16">
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold uppercase block mb-stack-lg">
              For Businesses
            </span>
            <h1 className="font-hanken text-[48px] leading-[1.1] tracking-tighter font-bold md:text-[72px] text-primary uppercase max-w-4xl mb-stack-md">
              Grow Your Salon with Rigify
            </h1>
            <p className="font-hanken text-[18px] leading-[1.6] font-normal text-text-secondary max-w-2xl mb-stack-lg">
              Online booking, AI voice receptionist, and Instagram chatbots — all in one platform. Built for beauty and wellness businesses in Georgia.
            </p>
            <button
              data-testid="for-businesses-get-started-btn"
              onClick={scrollToContact}
              className="bg-primary text-background px-12 py-5 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-all active:scale-95 inline-flex items-center gap-3 group"
            >
              Get Started
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform" aria-hidden="true">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* Problem Section */}
        <section className="border-b border-white/10 bg-background">
          <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-16">
            <h2 className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold uppercase block mb-stack-lg">
              The Problem
            </h2>
            <div className="grid md:grid-cols-3 gap-stack-lg">
              <div data-testid="problem-card-missed-calls" className="bg-surface-container border border-white/5 p-gutter hover:border-primary/30 transition-all">
                <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mb-stack-md">
                  <span className="material-symbols-outlined text-primary text-[32px]" aria-hidden="true">phone_missed</span>
                </div>
                <h3 className="font-hanken text-[20px] leading-[1.4] font-semibold text-primary mb-stack-md">
                  Missed Calls = Lost Revenue
                </h3>
                <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
                  Your phone rings while you&apos;re with a client. You miss the call, they book somewhere else.
                </p>
              </div>
              <div data-testid="problem-card-notebook" className="bg-surface-container border border-white/5 p-gutter hover:border-primary/30 transition-all">
                <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mb-stack-md">
                  <span className="material-symbols-outlined text-primary text-[32px]" aria-hidden="true">book</span>
                </div>
                <h3 className="font-hanken text-[20px] leading-[1.4] font-semibold text-primary mb-stack-md">
                  Paper Notebooks & Chaos
                </h3>
                <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
                  Managing appointments in a notebook is messy, error-prone, and unprofessional.
                </p>
              </div>
              <div data-testid="problem-card-no-presence" className="bg-surface-container border border-white/5 p-gutter hover:border-primary/30 transition-all">
                <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mb-stack-md">
                  <span className="material-symbols-outlined text-primary text-[32px]" aria-hidden="true">search_off</span>
                </div>
                <h3 className="font-hanken text-[20px] leading-[1.4] font-semibold text-primary mb-stack-md">
                  No Online Presence
                </h3>
                <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
                  Customers can&apos;t find you online. They book with competitors who have modern booking systems.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What You Get Section */}
        <section className="border-b border-white/10 bg-surface">
          <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-16">
            <h2 className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold uppercase block mb-stack-lg">
              What You Get
            </h2>
            <div className="grid md:grid-cols-2 gap-stack-lg">
              <div data-testid="feature-booking-page" className="border-l-2 border-primary pl-8">
                <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary mb-stack-md">
                  Your Own Booking Page
                </h3>
                <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
                  Beautiful, mobile-friendly page where customers book 24/7. Share it on Instagram, Facebook, or Google.
                </p>
              </div>
              <div data-testid="feature-ai-receptionist" className="border-l-2 border-primary pl-8">
                <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary mb-stack-md">
                  Salome — AI Voice Receptionist
                </h3>
                <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
                  Answers calls in Georgian or English. Books appointments while you focus on clients.
                </p>
              </div>
              <div data-testid="feature-dashboard" className="border-l-2 border-primary pl-8">
                <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary mb-stack-md">
                  Dashboard & Calendar
                </h3>
                <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
                  See all bookings, manage staff schedules, and track revenue from one clean dashboard.
                </p>
              </div>
              <div data-testid="feature-instagram-link" className="border-l-2 border-primary pl-8">
                <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary mb-stack-md">
                  Instagram & Facebook Chatbots
                </h3>
                <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
                  Customers book directly through DMs. No back-and-forth messaging, just instant bookings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Salome Spotlight */}
        <section className="border-b border-white/10 bg-background">
          <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-16">
            <div className="max-w-3xl mx-auto text-center">
              <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold uppercase block mb-stack-lg">
                Meet Salome
              </span>
              <h2 className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold md:text-[48px] text-primary mb-stack-md">
                Your AI Receptionist That Never Sleeps
              </h2>
              <div className="bg-surface-container border border-white/5 p-gutter mb-stack-lg">
                <div className="w-24 h-24 bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-stack-md">
                  <span className="material-symbols-outlined text-primary text-[48px]" aria-hidden="true">mic</span>
                </div>
                <p className="font-hanken text-[18px] leading-[1.6] font-normal text-text-secondary">
                  Salome speaks Georgian and English fluently. She checks availability in real-time, books appointments, and sends confirmations — all through a phone call.
                </p>
              </div>
              <p className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-outline uppercase">
                No training required • Works 24/7 • Sounds human
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact" className="border-b border-white/10 bg-surface">
          <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-16">
            <div className="max-w-xl mx-auto">
              <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold uppercase block mb-stack-lg text-center">
                Get Early Access
              </span>
              <h2 className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold text-primary mb-stack-md text-center">
                Join the Waitlist
              </h2>
              <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary mb-stack-lg text-center">
                We&apos;re launching in Tbilisi first. Leave your details and we&apos;ll contact you within 48 hours.
              </p>

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
                    onClick={() => setShowSuccess(false)}
                    className="text-primary hover:underline font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase inline-block py-3 active:scale-95 transition-transform"
                  >
                    Send Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-stack-md">
                  <div>
                    <label htmlFor="contact-name" className="block font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2">
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
                      className="w-full px-4 py-3 bg-surface-container-low border border-white/10 focus:border-primary text-on-surface placeholder:text-outline outline-none transition-all"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-business" className="block font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2">
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
                      className="w-full px-4 py-3 bg-surface-container-low border border-white/10 focus:border-primary text-on-surface placeholder:text-outline outline-none transition-all"
                      placeholder="Salon/Studio name"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-phone" className="block font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2">
                      Phone Number *
                    </label>
                    <input
                      data-testid="contact-phone-input"
                      id="contact-phone"
                      autoComplete="tel"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-surface-container-low border border-white/10 focus:border-primary text-on-surface placeholder:text-outline outline-none transition-all"
                      placeholder="+995 555 123 456"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-city" className="block font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2">
                      City
                    </label>
                    <select
                      data-testid="contact-city-select"
                      id="contact-city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 bg-surface-container-low border border-white/10 focus:border-primary text-on-surface outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Select City</option>
                      <option value="tbilisi">Tbilisi</option>
                      <option value="batumi">Batumi</option>
                      <option value="kutaisi">Kutaisi</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      data-testid="contact-message-textarea"
                      id="contact-message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-surface-container-low border border-white/10 focus:border-primary text-on-surface placeholder:text-outline outline-none transition-all resize-none"
                      placeholder="Tell us about your business..."
                    />
                  </div>

                  {error && (
                    <p role="alert" className="text-sm text-error font-hanken">⚠️ {error}</p>
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
        </section>

      </main>

      <SiteFooter className="mb-20 md:mb-0" />

    </div>
  );
}
