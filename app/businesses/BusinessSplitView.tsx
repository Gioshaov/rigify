'use client'

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/constants/categories';

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
  mapRef?: React.MutableRefObject<any>;
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Filter businesses by category
  const filteredBusinesses = selectedCategory === 'all'
    ? businesses
    : businesses.filter(b =>
        b.business_categories.some(cat => cat.category_id === selectedCategory)
      );

  // Combine hover + click for marker highlighting
  const activeBusinessId = hoveredBusinessId || selectedBusinessId;

  const handleMarkerClick = (businessId: string) => {
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

  const handleBusinessHover = (businessId: string | null) => {
    setHoveredBusinessId(businessId);
  };

  const handleBusinessClick = (business: Business) => {
    setSelectedBusinessId(business.id);

    // Fly to business location on map
    if (mapRef?.current && business.latitude && business.longitude) {
      mapRef.current.flyTo({
        center: [business.longitude, business.latitude],
        zoom: 14,
        duration: 1000,
        essential: true
      });
    }
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
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-outline-variant bg-surface">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-on-surface-variant">
            Showing {filteredBusinesses.length} of {businesses.length}
          </span>
          <button className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-primary hover:text-primary-container transition-colors">
            <span className="material-symbols-outlined text-[16px]">tune</span>
            Refine Search
          </button>
        </div>

        {/* Category Filter Pills - with gradient fade */}
        <div className="relative border-b border-outline-variant bg-surface">
          <div
            className="px-6 py-3 overflow-x-auto"
            style={{
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className="flex gap-2 flex-nowrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`
                  px-4 py-2 font-mono text-[10px] tracking-[0.15em] uppercase whitespace-nowrap transition-all
                  ${selectedCategory === 'all'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container border border-primary text-primary hover:bg-surface-container-high'
                  }
                `}
              >
                All Services
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    px-4 py-2 font-mono text-[10px] tracking-[0.15em] uppercase whitespace-nowrap transition-all
                    ${selectedCategory === category.id
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container border border-primary text-primary hover:bg-surface-container-high'
                    }
                  `}
                >
                  {category.en}
                </button>
              ))}
            </div>
          </div>
          {/* Gradient fade hint */}
          <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none bg-gradient-to-l from-surface to-transparent"></div>
        </div>

        {/* Scrollable Business Cards - with custom scrollbar */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#d4a843 transparent',
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              width: 3px;
            }
            div::-webkit-scrollbar-track {
              background: transparent;
            }
            div::-webkit-scrollbar-thumb {
              background: #d4a843;
              border-radius: 0;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: #e6c364;
            }
          `}</style>
          {filteredBusinesses.map((business) => {
            const isActive = selectedBusinessId === business.id;
            const isHovered = hoveredBusinessId === business.id;
            const categoryNames = business.business_categories
              .map(cat => CATEGORIES.find(c => c.id === cat.category_id)?.en)
              .filter(Boolean);

            return (
              <div
                key={business.id}
                ref={(el) => registerCardRef(business.id, el)}
                onMouseEnter={() => handleBusinessHover(business.id)}
                onMouseLeave={() => handleBusinessHover(null)}
                onClick={() => handleBusinessClick(business)}
                className={`
                  flex gap-3 px-3 py-2 border-b border-zinc-800 cursor-pointer transition-all
                  ${isActive
                    ? 'bg-[#1e1a0e] border-l-2 border-l-primary'
                    : isHovered
                      ? 'bg-surface-container-low border-l-2 border-l-primary'
                      : 'bg-[#1a1a1a] border-l border-l-transparent hover:bg-surface-container-low'
                  }
                `}
              >
                {/* Thumbnail - 72px */}
                <div className="relative w-[72px] h-[72px] flex-shrink-0 bg-surface-container overflow-hidden">
                  {business.cover_image_url ? (
                    <Image
                      src={business.cover_image_url}
                      alt={business.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant text-[28px]">
                        business
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                  {/* Business Name */}
                  <h3 className="font-hanken text-[13px] font-bold uppercase text-primary tracking-tight truncate leading-tight">
                    {business.name}
                  </h3>

                  {/* Category Tags - tiny pills */}
                  {categoryNames.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {categoryNames.map((cat, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 bg-surface-container border border-outline-variant font-mono text-[10px] tracking-[0.05em] uppercase text-on-surface-variant leading-none"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* District & Distance - no bullet */}
                  <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.05em] text-on-surface-variant">
                    {business.district && (
                      <span className="uppercase">{business.district}</span>
                    )}
                    {business.distance !== undefined && business.district && (
                      <span className="text-outline-variant">|</span>
                    )}
                    {business.distance !== undefined && (
                      <span>{business.distance.toFixed(1)} km</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredBusinesses.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
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
          businesses={filteredBusinesses}
          selectedBusinessId={activeBusinessId}
          onMarkerClick={handleMarkerClick}
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
