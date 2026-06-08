"use client";

import Link from "next/link";
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {businesses.map((business) => (
        <Link
          key={business.id}
          href={`/businesses/${business.slug}`}
          className="hover:bg-surface transition-colors group"
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

            {/* Location */}
            <p className="label-mono text-outline uppercase tracking-wider mb-stack-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {business.district ? `${business.district}, ` : ''}{business.city}
            </p>

            {/* Description */}
            {business.description && (
              <p className="text-body-sm text-on-surface-variant line-clamp-2">
                {business.description}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
