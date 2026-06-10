'use client'

import { useState, useEffect, useRef } from 'react';
import { Map, Marker, NavigationControl, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

type Business = {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  business_categories: Array<{ category_id: string }>;
};

interface BusinessMapProps {
  businesses: Business[];
  selectedBusinessId: string | null;
  onMarkerClick: (businessId: string) => void;
  userLocation?: { lat: number; lng: number } | null;
  className?: string;
  viewMode?: 'list' | 'map' | 'split';
  flyToUserLocation?: boolean;
  onFlyComplete?: () => void;
  mapRef?: React.MutableRefObject<MapRef | null>;
}

// Category icon mapping (Material Symbols)
const CATEGORY_ICONS: Record<string, string> = {
  hair: 'content_cut',
  nails: 'brush',
  skin: 'face',
  massage: 'spa',
  brows: 'face_retouching_natural',
  makeup: 'palette',
  barber: 'face',
  other: 'category',
};

// Teardrop pin marker (for LIST and SPLIT views)
function PinMarker({ isSelected }: { isSelected: boolean }) {
  return (
    <svg
      width="24"
      height="32"
      viewBox="0 0 24 32"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: isSelected ? 'scale(1.2)' : 'scale(1)', transition: 'transform 200ms' }}
    >
      <path
        d="M12 0C6.5 0 2 4.5 2 10c0 8 10 22 10 22s10-14 10-22c0-5.5-4.5-10-10-10z"
        fill="#1a1a26"
        stroke={isSelected ? '#f0c040' : '#d4a843'}
        strokeWidth={isSelected ? '3' : '2'}
      />
      <circle
        cx="12"
        cy="10"
        r="2.5"
        fill={isSelected ? '#f0c040' : '#d4a843'}
      />
    </svg>
  );
}

// Category icon marker (for MAP view)
function CategoryIconMarker({ categoryId }: { categoryId: string }) {
  const iconName = CATEGORY_ICONS[categoryId] || CATEGORY_ICONS.other;

  return (
    <div
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        backgroundColor: '#1a1a26',
        border: '2px solid #d4a843',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: '20px',
          color: '#d4a843',
          userSelect: 'none',
        }}
      >
        {iconName}
      </span>
    </div>
  );
}

export function BusinessMap({
  businesses,
  selectedBusinessId,
  onMarkerClick,
  userLocation = null,
  className = '',
  viewMode = 'map',
  flyToUserLocation = false,
  onFlyComplete,
  mapRef: externalMapRef
}: BusinessMapProps) {
  const internalMapRef = useRef<MapRef>(null);
  const mapRef = externalMapRef || internalMapRef;
  const [viewState, setViewState] = useState({
    longitude: 44.8271,
    latitude: 41.7151,
    zoom: 12
  });

  // Fly to selected business
  useEffect(() => {
    const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);
    if (selectedBusiness && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedBusiness.longitude, selectedBusiness.latitude],
        zoom: 16,
        duration: 800
      });
    }
  }, [selectedBusinessId]);

  // Fly to user location when Near Me is clicked
  useEffect(() => {
    if (flyToUserLocation && userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 13,
        duration: 1000
      });
      onFlyComplete?.();
    }
  }, [flyToUserLocation, userLocation]);

  // Apply gold road styling when map loads
  const handleMapLoad = () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Color all road layers gold
    const roadLayers = [
      'road-simple',
      'road-primary',
      'road-secondary-tertiary',
      'road-street',
      'road-minor',
      'road-motorway-trunk'
    ];

    roadLayers.forEach(layerId => {
      try {
        map.setPaintProperty(layerId, 'line-color', '#6b5621');
      } catch (e) {
        // Layer doesn't exist, skip silently
      }
    });

    // Color road label text
    const roadLabelLayers = [
      'road-label',
      'road-label-simple',
      'road-number-shield',
      'road-exit-shield'
    ];

    roadLabelLayers.forEach(layerId => {
      try {
        map.setPaintProperty(layerId, 'text-color', 'rgba(107, 86, 33, 0.7)');
      } catch (e) {
        // Layer doesn't exist, skip silently
      }
    });
  };

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className={className} data-testid="marketplace-map">
        <div className="w-full h-full bg-surface-container-low flex items-center justify-center">
          <p className="text-error text-sm">Map unavailable: missing Mapbox token</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} data-testid="marketplace-map">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onLoad={handleMapLoad}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />

        {/* User location marker */}
        {userLocation && (
          <Marker
            longitude={userLocation.lng}
            latitude={userLocation.lat}
            anchor="center"
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                background: '#60a5fa',
                border: '3px solid #fff',
                borderRadius: '50%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4), 0 0 0 2px rgba(96, 165, 250, 0.3)'
              }}
            />
          </Marker>
        )}

        {/* Business markers */}
        {businesses.map((business) => {
          const primaryCategory = business.business_categories[0]?.category_id || 'other';
          const useIconMarker = viewMode === 'map';

          return (
            <Marker
              key={business.id}
              longitude={business.longitude}
              latitude={business.latitude}
              anchor={useIconMarker ? 'center' : 'bottom'}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                onMarkerClick(business.id);
              }}
            >
              <div style={{ cursor: 'pointer' }}>
                {useIconMarker ? (
                  <CategoryIconMarker categoryId={primaryCategory} />
                ) : (
                  <PinMarker isSelected={business.id === selectedBusinessId} />
                )}
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
