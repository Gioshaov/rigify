"use client";

import Link from "next/link";
import { useState, useEffect, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForBusinessesPage() {
  const [user, setUser] = useState<any>(null);
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

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    }
    loadUser();
  }, []);

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
      {/* Top Navigation */}
      <header className="sticky top-0 w-full z-nav flex items-center justify-between px-margin-mobile md:px-margin-desktop h-16 bg-surface border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link data-testid="logo-link" href="/">
            <span className="font-hanken text-[32px] leading-[40px] font-bold text-primary tracking-tighter uppercase">
              RIGIFY
            </span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex gap-6">
            <Link
              data-testid="nav-home"
              href="/"
              className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface hover:text-primary transition-colors duration-200 uppercase"
            >
              Home
            </Link>
            <Link
              data-testid="nav-browse"
              href="/businesses"
              className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface hover:text-primary transition-colors duration-200 uppercase"
            >
              Browse
            </Link>
            <Link
              data-testid="nav-for-business"
              href="/for-businesses"
              className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-primary uppercase"
            >
              For Business
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div data-testid="user-avatar" className="w-10 h-10 bg-surface-container-high border border-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px]">person</span>
            </div>
          ) : (
            <Link
              data-testid="sign-in-btn"
              href="/login"
              className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium text-on-surface hover:text-primary transition-colors duration-200 uppercase"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      <main id="main-content">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-white/10 bg-surface">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(230, 195, 100, 0.1) 35px, rgba(230, 195, 100, 0.1) 70px)`
            }}></div>
          </div>
          <div className="relative max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-24 md:py-32">
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold uppercase block mb-6">
              For Businesses
            </span>
            <h1 className="font-hanken text-[48px] leading-[1.1] tracking-tighter font-bold md:text-[72px] text-primary uppercase max-w-4xl mb-8">
              Grow Your Salon with Rigify
            </h1>
            <p className="font-hanken text-[18px] leading-[1.6] font-normal text-text-secondary max-w-2xl mb-12">
              Online booking, AI voice receptionist, and Instagram chatbots — all in one platform. Built for beauty and wellness businesses in Georgia.
            </p>
            <button
              data-testid="get-started-btn"
              onClick={scrollToContact}
              className="bg-primary text-background px-12 py-5 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-all active:scale-95 flex items-center gap-3 group"
            >
              Get Started
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* Problem Section */}
        <section className="border-b border-white/10 bg-background">
          <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-20">
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold uppercase block mb-12">
              The Problem
            </span>
            <div className="grid md:grid-cols-3 gap-8">
              <div data-testid="problem-card-missed-calls" className="bg-surface-container border border-white/5 p-8 hover:border-primary/30 transition-all">
                <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-[32px]">phone_missed</span>
                </div>
                <h3 className="font-hanken text-[20px] leading-[1.4] font-semibold text-primary mb-4">
                  Missed Calls = Lost Revenue
                </h3>
                <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
                  Your phone rings while you&apos;re with a client. You miss the call, they book somewhere else.
                </p>
              </div>
              <div data-testid="problem-card-notebook" className="bg-surface-container border border-white/5 p-8 hover:border-primary/30 transition-all">
                <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-[32px]">book</span>
                </div>
                <h3 className="font-hanken text-[20px] leading-[1.4] font-semibold text-primary mb-4">
                  Paper Notebooks & Chaos
                </h3>
                <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
                  Managing appointments in a notebook is messy, error-prone, and unprofessional.
                </p>
              </div>
              <div data-testid="problem-card-no-presence" className="bg-surface-container border border-white/5 p-8 hover:border-primary/30 transition-all">
                <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-[32px]">search_off</span>
                </div>
                <h3 className="font-hanken text-[20px] leading-[1.4] font-semibold text-primary mb-4">
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
          <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-20">
            <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold uppercase block mb-12">
              What You Get
            </span>
            <div className="grid md:grid-cols-2 gap-12">
              <div data-testid="feature-booking-page" className="border-l-2 border-primary pl-8">
                <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary mb-4">
                  Your Own Booking Page
                </h3>
                <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
                  Beautiful, mobile-friendly page where customers book 24/7. Share it on Instagram, Facebook, or Google.
                </p>
              </div>
              <div data-testid="feature-ai-receptionist" className="border-l-2 border-primary pl-8">
                <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary mb-4">
                  Salome — AI Voice Receptionist
                </h3>
                <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
                  Answers calls in Georgian or English. Books appointments while you focus on clients.
                </p>
              </div>
              <div data-testid="feature-dashboard" className="border-l-2 border-primary pl-8">
                <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary mb-4">
                  Dashboard & Calendar
                </h3>
                <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary">
                  See all bookings, manage staff schedules, and track revenue from one clean dashboard.
                </p>
              </div>
              <div data-testid="feature-instagram-link" className="border-l-2 border-primary pl-8">
                <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary mb-4">
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
          <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-20">
            <div className="max-w-3xl mx-auto text-center">
              <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold uppercase block mb-6">
                Meet Salome
              </span>
              <h2 className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold md:text-[48px] text-primary mb-8">
                Your AI Receptionist That Never Sleeps
              </h2>
              <div className="bg-surface-container border border-white/5 p-12 mb-8">
                <div className="w-24 h-24 bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
                  <span className="material-symbols-outlined text-primary text-[48px]">mic</span>
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
          <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-20">
            <div className="max-w-xl mx-auto">
              <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-muted-gold uppercase block mb-6 text-center">
                Get Early Access
              </span>
              <h2 className="font-hanken text-[36px] leading-[1.2] tracking-tighter font-bold text-primary mb-4 text-center">
                Join the Waitlist
              </h2>
              <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary mb-12 text-center">
                We&apos;re launching in Tbilisi first. Leave your details and we&apos;ll contact you within 48 hours.
              </p>

              {showSuccess ? (
                <div data-testid="success-message" className="bg-primary/10 border border-primary p-12 text-center">
                  <div className="w-20 h-20 bg-primary/20 border border-primary flex items-center justify-center mx-auto mb-6">
                    <span
                      className="material-symbols-outlined text-primary text-[40px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  </div>
                  <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary mb-4">
                    Request Received!
                  </h3>
                  <p className="font-hanken text-[16px] leading-[1.5] font-normal text-text-secondary mb-8">
                    We&apos;ll review your request and contact you within 48 hours.
                  </p>
                  <button
                    data-testid="send-another-btn"
                    onClick={() => setShowSuccess(false)}
                    className="text-primary hover:underline font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase"
                  >
                    Send Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2">
                      Full Name
                    </label>
                    <input
                      data-testid="contact-name-input"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-4 bg-surface-container-low border border-white/10 focus:border-primary text-on-surface placeholder:text-outline outline-none transition-all"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2">
                      Business Name
                    </label>
                    <input
                      data-testid="contact-business-input"
                      type="text"
                      required
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      className="w-full px-4 py-4 bg-surface-container-low border border-white/10 focus:border-primary text-on-surface placeholder:text-outline outline-none transition-all"
                      placeholder="Salon/Studio name"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2">
                      Phone Number
                    </label>
                    <input
                      data-testid="contact-phone-input"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-4 bg-surface-container-low border border-white/10 focus:border-primary text-on-surface placeholder:text-outline outline-none transition-all"
                      placeholder="+995 555 123 456"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2">
                      City
                    </label>
                    <select
                      data-testid="contact-city-select"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-4 bg-surface-container-low border border-white/10 focus:border-primary text-on-surface outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Select City</option>
                      <option value="tbilisi">Tbilisi</option>
                      <option value="batumi">Batumi</option>
                      <option value="kutaisi">Kutaisi</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase mb-2">
                      Message (Optional)
                    </label>
                    <textarea
                      data-testid="contact-message-textarea"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-4 bg-surface-container-low border border-white/10 focus:border-primary text-on-surface placeholder:text-outline outline-none transition-all resize-none"
                      placeholder="Tell us about your business..."
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 font-hanken">{error}</p>
                  )}

                  <button
                    data-testid="contact-submit-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-background py-5 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-fixed transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Send Request"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-surface py-12">
          <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b border-white/10">
              <span className="font-hanken text-[32px] leading-[40px] font-bold text-primary tracking-tighter uppercase">
                RIGIFY
              </span>
              <div className="flex gap-6">
                <Link data-testid="footer-home" href="/" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant hover:text-primary transition-colors uppercase">
                  Home
                </Link>
                <Link data-testid="footer-browse" href="/businesses" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant hover:text-primary transition-colors uppercase">
                  Browse
                </Link>
                <Link data-testid="footer-for-business" href="/for-businesses" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant hover:text-primary transition-colors uppercase">
                  For Business
                </Link>
              </div>
            </div>
            <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-outline uppercase">
                © 2024 RIGIFY Digital
              </p>
              <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-outline uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Encrypted Access
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full z-nav flex justify-around items-center bg-surface h-20 px-margin-mobile border-t border-white/10">
        <Link data-testid="mobile-nav-home" href="/" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">home</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Home
          </span>
        </Link>
        <Link data-testid="mobile-nav-browse" href="/businesses" className="flex flex-col items-center justify-center text-on-surface-variant opacity-60">
          <span className="material-symbols-outlined">search</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            Browse
          </span>
        </Link>
        <Link
          data-testid="mobile-nav-business"
          href="/for-businesses"
          className="flex flex-col items-center justify-center text-primary border-t-2 border-primary pt-1"
        >
          <span className="material-symbols-outlined">business_center</span>
          <span className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium uppercase mt-1">
            For Business
          </span>
        </Link>
      </nav>
    </div>
  );
}
