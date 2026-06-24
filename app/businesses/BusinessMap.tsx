'use client'

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Map, Marker, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getBusinessFallbackImage } from '@/lib/utils/fallback-images';

type Business = {
  id: string;
  name: string;
  slug: string;
  city: string;
  district: string | null;
  cover_image_url: string | null;
  rating: number;
  review_count: number;
  latitude: number;
  longitude: number;
  business_categories: Array<{ category_id: string }>;
};

interface BusinessMapProps {
  businesses: Business[];
  selectedBusinessId: string | null;
  /** Business whose preview popup is shown on the map (the marker-selected one). */
  popupBusinessId?: string | null;
  onMarkerClick: (businessId: string) => void;
  /** Clicking empty map space (dismiss popup / deselect). */
  onMapClick?: () => void;
  /** CTA inside the popup → navigate to the business page. */
  onPopupNavigate?: (slug: string) => void;
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

// Custom navigation controls
function MapNavigationControls({ mapRef }: { mapRef: React.MutableRefObject<MapRef | null> }) {
  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleResetNorth = () => {
    mapRef.current?.resetNorth();
  };

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
      {/* Zoom In */}
      <button
        data-testid="map-zoom-in-btn"
        onClick={handleZoomIn}
        className="w-8 h-8 bg-surface border border-outline flex items-center justify-center text-on-surface hover:bg-surface-container hover:border-primary transition-colors"
        aria-label="Zoom in"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
      </button>

      {/* Zoom Out */}
      <button
        data-testid="map-zoom-out-btn"
        onClick={handleZoomOut}
        className="w-8 h-8 bg-surface border border-outline flex items-center justify-center text-on-surface hover:bg-surface-container hover:border-primary transition-colors"
        aria-label="Zoom out"
      >
        <span className="material-symbols-outlined text-[18px]">remove</span>
      </button>

      {/* Reset North */}
      <button
        data-testid="map-reset-north-btn"
        onClick={handleResetNorth}
        className="w-8 h-8 bg-surface border border-outline flex items-center justify-center text-on-surface hover:bg-surface-container hover:border-primary transition-colors"
        aria-label="Reset bearing to north"
      >
        <span className="material-symbols-outlined text-[18px]">navigation</span>
      </button>
    </div>
  );
}

export function BusinessMap({
  businesses,
  selectedBusinessId,
  popupBusinessId = null,
  onMarkerClick,
  onMapClick,
  onPopupNavigate,
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

  // Fly to the click-selected business. Keyed on popupBusinessId (click-only) so
  // hovering cards in split view doesn't thrash the map with fly-to animations.
  useEffect(() => {
    const target = businesses.find(b => b.id === popupBusinessId);
    if (target && mapRef.current) {
      mapRef.current.flyTo({
        center: [target.longitude, target.latitude],
        zoom: 16,
        duration: 800
      });
    }
    // Re-fly only when the click selection changes; `businesses` ref changes per render and `mapRef` is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popupBusinessId]);

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
    // Trigger is gated by `flyToUserLocation`; including `onFlyComplete`/`mapRef` would risk repeat fly-tos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyToUserLocation, userLocation]);

  // Apply gold road styling when map loads
  const handleMapLoad = () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Increase scroll zoom speed (default is 1/300, increase to 1/150 for 2x faster)
    if (map.scrollZoom) {
      map.scrollZoom.setWheelZoomRate(1 / 150);
    }

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

  const popupBusiness = popupBusinessId
    ? businesses.find((b) => b.id === popupBusinessId) ?? null
    : null;

  return (
    <div className={`${className} relative`} data-testid="marketplace-map">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onLoad={handleMapLoad}
        onClick={() => onMapClick?.()}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        cursor="default"
        maxBounds={[
          [40.0, 41.0],  // Southwest [longitude, latitude]
          [46.8, 43.6]   // Northeast [longitude, latitude]
        ]}
        minZoom={8}
        maxZoom={18}
        scrollZoom={true}
      >
        {/* Custom Navigation Controls */}
        <MapNavigationControls mapRef={mapRef} />

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

        {/* Selected-business preview popup (first marker click); click / CTA navigates */}
        {popupBusiness && (
          <Marker
            longitude={popupBusiness.longitude}
            latitude={popupBusiness.latitude}
            anchor="bottom"
            offset={[0, -44]}
            onClick={(e) => e.originalEvent.stopPropagation()}
          >
            <div
              data-testid="map-business-popup"
              className="relative w-56 bg-surface border border-white/10 rounded-[4px] overflow-hidden"
            >
              {/* Close / deselect */}
              <button
                type="button"
                aria-label="Close preview"
                data-testid="map-business-popup-close"
                onClick={(e) => {
                  e.stopPropagation();
                  onMapClick?.();
                }}
                className="absolute top-1 right-1 z-10 w-6 h-6 flex items-center justify-center bg-surface/80 border border-white/10 rounded-[4px] text-on-surface hover:text-primary hover:border-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>

              {/* Clickable preview → navigate */}
              <div
                role="button"
                tabIndex={0}
                aria-label={`View ${popupBusiness.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPopupNavigate?.(popupBusiness.slug);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onPopupNavigate?.(popupBusiness.slug);
                  }
                }}
                className="block text-left cursor-pointer"
              >
                <div className="relative w-full aspect-video overflow-hidden">
                  <Image
                    src={getBusinessFallbackImage(popupBusiness.cover_image_url, popupBusiness.business_categories)}
                    alt={popupBusiness.name}
                    fill
                    sizes="224px"
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-hanken text-[14px] leading-[1.2] font-semibold text-primary uppercase truncate">
                      {popupBusiness.name}
                    </h4>
                    {popupBusiness.review_count > 0 && (
                      <span className="flex items-center gap-1 text-primary shrink-0 font-mono text-[11px] tracking-[0.1em]">
                        <span className="material-symbols-outlined text-[13px]">star</span>
                        {(popupBusiness.rating ?? 0).toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[9px] leading-[1] tracking-[0.2em] text-on-surface-variant uppercase mt-1.5 flex items-center gap-1 truncate">
                    <span className="material-symbols-outlined text-[12px]">location_on</span>
                    {popupBusiness.district ? `${popupBusiness.district}, ` : ''}{popupBusiness.city.toUpperCase()}
                  </p>
                  <span className="mt-2 block w-full bg-primary text-on-primary text-center py-1.5 font-mono text-[10px] tracking-[0.15em] uppercase font-bold rounded-[4px]">
                    View
                  </span>
                </div>
              </div>
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
}
