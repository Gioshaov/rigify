'use client'

import { useState } from "react";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // TODO: Wire up real submission to server action/API endpoint
    // Placeholder: simulate success for now
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div data-testid="contact-success" className="bg-surface-container border border-amber-400/30 p-8 text-center">
        <span className="material-symbols-outlined text-amber-400 text-[48px] mb-4 block">
          info
        </span>
        <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-white mb-3">
          Form Submitted (Demo)
        </h3>
        <p className="font-hanken text-[16px] leading-[1.6] text-on-surface-variant">
          This is a placeholder UI. Contact form backend is not yet implemented. Please email us directly at support@rigify.ge for now.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
          Your Name *
        </label>
        <input
          data-testid="contact-name-input"
          id="name"
          name="name"
          type="text"
          required
          className="w-full bg-surface-container border border-white/10 focus:border-primary px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-colors font-hanken text-[14px] leading-[1.5]"
          placeholder="John Smith"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
          Email Address *
        </label>
        <input
          data-testid="contact-email-input"
          id="email"
          name="email"
          type="email"
          required
          className="w-full bg-surface-container border border-white/10 focus:border-primary px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-colors font-hanken text-[14px] leading-[1.5]"
          placeholder="john@example.com"
        />
      </div>

      {/* Subject */}
      <div>
        <label htmlFor="subject" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
          Subject *
        </label>
        <select
          data-testid="contact-subject-select"
          id="subject"
          name="subject"
          required
          className="w-full bg-surface-container border border-white/10 focus:border-primary px-4 py-3 text-on-surface outline-none transition-colors font-hanken text-[14px] leading-[1.5]"
        >
          <option value="">Select a topic</option>
          <option value="customer-support">Customer Support</option>
          <option value="business-inquiry">Business Inquiry</option>
          <option value="technical-issue">Technical Issue</option>
          <option value="partnership">Partnership Opportunity</option>
          <option value="feedback">Feedback</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase block mb-3">
          Message *
        </label>
        <textarea
          data-testid="contact-message-textarea"
          id="message"
          name="message"
          rows={6}
          required
          className="w-full bg-surface-container border border-white/10 focus:border-primary px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-colors font-hanken text-[14px] leading-[1.5] resize-none"
          placeholder="Tell us how we can help..."
        />
      </div>

      {/* Error Message */}
      {error && (
        <div data-testid="contact-error" className="bg-red-950/50 border border-red-500/50 p-4">
          <p className="font-hanken text-[14px] leading-[1.6] text-red-200">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        data-testid="contact-submit-btn"
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-on-primary py-4 font-mono text-[12px] leading-[1] tracking-[0.15em] uppercase font-bold hover:bg-primary-container active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Send Message (Demo)"}
      </button>
    </form>
  );
}
