'use client';

import { useState, useEffect } from 'react';
import { onboardBusiness } from './actions';
import { ImageUpload } from '@/components/ui/ImageUpload';

const CATEGORY_OPTIONS = [
  { id: 'hair', label: 'Hair' },
  { id: 'nails', label: 'Nails' },
  { id: 'skin', label: 'Skin' },
  { id: 'massage', label: 'Massage' },
  { id: 'brows', label: 'Brows' },
  { id: 'makeup', label: 'Makeup' },
  { id: 'barber', label: 'Barbershop' },
];

const inputClass =
  'w-full h-9 bg-[#0a0a0a] border border-[rgba(255,255,255,0.12)] text-white font-mono text-xs px-3 rounded-none focus:outline-none focus:border-[#d4a843] transition-colors placeholder:text-[#6b6880]';
const labelClass = 'block text-[#6b6880] font-mono text-[11px] mb-2';
const sectionClass = 'bg-[#111111] border border-[rgba(255,255,255,0.06)] rounded p-6 space-y-5';
const sectionTitleClass = 'text-[#6b6880] font-mono text-[10px] uppercase tracking-wider';

export default function OnboardForm() {
  const [result, setResult] = useState<{ success: boolean; message: string; subdomain?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Pre-generate the business id so images can be uploaded (to <id>/...) before
  // the business row exists; the same id is submitted and used on insert.
  // Generated after mount to avoid an SSR/client hydration mismatch.
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    setBusinessId(crypto.randomUUID());
  }, []);

  const availableCategories = CATEGORY_OPTIONS.filter((c) => !categories.includes(c.id));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    categories.forEach((c) => formData.append('categories', c));
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
          onClick={() => {
            setResult(null);
            setBusinessId(crypto.randomUUID());
            setCategories([]);
            setCoverImageUrl(null);
            setLogoUrl(null);
          }}
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
      {/* Hidden submitted values */}
      <input type="hidden" name="id" value={businessId ?? ''} />
      <input type="hidden" name="cover_image_url" value={coverImageUrl ?? ''} />
      <input type="hidden" name="logo_url" value={logoUrl ?? ''} />

      {/* Business Details */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Business Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className={labelClass}>BUSINESS NAME *</label>
            <input id="name" name="name" data-testid="onboard-business-name-input" required className={inputClass} placeholder="Mitte Beauty Salon" />
          </div>
          <div>
            <label htmlFor="subdomain" className={labelClass}>SUBDOMAIN * (lowercase, no spaces)</label>
            <input id="subdomain" name="subdomain" data-testid="onboard-subdomain-input" required pattern="[a-z0-9\-]+" className={inputClass} placeholder="mitte" />
            <p className="text-[#6b6880] font-mono text-[10px] mt-1">Will become: mitte.rigify.ge</p>
          </div>
        </div>

        <div>
          <label htmlFor="slug" className={labelClass}>SLUG * (URL-safe, unique)</label>
          <input id="slug" name="slug" data-testid="onboard-slug-input" required pattern="[a-z0-9\-]+" className={inputClass} placeholder="mitte-beauty-salon" />
          <p className="text-[#6b6880] font-mono text-[10px] mt-1">Used in public URL: rigify.ge/business/mitte-beauty-salon</p>
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>STATUS *</label>
          <select id="status" name="status" data-testid="onboard-status-select" defaultValue="active" required className={`${inputClass} appearance-none cursor-pointer`}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
          <p className="text-[#6b6880] font-mono text-[10px] mt-1">Opening hours are set later from the business dashboard → Settings.</p>
        </div>

        {/* Categories (multi-select chips) */}
        <div>
          <div className={labelClass}>CATEGORIES * (at least one)</div>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {categories.map((id) => {
                const cat = CATEGORY_OPTIONS.find((c) => c.id === id);
                return (
                  <span key={id} className="inline-flex items-center gap-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded px-2.5 py-1" data-testid={`onboard-category-chip-${id}`}>
                    <span className="text-white font-mono text-[11px]">{cat?.label ?? id}</span>
                    <button type="button" onClick={() => setCategories(categories.filter((c) => c !== id))} className="text-[#6b6880] hover:text-white transition-colors" aria-label={`Remove ${cat?.label ?? id}`} data-testid={`onboard-category-remove-${id}`}>×</button>
                  </span>
                );
              })}
            </div>
          )}
          {availableCategories.length > 0 && (
            <select
              onChange={(e) => { if (e.target.value) { setCategories([...categories, e.target.value]); e.target.value = ''; } }}
              data-testid="onboard-category-add-select"
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="">Add category...</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className={labelClass}>CITY *</label>
            <select id="city" name="city" data-testid="onboard-city-select" required className={`${inputClass} appearance-none cursor-pointer`}>
              <option value="">Select...</option>
              <option value="tbilisi">Tbilisi</option>
              <option value="batumi">Batumi</option>
              <option value="kutaisi">Kutaisi</option>
              <option value="rustavi">Rustavi</option>
            </select>
          </div>
          <div>
            <label htmlFor="district" className={labelClass}>DISTRICT</label>
            <input id="district" name="district" data-testid="onboard-district-input" className={inputClass} placeholder="Vake, Saburtalo" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className={labelClass}>PHONE *</label>
            <input id="phone" name="phone" data-testid="onboard-phone-input" required className={inputClass} placeholder="+995 555 123 456" />
          </div>
          <div>
            <label htmlFor="address" className={labelClass}>ADDRESS *</label>
            <input id="address" name="address" data-testid="onboard-address-input" required className={inputClass} placeholder="Rustaveli Ave 1, Tbilisi" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitude" className={labelClass}>LATITUDE <span className="text-[#6b6880]/60 normal-case">(for map)</span></label>
            <input id="latitude" name="latitude" data-testid="onboard-latitude-input" type="number" step="0.00000001" min="-90" max="90" className={inputClass} placeholder="41.7151377" />
          </div>
          <div>
            <label htmlFor="longitude" className={labelClass}>LONGITUDE <span className="text-[#6b6880]/60 normal-case">(for map)</span></label>
            <input id="longitude" name="longitude" data-testid="onboard-longitude-input" type="number" step="0.00000001" min="-180" max="180" className={inputClass} placeholder="44.7831250" />
          </div>
        </div>
        <p className="text-[#6b6880] font-mono text-[10px]">
          <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-[#d4a843] hover:underline">Find coordinates on Google Maps →</a>{' '}(right-click the spot → click the lat,lng to copy)
        </p>
      </div>

      {/* Descriptions */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Descriptions <span className="text-[#6b6880]/60 font-normal normal-case">(optional)</span></h2>
        <div>
          <label htmlFor="description" className={labelClass}>DESCRIPTION (ENGLISH)</label>
          <textarea id="description" name="description" rows={3} data-testid="onboard-description-input" className={`${inputClass} h-auto py-2 resize-none`} placeholder="Premium hair & beauty studio in the heart of Vake." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="description_ka" className={labelClass}>DESCRIPTION (GEORGIAN)</label>
            <textarea id="description_ka" name="description_ka" rows={3} data-testid="onboard-description-ka-input" className={`${inputClass} h-auto py-2 resize-none`} />
          </div>
          <div>
            <label htmlFor="description_ru" className={labelClass}>DESCRIPTION (RUSSIAN)</label>
            <textarea id="description_ru" name="description_ru" rows={3} data-testid="onboard-description-ru-input" className={`${inputClass} h-auto py-2 resize-none`} />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Contact <span className="text-[#6b6880]/60 font-normal normal-case">(optional)</span></h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="email" className={labelClass}>EMAIL</label>
            <input id="email" name="email" type="email" data-testid="onboard-email-input" className={inputClass} placeholder="hello@salon.ge" />
          </div>
          <div>
            <label htmlFor="website" className={labelClass}>WEBSITE</label>
            <input id="website" name="website" type="url" data-testid="onboard-website-input" className={inputClass} placeholder="https://salon.ge" />
          </div>
          <div>
            <label htmlFor="instagram" className={labelClass}>INSTAGRAM</label>
            <input id="instagram" name="instagram" data-testid="onboard-instagram-input" className={inputClass} placeholder="@salon" />
          </div>
        </div>
      </div>

      {/* Images (uploaded to Supabase Storage, like edit/settings) */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Images <span className="text-[#6b6880]/60 font-normal normal-case">(optional)</span></h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className={labelClass}>COVER IMAGE</div>
            {businessId ? (
              <ImageUpload businessId={businessId} type="cover" variant="admin" currentUrl={coverImageUrl} onUploadComplete={setCoverImageUrl} />
            ) : (
              <p className="text-[#6b6880] font-mono text-[10px]">Preparing uploader…</p>
            )}
          </div>
          <div>
            <div className={labelClass}>LOGO</div>
            {businessId ? (
              <ImageUpload businessId={businessId} type="logo" variant="admin" currentUrl={logoUrl} onUploadComplete={setLogoUrl} />
            ) : (
              <p className="text-[#6b6880] font-mono text-[10px]">Preparing uploader…</p>
            )}
          </div>
        </div>
      </div>

      {/* Owner Account */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Owner / Admin Account</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="owner_email" className={labelClass}>OWNER EMAIL *</label>
            <input id="owner_email" name="owner_email" data-testid="onboard-owner-email-input" type="email" required className={inputClass} placeholder="owner@salon.ge" />
          </div>
          <div>
            <label htmlFor="owner_password" className={labelClass}>TEMPORARY PASSWORD *</label>
            <input id="owner_password" name="owner_password" data-testid="onboard-owner-password-input" type="password" required minLength={8} className={inputClass} placeholder="Min 8 characters" />
          </div>
        </div>
      </div>

      {/* Optional Staff Account */}
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Staff Account <span className="text-[#6b6880]/60 font-normal normal-case">(optional)</span></h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="staff_name" className={labelClass}>STAFF NAME</label>
            <input id="staff_name" name="staff_name" data-testid="onboard-staff-name-input" className={inputClass} placeholder="Ucha" />
          </div>
          <div>
            <label htmlFor="staff_email" className={labelClass}>STAFF EMAIL</label>
            <input id="staff_email" name="staff_email" data-testid="onboard-staff-email-input" type="email" className={inputClass} placeholder="ucha@salon.ge" />
          </div>
          <div>
            <label htmlFor="staff_password" className={labelClass}>STAFF PASSWORD</label>
            <input id="staff_password" name="staff_password" data-testid="onboard-staff-password-input" type="password" minLength={8} className={inputClass} placeholder="Min 8 characters" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {result && !result.success && (
        <div className="bg-[#111111] border border-[rgba(239,68,68,0.3)] rounded p-4">
          <p className="text-[#ef4444] text-sm font-mono" data-testid="onboard-error-message">{result.message}</p>
        </div>
      )}

      {/* Submit */}
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
