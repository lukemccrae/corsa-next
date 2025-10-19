import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";

type FullScreenMapProps = {
  center: [number, number];
  zoom?: number;
  className?: string;
};

/**
 * FullScreenMap
 * - Wrapper uses h-screen/w-screen so map fills the viewport.
 * - MapContainer uses height: 100% / width: 100% to fill the wrapper.
 * - If you prefer overlaying the map, use wrapperClass="fixed inset-0".
 */
export default function FullScreenMap({
  center,
  zoom = 13,
  className = '',
}: FullScreenMapProps) {
  // Example small circle icon (customize as needed)
  const circleIcon = L.divIcon({
    className: 'custom-circle-icon',
    html: `<div style="
      width:12px;height:12px;border-radius:50%;background:#e34a4a;border:2px solid white;
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  React.useEffect(() => {
    // Remove the national flag in Leaflet attribution control
    const style = document.createElement('style');
    style.innerHTML = `
              .leaflet-control-attribution svg {
                display: none !important;
              }
            `;
    document.head.appendChild(style);
  }, []);

  return (
    // Option A: full page via Tailwind utilities
    <div className={`h-screen w-screen ${className}`}>
      <MapContainer
        center={center}
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
              />Z
        <Marker position={center} icon={circleIcon}>
          <Popup>
            A basic Leaflet marker — center: {center[0]}, {center[1]}
          </Popup>
        </Marker>
      </MapContainer>
    </div>

    // Option B: If you need the map to overlay everything (use instead)
    // <div className={`fixed inset-0 ${className}`}>
    //   <MapContainer style={{ height: '100%', width: '100%' }} ... />
    // </div>
  );
}