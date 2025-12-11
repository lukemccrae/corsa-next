"use client";
import React from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
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
  center = [45.5231, -122.6765],
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
    html: `<div style="
      width:12px;height:12px;border-radius:50%;background:#e34a4a;border:2px solid white;
      box-shadow: 0 0 6px rgba(227,74,74,0.35);
    "></div>`,
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
          attribution='Map data: &copy; OpenStreetMap contributors'
          maxZoom={17}
        />

        {showCenterMarker && <Marker position={center} icon={centerIcon} />}

        {points && points.length > 1 && (
          <Polyline positions={points} pathOptions={{ color: "#3b82f6", weight: 3, opacity: 0.9 }} />
        )}
      </MapContainer>
    </div>
  );
}