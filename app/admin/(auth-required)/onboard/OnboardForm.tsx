'use client';

import { useState } from 'react';
import { onboardBusiness } from './actions';

export default function OnboardForm() {
  const [result, setResult] = useState<{ success: boolean; message: string; subdomain?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await onboardBusiness(formData);
    setResult(res);
    setLoading(false);
  }

  if (result?.success) {
    return (
      <div className="bg-[#111111] border border-[rgba(34,197,94,0.3)] rounded p-6">
        <h2 className="text-[#22c55e] font-bold text-lg mb-2">✓ Business Created</h2>
        <p className="text-white text-sm whitespace-pre-wrap">{result.message}</p>
        {result.subdomain && (
          <p className="text-white font-mono mt-3 text-sm">
            Dashboard: <span className="text-[#d4a843]">{result.subdomain}.rigify.ge/dashboard</span>
          </p>
        )}
        <button
          onClick={() => setResult(null)}
          data-testid="onboard-another-btn"
          className="mt-4 text-sm text-[#6b6880] hover:text-white underline transition-colors"
        >
          Onboard another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-testid="onboard-form" className="space-y-6">
      {/* Business Details */}
      <div className="bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded p-6 space-y-5">
        <h2 className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">Business Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-[#6b6880] font-mono text-[11px] mb-2">
              BUSINESS NAME *
            </label>
            <input
              id="name"
              name="name"
              data-testid="onboard-business-name-input"
              required
              className="w-full h-9 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs px-3 rounded-none focus:outline-none focus:border-[#d4a843] transition-colors placeholder:text-[#6b6880]"
              placeholder="Mitte Beauty Salon"
            />
          </div>
          <div>
            <label htmlFor="subdomain" className="block text-[#6b6880] font-mono text-[11px] mb-2">
              SUBDOMAIN * (lowercase, no spaces)
            </label>
            <input
              id="subdomain"
              name="subdomain"
              data-testid="onboard-subdomain-input"
              required
              pattern="[a-z0-9\-]+"
              className="w-full h-9 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs px-3 rounded-none focus:outline-none focus:border-[#d4a843] transition-colors placeholder:text-[#6b6880]"
              placeholder="mitte"
            />
            <p className="text-[#6b6880] font-mono text-[10px] mt-1">Will become: mitte.rigify.ge</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-[#6b6880] font-mono text-[11px] mb-2">
              CATEGORY *
            </label>
            <select
              id="category"
              name="category"
              data-testid="onboard-category-select"
              required
              className="w-full h-9 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs px-3 rounded-none focus:outline-none focus:border-[#d4a843] transition-colors appearance-none cursor-pointer"
              style={{ paddingRight: '2rem', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236b6880\' d=\'M6 8L2 4h8z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
            >
              <option value="">Select...</option>
              <option value="hair">Hair</option>
              <option value="nails">Nails</option>
              <option value="skin">Skin</option>
              <option value="massage">Massage</option>
              <option value="brows">Brows</option>
              <option value="makeup">Makeup</option>
              <option value="barber">Barbershop</option>
            </select>
          </div>
          <div>
            <label htmlFor="city" className="block text-[#6b6880] font-mono text-[11px] mb-2">
              CITY *
            </label>
            <select
              id="city"
              name="city"
              data-testid="onboard-city-select"
              required
              className="w-full h-9 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs px-3 rounded-none focus:outline-none focus:border-[#d4a843] transition-colors appearance-none cursor-pointer"
              style={{ paddingRight: '2rem', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236b6880\' d=\'M6 8L2 4h8z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center' }}
            >
              <option value="">Select...</option>
              <option value="tbilisi">Tbilisi</option>
              <option value="batumi">Batumi</option>
              <option value="kutaisi">Kutaisi</option>
              <option value="rustavi">Rustavi</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-[#6b6880] font-mono text-[11px] mb-2">
              PHONE *
            </label>
            <input
              id="phone"
              name="phone"
              data-testid="onboard-phone-input"
              required
              className="w-full h-9 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs px-3 rounded-none focus:outline-none focus:border-[#d4a843] transition-colors placeholder:text-[#6b6880]"
              placeholder="+995 555 123 456"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-[#6b6880] font-mono text-[11px] mb-2">
              ADDRESS *
            </label>
            <input
              id="address"
              name="address"
              data-testid="onboard-address-input"
              required
              className="w-full h-9 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs px-3 rounded-none focus:outline-none focus:border-[#d4a843] transition-colors placeholder:text-[#6b6880]"
              placeholder="Rustaveli Ave 1, Tbilisi"
            />
          </div>
        </div>

        <div>
          <label htmlFor="slug" className="block text-[#6b6880] font-mono text-[11px] mb-2">
            SLUG * (URL-safe, unique)
          </label>
          <input
            id="slug"
            name="slug"
            data-testid="onboard-slug-input"
            required
            pattern="[a-z0-9\-]+"
            className="w-full h-9 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs px-3 rounded-none focus:outline-none focus:border-[#d4a843] transition-colors placeholder:text-[#6b6880]"
            placeholder="mitte-beauty-salon"
          />
          <p className="text-[#6b6880] font-mono text-[10px] mt-1">Used in public URL: rigify.ge/business/mitte-beauty-salon</p>
        </div>
      </div>

      {/* Images */}
      <div className="bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded p-6 space-y-5">
        <h2 className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Images <span className="text-[#6b6880]/60 font-normal normal-case">(optional)</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="cover_image_url" className="block text-[#6b6880] font-mono text-[11px] mb-2">
              COVER IMAGE URL
            </label>
            <input
              id="cover_image_url"
              name="cover_image_url"
              data-testid="onboard-cover-image-input"
              type="url"
              className="w-full h-9 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs px-3 rounded-none focus:outline-none focus:border-[#d4a843] transition-colors placeholder:text-[#6b6880]"
              placeholder="https://example.com/cover.jpg"
            />
            <p className="text-[#6b6880] font-mono text-[10px] mt-1">Recommended: 1600×900px (16:9 ratio)</p>
          </div>
          <div>
            <label htmlFor="logo_url" className="block text-[#6b6880] font-mono text-[11px] mb-2">
              LOGO URL
            </label>
            <input
              id="logo_url"
              name="logo_url"
              data-testid="onboard-logo-input"
              type="url"
              className="w-full h-9 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs px-3 rounded-none focus:outline-none focus:border-[#d4a843] transition-colors placeholder:text-[#6b6880]"
              placeholder="https://example.com/logo.jpg"
            />
            <p className="text-[#6b6680] font-mono text-[10px] mt-1">Recommended: 400×400px (square)</p>
          </div>
        </div>
      </div>

      {/* Owner Account */}
      <div className="bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded p-6 space-y-5">
        <h2 className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">Owner / Admin Account</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="owner_email" className="block text-[#6b6880] font-mono text-[11px] mb-2">
              OWNER EMAIL *
            </label>
            <input
              id="owner_email"
              name="owner_email"
              data-testid="onboard-owner-email-input"
              type="email"
              required
              className="w-full h-9 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs px-3 rounded-none focus:outline-none focus:border-[#d4a843] transition-colors placeholder:text-[#6b6880]"
              placeholder="owner@salon.ge"
            />
          </div>
          <div>
            <label htmlFor="owner_password" className="block text-[#6b6880] font-mono text-[11px] mb-2">
              TEMPORARY PASSWORD *
            </label>
            <input
              id="owner_password"
              name="owner_password"
              data-testid="onboard-owner-password-input"
              type="password"
              required
              minLength={8}
              className="w-full h-9 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs px-3 rounded-none focus:outline-none focus:border-[#d4a843] transition-colors placeholder:text-[#6b6880]"
              placeholder="Min 8 characters"
            />
          </div>
        </div>
      </div>

      {/* Optional Staff Account */}
      <div className="bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded p-6 space-y-5">
        <h2 className="text-[#6b6880] font-mono text-[10px] uppercase tracking-wider">
          Staff Account <span className="text-[#6b6880]/60 font-normal normal-case">(optional)</span>
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="staff_name" className="block text-[#6b6880] font-mono text-[11px] mb-2">
              STAFF NAME
            </label>
            <input
              id="staff_name"
              name="staff_name"
              data-testid="onboard-staff-name-input"
              className="w-full h-9 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs px-3 rounded-none focus:outline-none focus:border-[#d4a843] transition-colors placeholder:text-[#6b6880]"
              placeholder="Ucha"
            />
          </div>
          <div>
            <label htmlFor="staff_email" className="block text-[#6b6880] font-mono text-[11px] mb-2">
              STAFF EMAIL
            </label>
            <input
              id="staff_email"
              name="staff_email"
              data-testid="onboard-staff-email-input"
              type="email"
              className="w-full h-9 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs px-3 rounded-none focus:outline-none focus:border-[#d4a843] transition-colors placeholder:text-[#6b6880]"
              placeholder="ucha@salon.ge"
            />
          </div>
          <div>
            <label htmlFor="staff_password" className="block text-[#6b6880] font-mono text-[11px] mb-2">
              STAFF PASSWORD
            </label>
            <input
              id="staff_password"
              name="staff_password"
              data-testid="onboard-staff-password-input"
              type="password"
              minLength={8}
              className="w-full h-9 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs px-3 rounded-none focus:outline-none focus:border-[#d4a843] transition-colors placeholder:text-[#6b6880]"
              placeholder="Min 8 characters"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {result && !result.success && (
        <div className="bg-[#111111] border border-[rgba(239,68,68,0.3)] rounded p-4">
          <p className="text-[#ef4444] text-sm font-mono" data-testid="onboard-error-message">
            {result.message}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        data-testid="onboard-submit-btn"
        disabled={loading}
        className="w-full h-11 border border-[#d4a843] text-[#d4a843] font-mono text-xs uppercase tracking-wider rounded-none hover:bg-[#d4a843] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating...' : 'Create Business + Account'}
      </button>
    </form>
  );
}
