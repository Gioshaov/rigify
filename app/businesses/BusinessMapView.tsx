'use client'

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const BusinessMap = dynamic(
  () => import('./BusinessMap').then(mod => ({ default: mod.BusinessMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[70vh] md:h-[80vh] bg-surface-container-low flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="label-mono text-on-surface-variant">LOADING MAP...</p>
        </div>
      </div>
    )
  }
);

type Business = {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  business_categories: Array<{ category_id: string }>;
};

interface BusinessMapViewProps {
  businesses: Business[];
  userLocation?: { lat: number; lng: number } | null;
  onBusinessSelect?: (businessId: string) => void;
  flyToUserLocation?: boolean;
  onFlyComplete?: () => void;
}

export function BusinessMapView({
  businesses,
  userLocation = null,
  onBusinessSelect,
  flyToUserLocation = false,
  onFlyComplete
}: BusinessMapViewProps) {
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const router = useRouter();

  const handleMarkerClick = (businessId: string) => {
    setSelectedBusinessId(businessId);
    onBusinessSelect?.(businessId);

    // Navigate to business page
    const business = businesses.find(b => b.id === businessId);
    if (business) {
      router.push(`/businesses/${business.slug}`);
    }
  };

  return (
    <div className="w-full">
      <BusinessMap
        businesses={businesses}
        selectedBusinessId={selectedBusinessId}
        onMarkerClick={handleMarkerClick}
        userLocation={userLocation}
        className="w-full h-[70vh] md:h-[80vh]"
        viewMode="map"
        flyToUserLocation={flyToUserLocation}
        onFlyComplete={onFlyComplete}
      />
    </div>
  );
}
