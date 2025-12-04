"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// create a default icon once
const DefaultIcon = L.icon({
  iconUrl: markerIcon.src ?? markerIcon,
  iconRetinaUrl: markerIcon2x.src ?? markerIcon2x,
  shadowUrl: markerShadow.src ?? markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// set default globally
L.Marker.prototype.options.icon = DefaultIcon;

export default function TrackerMap({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Only run in browser
    if (typeof window === "undefined") return;

    const currentIcon = (L as any).Marker?.prototype?.options?.icon;
    if (!currentIcon || (currentIcon.options && !currentIcon.options.iconUrl)) {
      L.Marker.prototype.options.icon = L.icon({
        iconRetinaUrl: (markerIcon2x as any).src ?? (markerIcon2x as any),
        // @ts-ignore
        iconUrl: (markerIcon as any).src ?? (markerIcon as any),
        shadowUrl: (markerShadow as any).src ?? (markerShadow as any),
      });
    }
  }, []);

  if (!mounted) return null; // don't render map until mounted
console.log(lat, lng, '<< TrackerMap coords');
  return (
    // hack to make it show
    <div className="h-[300px]">
      <MapContainer
        center={[lat, lng]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        dragging={false}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        keyboard={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lng] as LatLngExpression} />
      </MapContainer>
    </div>
  );
}
