"use client";

import React, { useEffect } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/**
 * TrackerMap (client)
 *
 * Fixes common Next/React-Leaflet server/client issues:
 * - Do not run L.Marker.prototype.options.icon assignment at module-eval time (it can run on the server).
 * - Run icon patch inside useEffect so it only runs in the browser.
 *
 * Also keep this component a client component ("use client") so Leaflet can access window/document.
 */

export default function TrackerMap({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  useEffect(() => {
    // Only run this in the browser
    if (typeof window === "undefined") return;

    try {
      // Ensure default marker icons are set exactly once
      // (some builds might already have set them via other modules)
      const currentIcon = (L as any).Marker?.prototype?.options?.icon;
      if (!currentIcon || (currentIcon && currentIcon.options && currentIcon.options.iconUrl === undefined)) {
        L.Marker.prototype.options.icon = L.icon({
          iconRetinaUrl: (markerIcon2x as any).src ?? (markerIcon2x as any),
          // @ts-ignore
          iconUrl: (markerIcon as any).src ?? (markerIcon as any),
          shadowUrl: (markerShadow as any).src ?? (markerShadow as any),
        });
      }
    } catch (err) {
      // swallow any error to avoid crashing server renders that accidentally evaluate this
      console.warn("leaflet icon patch failed", err);
    }
  }, []);

  // MapContainer rendered only on client (this file is client-only)
  return (
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
  );
}