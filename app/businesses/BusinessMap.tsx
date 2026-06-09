'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

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
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createCustomMarker(business: Business, isSelected: boolean) {
  const primaryCategory = business.business_categories[0]?.category_id || 'other';
  const iconName = CATEGORY_ICONS[primaryCategory] || 'location_on';

  const iconHtml = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    ">
      <div style="
        width: 48px;
        height: 48px;
        background: ${isSelected ? '#c9a84c' : '#e6c364'};
        border: ${isSelected ? '3px solid #fff' : '2px solid #0a0a0f'};
        border-radius: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: ${isSelected ? '0 4px 12px rgba(230, 195, 100, 0.6)' : '0 2px 8px rgba(0,0,0,0.3)'};
        cursor: pointer;
        transition: all 0.2s;
      ">
        <span class="material-symbols-outlined" style="
          color: #0a0a0f;
          font-size: 28px;
          user-select: none;
        ">${iconName}</span>
      </div>
      <div style="
        background: #16161d;
        border: 1px solid #e6c364;
        padding: 4px 8px;
        font-family: 'Hanken Grotesk', sans-serif;
        font-size: 11px;
        font-weight: 600;
        color: #e6c364;
        text-transform: uppercase;
        white-space: nowrap;
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        letter-spacing: 0.05em;
      ">${escapeHtml(business.name)}</div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
  });
}

// Fly to selected marker
function FlyToMarker({ business }: { business: Business | null }) {
  const map = useMap();
  const businessId = business?.id ?? null;
  const latitude = business?.latitude;
  const longitude = business?.longitude;

  useEffect(() => {
    if (business && latitude && longitude) {
      map.flyTo([latitude, longitude], 16, {
        duration: 0.8,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, latitude, longitude, map]);

  return null;
}

// "You are here" marker
function createUserLocationMarker() {
  const iconHtml = `
    <div style="
      width: 20px;
      height: 20px;
      background: #60a5fa;
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 0 2px rgba(96, 165, 250, 0.3);
      position: relative;
    ">
      <div style="
        position: absolute;
        inset: -8px;
        border: 2px solid rgba(96, 165, 250, 0.5);
        border-radius: 50%;
        animation: pulse 2s ease-out infinite;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'user-location-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export function BusinessMap({
  businesses,
  selectedBusinessId,
  onMarkerClick,
  userLocation = null,
  className = ''
}: BusinessMapProps) {
  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

  // Tbilisi city center (fallback if no user location)
  const defaultCenter: [number, number] = [41.7151, 44.8271];
  const defaultZoom = 12;

  return (
    <div className={className} data-testid="marketplace-map">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker ("you are here") */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserLocationMarker()}
            data-testid="user-location-marker"
          >
            <Popup>
              <div className="font-mono text-xs">
                <strong>You are here</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Business markers */}
        {businesses.map((business) => (
          <Marker
            key={business.id}
            position={[business.latitude, business.longitude]}
            icon={createCustomMarker(business, business.id === selectedBusinessId)}
            eventHandlers={{
              click: () => onMarkerClick(business.id),
            }}
          >
            <Popup>
              <div className="font-hanken">
                <h3 className="font-semibold text-sm mb-1">{business.name}</h3>
                <a
                  href={`/businesses/${business.slug}`}
                  className="text-xs text-primary hover:underline"
                >
                  View Details →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Fly to selected */}
        <FlyToMarker business={selectedBusiness || null} />
      </MapContainer>
    </div>
  );
}
