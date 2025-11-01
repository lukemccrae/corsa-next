
'use client';
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

export type Point = {
  lat: number;
  lng: number;
  timestamp: number;
  altitude?: number;
  mileMarker?: number;
  message?: string;
};

type LiveMapProps = {
  center?: [number, number];
  points: Point[];
  selectedIndex?: number | null;
  onSelectIndex?: (i: number) => void;
};

function FlyToSelected({ coords }: { coords?: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    if (coords) {
      map.flyTo(coords, Math.max(map.getZoom(), 13), { duration: 0.8 });
    }
  }, [coords, map]);
  return null;
}

export default function LiveMap({ center, points, selectedIndex, onSelectIndex }: LiveMapProps) {
  const defaultCenter: [number, number] =
    center ?? (points.length ? [points[points.length - 1].lat, points[points.length - 1].lng] : [0, 0]);

  const routePositions = React.useMemo(
    () => points.map((p) => [p.lat, p.lng] as [number, number]),
    [points]
  );

  // icons
  const dotIcon = L.divIcon({
    className: 'dot-marker',
    html: `<div style="
      width:8px;height:8px;border-radius:50%;background:#111;border:2px solid #fff;
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  const highlightedIcon = L.divIcon({
    className: 'highlighted-marker',
    html: `<div style="
      width:14px;height:14px;border-radius:50%;background:#e34a4a;border:3px solid #fff;box-shadow:0 0 8px #e34a4a66;
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

  const selectedCoords =
    typeof selectedIndex === 'number' && points[selectedIndex]
      ? ([points[selectedIndex].lat, points[selectedIndex].lng] as [number, number])
      : undefined;

  return (
    <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        attribution="Map data © OpenStreetMap contributors"
        maxZoom={17}
      />

      {/* route polyline */}
      {routePositions.length > 1 && (
        <Polyline positions={routePositions} pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.9 }} />
      )}

      {/* markers */}
      {points.map((p, i) => (
        <Marker
          key={i}
          position={[p.lat, p.lng]}
          icon={i === selectedIndex ? highlightedIcon : dotIcon}
          eventHandlers={{
            click: () => {
              onSelectIndex?.(i);
            },
          }}
        >
          <Popup>
            <div className="min-w-[160px]">
              <div className="font-semibold text-sm">Point {i}</div>
              {p.message && <div className="text-xs text-gray-600">{p.message}</div>}
              <div className="text-xs text-gray-600 mt-1">
                {p.mileMarker !== undefined ? `Mile: ${p.mileMarker}` : null}
              </div>
              <div className="text-xs text-gray-600">
                Alt: {p.altitude ?? '—'}
              </div>
              <div className="text-xs text-gray-500">{new Date(p.timestamp).toLocaleString()}</div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* fly to selected marker when it changes */}
      <FlyToSelected coords={selectedCoords} />
    </MapContainer>
  );
}
