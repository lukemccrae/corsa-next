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
import type { Segment } from "../generated/schema";
import ProfileLiveChat from "./ProfileLiveChat";
import SegmentLeaderboard from "./SegmentLeaderboard";
import SegmentEffortLeaderboard from "./SegmentLeaderboard";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

type CoverMapProps = {
  segments: Segment[];
};

export default function BurritoMap(props: CoverMapProps) {
  const { theme } = useTheme();
  const [selectedSegment, setSelectedSegment] = useState<string>("407488430");
  const tileUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";

  const segmentOptions = useMemo(
    () =>
      props.segments.map((segment) => ({
        label: segment.title,
        value: segment.segmentId,
      })),
    [props.segments]
  );

  // Create icon for the athlete's current position
  const createSegmentIcon = () => {
    return L.divIcon({
      className: "athlete-marker",
      html: `
        <div
          style="
            width: 35px;
            height: 35px;
            background-color: #c61313ff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            position: relative;
          "
        >
          🌯
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
      zoom={3}
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
        if (!segment.location) return null;
        return (
          <Marker
            position={[segment.location.lat, segment.location.lng]}
            icon={createSegmentIcon()}
          >
            <Popup className="segment-popup" maxWidth={320}>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🌯</div>
                  <div>
                    <h3 className="font-semibold text-base leading-tight">
                      {segment.title}
                    </h3>
                    {segment.description && (
                      <p className="text-xs opacity-80 mt-1">
                        {segment.description}
                      </p>
                    )}
                  </div>
                </div>

                {(segment.city || segment.state || segment.country) && (
                  <div className="flex items-center gap-2 text-xs opacity-70">
                    <i className="pi pi-map-marker text-xs" />
                    <span>
                      {[segment.city, segment.state, segment.country]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {segment.link && (
                    <a
                      href={segment.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        label="Strava"
                        icon="pi pi-external-link"
                        size="small"
                        outlined
                        className="w-full"
                      />
                    </a>
                  )}
                  <a href={`/burritoleague/${segment.segmentId}`}>
                    <Button
                      label="Leaderboard"
                      icon="pi pi-trophy"
                      size="small"
                      className="w-full"
                    />
                  </a>
                </div>
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
        <h1 className="text-3xl font-bold mb-3">🌯 Burrito League</h1>
        <MapContent />
      </div>
    </>
  );
}
