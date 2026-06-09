'use client'

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { BusinessGrid } from './BusinessGrid';

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
}

export function BusinessSplitView({ businesses, userLocation = null }: BusinessSplitViewProps) {
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [hoveredBusinessId, setHoveredBusinessId] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());

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

  const handleBusinessClick = (businessId: string) => {
    setSelectedBusinessId(businessId);
  };

  // Register card refs
  const registerCardRef = (businessId: string, element: HTMLElement | null) => {
    if (element) {
      cardRefs.current.set(businessId, element);
    } else {
      cardRefs.current.delete(businessId);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-8" data-testid="marketplace-split-view">
      {/* Left: Scrollable business list */}
      <div className="overflow-y-auto max-h-[80vh]">
        <BusinessGrid
          businesses={businesses}
          selectedBusinessId={activeBusinessId}
          onBusinessHover={handleBusinessHover}
          onBusinessClick={handleBusinessClick}
          registerCardRef={registerCardRef}
        />
      </div>

      {/* Right: Sticky map */}
      <div className="sticky top-4">
        <BusinessMap
          businesses={businesses}
          selectedBusinessId={activeBusinessId}
          onMarkerClick={handleMarkerClick}
          userLocation={userLocation}
          className="w-full h-[80vh]"
        />
      </div>
    </div>
  );
}
