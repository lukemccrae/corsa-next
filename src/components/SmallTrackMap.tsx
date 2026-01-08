"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import { useTheme } from "./ThemeProvider";

type SmallTrackMapProps = {
  points: [number, number][];
  className?: string;
  zoom?: number;
  center?: [number, number];
  // optional click handler so callers can make the map act like a link
  onClick?: () => void;
};

export default function SmallTrackMap({
  points,
  className = "",
  zoom = 5,
  center,
  onClick,
}: SmallTrackMapProps) {
  const { theme } = useTheme();

  // fallback center is first point or world center
  const mapCenter: [number, number] =
    center ?? (points && points.length > 0 ? points[Math.floor(points.length / 2)] : [45.5231, -122.6765]);

  // small custom icon for start/end
  const startIcon = L.divIcon({
    className: "small-start-icon",
    html: `<div style="width:8px;height:8px;border-radius:50%;background:#22c55e;border:2px solid white;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  const endIcon = L.divIcon({
    className: "small-end-icon",
    html: `<div style="width:8px;height:8px;border-radius:50%;background:#ef4444;border:2px solid white;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });

  const lineColor = theme === "dark" ? "#60a5fa" : "#1e40af"; // light blue / indigo

  return (
    // make the container relative so we can put an accessible clickable overlay above the map
    <div className={`relative ${className} rounded-md overflow-hidden bg-gray-50 dark:bg-gray-800`}>
      {/* Map itself - non-interactive for preview */}
      <MapContainer
        key={JSON.stringify(mapCenter) + points.length} // force remount for small maps when data changes
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        attributionControl={false}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          attribution=""
          maxZoom={17}
        />
        {points && points.length > 0 && (
          <>
            <Polyline positions={points} pathOptions={{ color: lineColor, weight: 3, opacity: 0.95 }} />
            <Marker position={points[0]} icon={startIcon} />
            <Marker position={points[points.length - 1]} icon={endIcon} />
          </>
        )}
      </MapContainer>

      {/* Clickable overlay:
          - intercepts clicks and calls onClick (so map behaves like a link)
          - still allows map visuals underneath to be seen
          - keyboard-focusable for accessibility and has aria-label
      */}
      {onClick && (
        <button
          type="button"
          onClick={onClick}
          aria-label="Open activity"
          className="absolute inset-0 z-10 bg-transparent hover:bg-black/5 dark:hover:bg-white/3 transition-colors cursor-pointer focus:outline-none"
        />
      )}
    </div>
  );
}