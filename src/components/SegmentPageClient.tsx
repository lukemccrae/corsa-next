"use client";
import React, { useState, useMemo } from "react";
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
import type { Segment, Waypoint } from "../generated/schema";
import { profile } from "console";

type CoverMapProps = {
  segments: Segment[];
};

export default function CoverMap(props: CoverMapProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const tileUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";

  // Create icon for the athlete's current position
  const createSegmentIcon = () => {
    return L.divIcon({
      className: "athlete-marker",
      html: `
          <div style="position: relative;">
            <img 
              src="https://i.imgur.com/FpfBv5b.png" 
              style="width:40px; height:40px; border-radius:50%; border:3px solid #3b82f6; box-shadow:0 0 8px rgba(59,130,246,0.5); object-fit:  cover;" 
              alt="burrito league"
            />
          </div>
        `,
      iconSize: [48, 48],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  };

  const MapContent = () => (
    <MapContainer
      center={[37.65269205846588, -93.40350964996749]}
      zoom={4}
      style={{ height: "100%", width: "100%" }}
      dragging={true}
      doubleClickZoom={true}
      attributionControl={false}
      zoomControl={true}
    >
      <TileLayer
        url={tileUrl}
        attribution="Map data: &copy; OpenStreetMap contributors"
        maxZoom={17}
      />

      {/* Current location marker with profile picture */}
      {props.segments.map((segment, index) => {
        console.log(segment);
        if (!segment.location) return null;
        return (
          <Marker
            position={[segment.location.lat, segment.location.lng]}
            icon={createSegmentIcon()}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold mb-1">{segment.title}</div>
                <div className="font-semibold mb-1">{segment.description}</div>
                {segment.link && (
                  <a
                    href={segment.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    Strava Segment Info
                  </a>
                )}

              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );

  return (
    <>
      <div className="relative w-full max-w-3xl mx-auto aspect-[16/9] rounded-lg overflow-hidden mt-10">
        <MapContent />
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
          <div className={`h-full ${theme === "dark" ? "dark-topo" : ""}`}>
            <MapContent />
          </div>
        </div>
      </Dialog>
    </>
  );
}
