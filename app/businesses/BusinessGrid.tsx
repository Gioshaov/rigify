"use client";

import Link from "next/link";
import Image from "next/image";

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
  // Map category IDs to display names (same as Stitch design)
  const categoryIcons: Record<string, string> = {
    hair: 'content_cut',
    beard: 'face_retouching_natural',
    spa: 'spa',
    massage: 'spa',
    nails: 'brush',
    skincare: 'face',
    barbershop: 'face',
    other: 'category',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {businesses.map((business) => {
        // Get primary category for icon
        const primaryCategory = business.business_categories[0]?.category_id || 'other';
        const icon = categoryIcons[primaryCategory] || 'category';

        return (
          <Link
            key={business.id}
            href={`/businesses/${business.slug}`}
            data-testid={`business-card-${business.slug}`}
            className="group bg-surface-container-low sharp-border hover:border-primary/40 transition-all duration-300 block"
          >
            <article>
              {/* Cover Image */}
              <div className="relative aspect-video overflow-hidden">
                {business.cover_image_url ? (
                  <Image
                    src={business.cover_image_url}
                    alt={business.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 group-hover:grayscale-0 grayscale"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-container flex items-center justify-center grayscale">
                    <span className="material-symbols-outlined text-outline text-[48px]">
                      image
                    </span>
                  </div>
                )}

                {/* Icon Badge */}
                <div className="absolute -bottom-6 right-6 w-16 h-16 bg-surface-elevated sharp-border p-2 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    {icon}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Title & Rating */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-hanken text-[24px] leading-[1.3] font-semibold text-primary uppercase group-hover:text-primary-fixed transition-colors">
                    {business.name}
                  </h3>
                  {business.review_count > 0 && (
                    <div className="flex items-center gap-1 text-primary">
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="font-mono text-[12px] leading-[1] tracking-[0.15em] font-medium">
                        {(business.rating ?? 0).toFixed(1)}
                      </span>
                      <span className="text-outline text-[10px]">
                        ({business.review_count})
                      </span>
                    </div>
                  )}
                </div>

                {/* Location */}
                <p className="font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-outline uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    location_on
                  </span>
                  {business.district ? `${business.district}, ` : ''}{business.city.toUpperCase()}
                </p>

                {/* Category Tags */}
                <div className="flex flex-wrap gap-2">
                  {business.business_categories.slice(0, 3).map((bc, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 border border-white/5 bg-white/5 font-mono text-[10px] leading-[1] tracking-[0.2em] font-medium text-on-surface-variant uppercase"
                    >
                      {bc.category_id}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
