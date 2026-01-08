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
  profilePicture,
  isLive
}: {
  lat: number;
  lng: number;
  profilePicture: string;
  isLive: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const createProfileIcon = () => {
    const liveIndicator = isLive
      ? `<span style="position: absolute; top: -2px; right: -2px; width: 12px; height: 12px; background:  #ef4444; border:  2px solid white; border-radius: 50%;"></span>`
      : "";

    if (profilePicture) {
      return L.divIcon({
        className: "tracker-marker",
        html: `
          <div style="position: relative; width: 36px; height: 36px;">
            <img 
              src="${profilePicture}" 
              alt="${"User"}" 
              style="width: 36px; height: 36px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); object-fit: cover; background: white;"
            />
            ${liveIndicator}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
      });
    }

    // Fallback to initials if no profile picture
    return L.divIcon({
      className: "tracker-marker",
      html: `
        <div style="position: relative; width: 36px; height: 36px;">
          <div style="
            width: 36px; 
            height: 36px; 
            border-radius:  50%; 
            border:  2px solid white; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.2); 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 16px;
          ">
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });
  };

  if (!mounted) return null; // don't render map until mounted
  return (
    // hack to make it show
    <div className="h-[300px]">
      <MapContainer
        center={[lat, lng]}
        zoom={4}
        style={{ height: "100%", width: "100%" }}
        dragging={false}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        keyboard={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[lat, lng] as LatLngExpression}
          icon={createProfileIcon()}
        />
      </MapContainer>
    </div>
  );
}
