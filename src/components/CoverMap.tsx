"use client";
import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import { useTheme } from "./ThemeProvider";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

type CoverMapProps = {
  center?: [number, number];
  zoom?: number;
  points?: [number, number][];
  className?: string;
  interactive?: boolean; // if false the map is non-interactive like a cover image
  showCenterMarker?: boolean;
  username: string;
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
  const [expanded, setExpanded] = useState(false);
  const tileUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"

  const markerPosition = center;

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
    <>
    <div className={`h-60 w-full rounded-lg overflow-hidden ${wrapperClass}`}>
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
          url={tileUrl}
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
      <div className="absolute top-2 right-2 z-[1000]">
        <Button
          icon="pi pi-window-maximize"
          rounded
          text
          severity="secondary"
          onClick={() => setExpanded(true)}
          className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg"
          aria-label="Expand map"
          tooltip="Expand map"
          tooltipOptions={{ position: "left" }}
        />
      </div>
    </div>
    <Dialog
      visible={expanded}
      onHide={() => setExpanded(false)}
      header="Map View"
      modal
      dismissableMask
      maximizable
      style={{ width: "90vw", height: "90vh" }}
      contentClassName="p-0"
    >
      <div className="w-full h-full" style={{ minHeight: "70vh" }}>
        <MapContainer
          center={center}
          zoom={zoom}
          className={`h-full ${theme === "dark" ? "dark-topo" :  ""}`}
          scrollWheelZoom={true}
          dragging={true}
          doubleClickZoom={true}
          touchZoom={true}
          zoomControl={true}
        >
          {/* Copy the same TileLayer, Polyline, Marker from above */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={tileUrl}
          />
          {points && points.length > 1 && (
            <Polyline
              positions={points}
              pathOptions={{
                color: 'black',
                weight: 3,
                opacity: 0.8,
              }}
            />
          )}
          {markerPosition && <Marker position={center} icon={centerIcon} />}
        </MapContainer>
      </div>
    </Dialog>
    </>
  );
}
