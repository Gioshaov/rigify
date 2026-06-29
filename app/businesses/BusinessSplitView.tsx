'use client'

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import type { MapRef } from 'react-map-gl/mapbox';
import { CATEGORIES } from '@/lib/constants/categories';
import { getBusinessFallbackImage } from '@/lib/utils/fallback-images';

const BusinessMap = dynamic(
  () => import('./BusinessMap').then(mod => ({ default: mod.BusinessMap })),
  { ssr: false }
);

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
  latitude: number;
  longitude: number;
  business_categories: Array<{ category_id: string }>;
  distance?: number;
};

interface BusinessSplitViewProps {
  businesses: Business[];
  userLocation?: { lat: number; lng: number } | null;
  flyToUserLocation?: boolean;
  onFlyComplete?: () => void;
  mapRef?: React.MutableRefObject<MapRef | null>;
}

export function BusinessSplitView({
  businesses,
  userLocation = null,
  flyToUserLocation = false,
  onFlyComplete,
  mapRef
}: BusinessSplitViewProps) {
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [hoveredBusinessId, setHoveredBusinessId] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const router = useRouter();

  // `businesses` arrives already filtered by the main filter bar's Category
  // selection (BusinessPageClient), so the split view renders it directly —
  // it no longer keeps its own separate category filter.

  // Combine hover + click for marker highlighting
  const activeBusinessId = hoveredBusinessId || selectedBusinessId;

  const handleMarkerClick = (businessId: string) => {
    // Second click on the already-selected marker navigates; first click just selects.
    if (businessId === selectedBusinessId) {
      const business = businesses.find(b => b.id === businessId);
      if (business) router.push(`/businesses/${business.slug}`);
      return;
    }

    setSelectedBusinessId(businessId);

    // Scroll to card in list
    const cardElement = cardRefs.current.get(businessId);
    if (cardElement) {
      cardElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const handleMapClick = () => setSelectedBusinessId(null);
  const handlePopupNavigate = (slug: string) => router.push(`/businesses/${slug}`);

  const handleBusinessHover = (businessId: string | null) => {
    setHoveredBusinessId(businessId);
  };

  // Register card refs
  const registerCardRef = (businessId: string, element: HTMLDivElement | null) => {
    if (element) {
      cardRefs.current.set(businessId, element);
    } else {
      cardRefs.current.delete(businessId);
    }
  };

  return (
    <div className="flex h-[calc(100vh-280px)]" data-testid="marketplace-split-view">
      {/* Left Panel: 40% width */}
      <div className="w-[40%] flex flex-col border-r border-outline-variant">
        {/* Scrollable Business Cards Grid - with custom scrollbar */}
        <div
          className="flex-1 overflow-y-auto p-3 [scrollbar-width:thin] [scrollbar-color:#d4a843_transparent] [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary [&::-webkit-scrollbar-thumb:hover]:bg-primary-container"
        >
          <div className="grid grid-cols-2 gap-2">
            {businesses.map((business) => {
              const isActive = selectedBusinessId === business.id;
              const isHovered = hoveredBusinessId === business.id;
              const categoryNames = business.business_categories
                .map(cat => CATEGORIES.find(c => c.id === cat.category_id)?.en)
                .filter(Boolean);
              const primaryCategory = categoryNames[0] || 'Business';

              return (
                <div
                  key={business.id}
                  data-testid={`split-view-business-card-${business.id}`}
                  ref={(el) => registerCardRef(business.id, el)}
                  onMouseEnter={() => handleBusinessHover(business.id)}
                  onMouseLeave={() => handleBusinessHover(null)}
                  onClick={() => handleMarkerClick(business.id)}
                  className={`
                    bg-[#1a1a1a] border cursor-pointer transition-all overflow-hidden
                    ${isActive || isHovered
                      ? 'border-primary'
                      : 'border-zinc-800 hover:border-primary'
                    }
                  `}
                >
                  {/* Thumbnail - 4:3 aspect ratio */}
                  <div className="relative w-full aspect-[4/3] bg-surface-container overflow-hidden group">
                    <Image
                      src={getBusinessFallbackImage(business.cover_image_url, business.business_categories)}
                      alt={business.name}
                      fill
                      className={`
                        object-cover transition-all duration-500
                        ${isActive || isHovered
                          ? 'grayscale-0 brightness-110'
                          : 'grayscale group-hover:grayscale-0 group-hover:brightness-110'}
                      `}
                    />
                  </div>

                  {/* Info */}
                  <div className="p-2 flex flex-col gap-1">
                    {/* Business Name */}
                    <h3 className="font-hanken text-[11px] font-bold uppercase text-primary tracking-tight truncate leading-tight">
                      {business.name}
                    </h3>

                    {/* Category & Distance */}
                    <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.05em] text-on-surface-variant">
                      <span className="truncate">{primaryCategory}</span>
                      {business.distance !== undefined && (
                        <>
                          <span className="text-outline-variant">•</span>
                          <span className="whitespace-nowrap">{business.distance.toFixed(1)} km</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          </div>

          {businesses.length === 0 && (
            <div
              data-testid="split-view-empty-state"
              className="flex flex-col items-center justify-center h-64 text-center px-6 col-span-2"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[48px] mb-4">
                search_off
              </span>
              <p className="font-mono text-[12px] tracking-[0.15em] uppercase text-on-surface-variant">
                No businesses found
              </p>
              <p className="font-hanken text-[14px] text-on-surface-variant mt-2">
                Try selecting a different category
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: 60% width - Map */}
      <div className="w-[60%] h-full">
        <BusinessMap
          businesses={businesses}
          selectedBusinessId={activeBusinessId}
          popupBusinessId={selectedBusinessId}
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
          onPopupNavigate={handlePopupNavigate}
          userLocation={userLocation}
          className="w-full h-full"
          viewMode="split"
          flyToUserLocation={flyToUserLocation}
          onFlyComplete={onFlyComplete}
          mapRef={mapRef}
        />
      </div>
    </div>
  );
}
