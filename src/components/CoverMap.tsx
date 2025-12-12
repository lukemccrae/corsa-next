"use client";
import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import { useTheme } from "./ThemeProvider";

type CoverMapProps = {
  center?: [number, number];
  zoom?: number;
  points?: [number, number][];
  className?: string;
  interactive?: boolean; // if false the map is non-interactive like a cover image
  showCenterMarker?: boolean;
};

export default function CoverMap({
  center = [-35.02626523607081, 117.4867391480779],
  zoom = 10,
  points,
  className = "",
  interactive = true,
  showCenterMarker = true,
}: CoverMapProps) {
  const { theme } = useTheme();

  // small circular marker used for the center
  const centerIcon = L.divIcon({
    className: "cover-center-icon",
    html: `
    <img 
      src="https://i.imgur.com/9JxknPj.png" 
      style="width:32px; height:32px; border-radius:50%; border:2px solid white; box-shadow:0 0 6px rgba(227,74,74,0.35);" 
    />
  `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const wrapperClass = `${className} ${theme === "dark" ? "dark-topo" : ""}`;

  return (
    <div className={`h-120 w-full rounded-lg overflow-hidden ${wrapperClass}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={interactive}
        dragging={interactive}
        doubleClickZoom={interactive}
        attributionControl={false}
        zoomControl={interactive}
      >
        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          attribution="Map data: &copy; OpenStreetMap contributors"
          maxZoom={17}
        />

        {showCenterMarker && <Marker position={center} icon={centerIcon} />}

        {showCenterMarker && (
          <Marker position={center} icon={centerIcon}>
            <Popup>
              <div>Distance: 53 km.</div>
              <div>Elapsed: 5h35m</div>
            </Popup>
          </Marker>
        )}

        {points && points.length > 1 && (
          <Polyline
            positions={points}
            pathOptions={{ color: "#3b82f6", weight: 3, opacity: 0.9 }}
          />
        )}
      </MapContainer>
    </div>
  );
}
