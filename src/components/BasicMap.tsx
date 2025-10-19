'use client';
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import ProfileButton from './ProfileButton';
import ProfileDropdown from './ProfileButton';

type FullScreenMapProps = {
  center: [number, number];
  zoom?: number;
  className?: string;
  onProfileClick?: () => void; // Optional handler if you want it to be clickable
};

export default function FullScreenMap({
  center,
  zoom = 13,
  className = '',
  onProfileClick,
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
      .leaflet-control-attribution svg {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div className={`relative h-screen w-screen`}>
      <ProfileButton></ProfileButton>
      <MapContainer
        center={center}
        className="h-full w-full"
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', borderRadius: 8 }}
      >
        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors,
          <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy;
          <a href="https://opentopomap.org">OpenTopoMap</a>
          (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
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
