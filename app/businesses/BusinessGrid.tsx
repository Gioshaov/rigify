"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants/categories";
import { CITIES } from "@/lib/constants/cities";
import { TBILISI_DISTRICTS } from "@/lib/constants/districts";
import { useTranslations } from "@/lib/hooks/useTranslations";

type Business = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  city: string;
  district: string | null;
  address: string;
  cover_image_url: string | null;
  logo_url: string | null;
  rating: number;
  review_count: number;
  business_categories: Array<{ category_id: string }>;
};

export function BusinessGrid({ businesses }: { businesses: Business[] }) {
  const { tr, lang } = useTranslations();
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter businesses
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) => {
      if (selectedCity !== "all" && business.city !== selectedCity) {
        return false;
      }

      if (selectedDistrict !== "all") {
        if (!business.district) return false;

        // Primary match: ID-based
        if (business.district === selectedDistrict) return true;

        // Fallback for legacy data: check name matches
        const districtInfo = TBILISI_DISTRICTS.find(d => d.id === selectedDistrict);
        if (districtInfo) {
          const businessDistrict = business.district.toLowerCase().trim();
          if (businessDistrict === districtInfo.en.toLowerCase() ||
              business.district.trim() === districtInfo.ka) {
            return true;
          }
        }

        return false;
      }

      if (selectedCategory !== "all") {
        const hasCategory = business.business_categories.some(
          (bc) => bc.category_id === selectedCategory
        );
        if (!hasCategory) return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = business.name.toLowerCase().includes(query);
        const matchesDescription = business.description
          ?.toLowerCase()
          .includes(query);
        const matchesAddress = business.address.toLowerCase().includes(query);

        if (!matchesName && !matchesDescription && !matchesAddress) {
          return false;
        }
      }

      return true;
    });
  }, [businesses, selectedCity, selectedCategory, selectedDistrict, searchQuery]);

  return (
    <div>
      {/* Filters */}
      <div className="mb-stack-lg pb-stack-lg border-b border-outline-variant">
        <p className="label-mono mb-stack-md">{tr.browsePage.filter[lang]}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md">
          {/* Search */}
          <div>
            <label htmlFor="search" className="label-mono block mb-stack-sm">
              {tr.browsePage.search[lang]}
            </label>
            <input
              id="search"
              type="text"
              placeholder={tr.browsePage.searchPlaceholder[lang]}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
            />
          </div>

          {/* City Filter */}
          <div>
            <label htmlFor="city" className="label-mono block mb-stack-sm">
              {tr.browsePage.city[lang]}
            </label>
            <select
              id="city"
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                // Reset district when city changes
                if (e.target.value !== 'tbilisi') {
                  setSelectedDistrict('all');
                }
              }}
              className="input-field"
            >
              <option value="all">{tr.browsePage.allCities[lang]}</option>
              {CITIES.map((city) => (
                <option key={city.id} value={city.id}>
                  {city[lang]}
                </option>
              ))}
            </select>
          </div>

          {/* District Filter - Only show for Tbilisi */}
          <div>
            <label htmlFor="district" className="label-mono block mb-stack-sm">
              {tr.browsePage.district[lang]}
            </label>
            <select
              id="district"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="input-field"
              disabled={selectedCity !== 'tbilisi' && selectedCity !== 'all'}
            >
              <option value="all">{tr.browsePage.allDistricts[lang]}</option>
              {TBILISI_DISTRICTS.map((district) => (
                <option key={district.id} value={district.id}>
                  {district[lang]}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="label-mono block mb-stack-sm">
              {tr.browsePage.category[lang]}
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="all">{tr.browsePage.allCategories[lang]}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat[lang]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-stack-md">
          <p className="label-mono text-on-surface-variant">
            {tr.browsePage.showing[lang]} {filteredBusinesses.length} {tr.browsePage.of[lang]} {businesses.length}
          </p>
        </div>
      </div>

      {/* Business Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-outline-variant">
        {filteredBusinesses.map((business) => (
          <Link
            key={business.id}
            href={`/businesses/${business.slug}`}
            className="bg-background hover:bg-surface transition-colors group"
          >
            {/* Cover Image */}
            <div className="aspect-video bg-surface-container relative overflow-hidden">
              {business.cover_image_url ? (
                <img
                  src={business.cover_image_url}
                  alt={business.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="font-mono text-data-label text-on-surface-variant uppercase tracking-wider">
                    {tr.browsePage.noImage[lang]}
                  </p>
                </div>
              )}

              {/* Logo Overlay */}
              {business.logo_url && (
                <div className="absolute bottom-3 left-3 w-16 h-16 bg-background border border-outline-variant overflow-hidden">
                  <img
                    src={business.logo_url}
                    alt={`${business.name} logo`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-gutter">
              <h3 className="text-headline-sm mb-stack-sm group-hover:text-primary transition-colors">
                {business.name}
              </h3>

              {/* Rating */}
              <div className="mb-stack-sm">
                {business.review_count > 0 ? (
                  <p className="label-mono text-on-surface-variant">
                    ★ {business.rating.toFixed(1)} · {business.review_count} {tr.browsePage.reviews[lang]}
                  </p>
                ) : (
                  <p className="label-mono text-on-surface-variant">
                    {tr.browsePage.noReviewsYet[lang]}
                  </p>
                )}
              </div>

              {/* Description */}
              {business.description && (
                <p className="text-body-md text-on-surface-variant mb-stack-sm line-clamp-2">
                  {business.description}
                </p>
              )}

              {/* Location */}
              <p className="label-mono text-on-surface-variant mb-stack-sm">
                {business.district ? `${business.district.toUpperCase()}, ` : ""}
                {business.city.toUpperCase()}
              </p>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {business.business_categories.slice(0, 3).map((bc) => {
                  const category = CATEGORIES.find((c) => c.id === bc.category_id);
                  return category ? (
                    <span
                      key={bc.category_id}
                      className="font-mono text-data-label uppercase tracking-wider text-primary"
                    >
                      {category[lang]}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* No Results */}
      {filteredBusinesses.length === 0 && businesses.length > 0 && (
        <div className="text-center py-section-gap border border-outline-variant bg-surface">
          <p className="label-mono text-on-surface-variant mb-stack-md">
            {tr.browsePage.noResultsFound[lang]}
          </p>
          <p className="text-body-lg text-on-surface-variant mb-stack-lg">
            {tr.browsePage.tryAdjusting[lang]}
          </p>
          <button
            onClick={() => {
              setSelectedCity("all");
              setSelectedCategory("all");
              setSelectedDistrict("all");
              setSearchQuery("");
            }}
            className="btn-secondary"
          >
            {tr.browsePage.clearAllFilters[lang]}
          </button>
        </div>
      )}
    </div>
  );
}
