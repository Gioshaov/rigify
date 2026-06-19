"use client";

import { useState, useEffect, useRef } from "react";
import { updateBusinessProfile } from "./actions";
import { CATEGORIES } from "@/lib/constants/categories";
import { CITIES } from "@/lib/constants/cities";
import { CategoryDropdown } from "./CategoryDropdown";
import { DistrictDropdown } from "./DistrictDropdown";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useTranslations } from "@/lib/hooks/useTranslations";
import type { BusinessHours } from "@/lib/types/booking";

type Business = {
  id: string;
  name: string;
  description: string | null;
  city: string;
  district: string | null;
  address: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  cover_image_url: string | null;
  logo_url: string | null;
  hours: BusinessHours;
  latitude: number | null;
  longitude: number | null;
};

export function BusinessProfileForm({
  business,
  categoryIds,
}: {
  business: Business;
  categoryIds: string[];
}) {
  const { tr, lang } = useTranslations();
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedCity, setSelectedCity] = useState(business.city);
  const [coverImageUrl, setCoverImageUrl] = useState(business.cover_image_url);
  const [logoUrl, setLogoUrl] = useState(business.logo_url);

  useEffect(() => {
    const handleInput = () => setIsDirty(true);
    const form = formRef.current;
    if (form) {
      form.addEventListener("input", handleInput);
      return () => form.removeEventListener("input", handleInput);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData(e.currentTarget);
    const response = await updateBusinessProfile(formData);

    setLoading(false);
    setResult(response);
    if (response.success) {
      setIsDirty(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="max-w-4xl">
      <input type="hidden" name="business_id" value={business.id} />

      {/* Result Messages */}
      {result?.success && (
        <div className="mb-stack-lg p-gutter border border-primary bg-surface">
          <p className="label-mono text-primary">{tr.dashboard.settings.profileUpdated[lang]}</p>
        </div>
      )}

      {result?.error && (
        <div className="mb-stack-lg p-gutter border border-error bg-surface">
          <p className="label-mono text-error">✗ {result.error}</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="mb-section-gap">
        <h2 className="text-headline-lg mb-stack-lg border-b border-outline-variant pb-stack-md">
          {tr.dashboard.settings.basicInfo[lang]}
        </h2>

        <div className="space-y-stack-md">
          <div>
            <label htmlFor="name" className="label-mono block mb-stack-sm">
              {tr.dashboard.settings.businessName[lang]}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={business.name}
              className="input-field"
              data-testid="business-settings-name-input"
            />
          </div>

          <div>
            <label htmlFor="description" className="label-mono block mb-stack-sm">
              {tr.dashboard.settings.description[lang]}
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={business.description || ""}
              className="input-field resize-none"
              placeholder={tr.dashboard.settings.descriptionPlaceholder[lang]}
              data-testid="business-settings-description-textarea"
            />
          </div>

          <div>
            <label className="label-mono block mb-stack-sm">
              {tr.dashboard.settings.categories[lang]}
            </label>
            <CategoryDropdown defaultSelected={categoryIds} />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="mb-section-gap">
        <h2 className="text-headline-lg mb-stack-lg border-b border-outline-variant pb-stack-md">
          {tr.dashboard.settings.location[lang]}
        </h2>

        <div className="space-y-stack-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
            <div>
              <label htmlFor="city" className="label-mono block mb-stack-sm">
                {tr.dashboard.settings.city[lang]}
              </label>
              <select
                id="city"
                name="city"
                required
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="input-field"
                data-testid="business-settings-city-select"
              >
                {CITIES.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.en} · {city.ka}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="district" className="label-mono block mb-stack-sm">
                {tr.dashboard.settings.district[lang]}
              </label>
              <DistrictDropdown
                defaultValue={business.district}
                selectedCity={selectedCity}
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="label-mono block mb-stack-sm">
              {tr.dashboard.settings.streetAddress[lang]}
            </label>
            <input
              id="address"
              name="address"
              type="text"
              required
              defaultValue={business.address}
              className="input-field"
              placeholder={tr.dashboard.settings.streetAddressPlaceholder[lang]}
              data-testid="business-settings-address-input"
            />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="mb-section-gap">
        <h2 className="text-headline-lg mb-stack-lg border-b border-outline-variant pb-stack-md">
          {tr.dashboard.settings.contactInfo[lang]}
        </h2>

        <div className="space-y-stack-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
            <div>
              <label htmlFor="phone" className="label-mono block mb-stack-sm">
                {tr.dashboard.settings.phone[lang]}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                defaultValue={business.phone || ""}
                className="input-field"
                placeholder="+995..."
                data-testid="business-settings-phone-input"
              />
            </div>

            <div>
              <label htmlFor="email" className="label-mono block mb-stack-sm">
                {tr.dashboard.settings.email[lang]}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={business.email || ""}
                className="input-field"
                placeholder="contact@business.ge"
                data-testid="business-settings-email-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
            <div>
              <label htmlFor="website" className="label-mono block mb-stack-sm">
                {tr.dashboard.settings.website[lang]}
              </label>
              <input
                id="website"
                name="website"
                type="url"
                defaultValue={business.website || ""}
                className="input-field"
                placeholder="https://..."
                data-testid="business-settings-website-input"
              />
            </div>

            <div>
              <label htmlFor="instagram" className="label-mono block mb-stack-sm">
                {tr.dashboard.settings.instagram[lang]}
              </label>
              <input
                id="instagram"
                name="instagram"
                type="text"
                defaultValue={business.instagram || ""}
                className="input-field"
                placeholder={tr.dashboard.settings.instagramPlaceholder[lang]}
                data-testid="business-settings-instagram-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="mb-section-gap">
        <h2 className="text-headline-lg mb-stack-lg border-b border-outline-variant pb-stack-md">
          {tr.dashboard.settings.images[lang]}
        </h2>

        <div className="space-y-stack-lg">
          {/* Cover Image */}
          <div>
            <label className="label-mono block mb-stack-sm">
              {tr.dashboard.settings.coverImage[lang]}
            </label>
            <input type="hidden" name="cover_image_url" value={coverImageUrl || ''} />
            <ImageUpload
              businessId={business.id}
              type="cover"
              currentUrl={coverImageUrl}
              onUploadComplete={(url) => {
                setCoverImageUrl(url)
                setIsDirty(true)
              }}
              variant="business"
            />
          </div>

          {/* Logo */}
          <div>
            <label className="label-mono block mb-stack-sm">
              {tr.dashboard.settings.logo[lang]}
            </label>
            <input type="hidden" name="logo_url" value={logoUrl || ''} />
            <ImageUpload
              businessId={business.id}
              type="logo"
              currentUrl={logoUrl}
              onUploadComplete={(url) => {
                setLogoUrl(url)
                setIsDirty(true)
              }}
              variant="business"
            />
          </div>
        </div>
      </div>

      {/* Map Coordinates */}
      <div className="mb-section-gap">
        <h2 className="text-headline-lg mb-stack-lg border-b border-outline-variant pb-stack-md">
          MAP COORDINATES
        </h2>

        <div className="space-y-stack-md">
          <p className="label-mono text-on-surface-variant text-sm">
            ADD YOUR EXACT LOCATION TO APPEAR ON THE MARKETPLACE MAP.{' '}
            <a
              href="https://www.google.com/maps"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              FIND COORDINATES ON GOOGLE MAPS →
            </a>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
            <div>
              <label htmlFor="latitude" className="label-mono block mb-stack-sm">
                LATITUDE *
              </label>
              <input
                id="latitude"
                name="latitude"
                type="number"
                step="0.00000001"
                min="-90"
                max="90"
                defaultValue={business.latitude ?? ''}
                required
                className="input-field"
                placeholder="41.7151377"
                data-testid="business-settings-latitude-input"
              />
              <p className="text-xs text-on-surface-variant mt-1 font-mono">
                Example: 41.7151377 (Rustaveli Avenue)
              </p>
            </div>

            <div>
              <label htmlFor="longitude" className="label-mono block mb-stack-sm">
                LONGITUDE *
              </label>
              <input
                id="longitude"
                name="longitude"
                type="number"
                step="0.00000001"
                min="-180"
                max="180"
                defaultValue={business.longitude ?? ''}
                required
                className="input-field"
                placeholder="44.7831250"
                data-testid="business-settings-longitude-input"
              />
              <p className="text-xs text-on-surface-variant mt-1 font-mono">
                Example: 44.7831250 (Rustaveli Avenue)
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-surface-container-low border border-white/10 p-gutter">
            <p className="label-mono text-xs mb-2 text-primary">HOW TO GET COORDINATES:</p>
            <ol className="text-sm text-on-surface-variant space-y-1 list-decimal list-inside font-mono">
              <li>Open Google Maps and search for your business address</li>
              <li>Right-click on your exact location on the map</li>
              <li>Click the coordinates at the top of the menu to copy</li>
              <li>Paste first number (latitude), then second number (longitude)</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-stack-md pt-stack-lg border-t border-outline-variant">
        <button
          type="submit"
          disabled={loading || !isDirty}
          className="btn-primary"
          data-testid="business-settings-submit-btn"
        >
          {loading ? tr.dashboard.settings.updating[lang] : tr.dashboard.settings.updateProfile[lang]}
        </button>

        {isDirty && (
          <p className="label-mono text-on-surface-variant">
            UNSAVED CHANGES
          </p>
        )}
      </div>
    </form>
  );
}
