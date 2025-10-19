'use client';
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
// Leaflet CSS is imported globally in layout (keep it there) or here if necessary
// import "leaflet/dist/leaflet.css";

type FullScreenMapProps = {
  center: [number, number];
  zoom?: number;
  className?: string;
  onProfileClick?: () => void;
};

export default function FullScreenMap({
  center,
  zoom = 13,
  className = '',
}: FullScreenMapProps) {
  const circleIcon = L.divIcon({
    className: 'custom-circle-icon',
    html: `<div style="
      width:12px;height:12px;border-radius:50%;background:#e34a4a;border:2px solid white;
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .leaflet-control-attribution svg { display: none !important; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
      return; // Ensure the return type is void
    };
  }, []);

  return (
    // Make sure parent (page/main) is h-full so this wrapper can be h-full too
    <div className={`${className} h-full w-full`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }} // explicit sizing for robustness
      >
        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          attribution='Map data: &copy; OpenStreetMap contributors'
          maxZoom={17}
        />
        <Marker position={center} icon={circleIcon}>
          <Popup>
            A basic Leaflet marker — center: {center[0]}, {center[1]}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}