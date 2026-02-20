"use client";

import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type HoverCoord = {
  lat: number;
  lng: number;
  elevation: number;
  distance: number;
};

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(L.latLngBounds(positions), { padding: [40, 40] });
    }
  }, [map, positions]);
  return null;
}

type Props = {
  polyline: [number, number][];
  hoverCoord: HoverCoord | null;
};

export default function RouteMapPanel({ polyline, hoverCoord }: Props) {
  const center: [number, number] = useMemo(() => {
    if (polyline.length > 0) {
      return polyline[Math.floor(polyline.length / 2)];
    }
    return [39, -98];
  }, [polyline]);

  const markerIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;border-radius:9999px;background:#f97316;border:2px solid #fff;box-shadow:0 0 6px rgba(249,115,22,0.6);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      }),
    [],
  );

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
      />
      {polyline.length > 0 && (
        <>
          <Polyline
            positions={polyline}
            pathOptions={{ color: "#60a5fa", weight: 3, opacity: 0.9 }}
          />
          <FitBounds positions={polyline} />
        </>
      )}
      {hoverCoord && (
        <Marker position={[hoverCoord.lat, hoverCoord.lng]} icon={markerIcon} />
      )}
    </MapContainer>
  );
}
