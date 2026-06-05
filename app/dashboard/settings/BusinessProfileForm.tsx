"use client";

import { useState, useEffect } from "react";
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
};

export function BusinessProfileForm({
  business,
  categoryIds,
}: {
  business: Business;
  categoryIds: string[];
}) {
  const { tr, lang } = useTranslations();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [selectedCity, setSelectedCity] = useState(business.city);
  const [coverImageUrl, setCoverImageUrl] = useState(business.cover_image_url);
  const [logoUrl, setLogoUrl] = useState(business.logo_url);

  useEffect(() => {
    const handleInput = () => setIsDirty(true);
    const form = document.querySelector("form");
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
    <form onSubmit={handleSubmit} className="max-w-4xl">
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

      {/* Actions */}
      <div className="flex items-center gap-stack-md pt-stack-lg border-t border-outline-variant">
        <button
          type="submit"
          disabled={loading || !isDirty}
          className="btn-primary"
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
