'use client'

import { useEffect, useRef } from 'react';
import { Map, Marker, NavigationControl, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

interface BusinessLocationMapProps {
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  /** Optional test id applied to the map container. */
  testId?: string;
  /** Optional sizing/border classes for the container (overrides the default height/bg). */
  className?: string;
}

function PinMarker() {
  return (
    <svg
      width="24"
      height="32"
      viewBox="0 0 24 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Teardrop pin shape */}
      <path
        d="M12 0C6.5 0 2 4.5 2 10c0 8 10 22 10 22s10-14 10-22c0-5.5-4.5-10-10-10z"
        fill="#1a1a26"
        stroke="#d4a843"
        strokeWidth="2"
      />
      {/* Center gold dot */}
      <circle
        cx="12"
        cy="10"
        r="2.5"
        fill="#d4a843"
      />
    </svg>
  );
}

export function BusinessLocationMap({ name, latitude, longitude, address, testId, className }: BusinessLocationMapProps) {
  const mapRef = useRef<MapRef>(null);

  // Georgia's geographic bounds
  const georgiaBounds: [[number, number], [number, number]] = [
    [39.9, 41.0],   // Southwest: [longitude, latitude]
    [46.7, 43.6]    // Northeast: [longitude, latitude]
  ];

  // Apply gold road styling when map loads
  const handleMapLoad = () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Mapbox renders blank if it initialized while its container had zero size
    // (e.g. inside a modal). Force a resize once the container has dimensions.
    requestAnimationFrame(() => {
      try {
        map.resize();
      } catch {
        // map may have been removed; ignore
      }
    });

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
      <div
        data-testid={testId}
        className={`flex items-center justify-center ${className ?? "w-full h-64 bg-surface-container-low"}`}
      >
        <p className="text-error text-sm">Map unavailable: missing Mapbox token</p>
      </div>
    );
  }

  return (
    <div
      data-testid={testId}
      className={`relative overflow-hidden ${className ?? "w-full h-64 bg-surface-container-low"}`}
    >
      <Map
        ref={mapRef}
        initialViewState={{
          longitude,
          latitude,
          zoom: 15
        }}
        onLoad={handleMapLoad}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        scrollZoom={true}
        minZoom={7}
        maxBounds={georgiaBounds}
      >
        <NavigationControl position="top-right" />

        <Marker
          longitude={longitude}
          latitude={latitude}
          anchor="bottom"
        >
          <PinMarker />
        </Marker>
      </Map>
    </div>
  );
}
