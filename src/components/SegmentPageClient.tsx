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

type CoverMapProps = {
  segments: Segment[];
};

export default function CoverMap(props: CoverMapProps) {
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
        <h2 className="text-2xl font-bold mb-3">🌯 Burrito League</h2>
        <MapContent />

        {/* <ProfileLiveChat
          profileUsername={user.username}
          initialMessages={chatMessgaes as unknown as ChatMessage[]}
        /> */}
      </div>
      <div className="max-w-3xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-3">Leaderboard</h2>
        <Dropdown
          value={selectedSegment}
          options={segmentOptions}
          onChange={(e) => {
            setSelectedSegment(e.value);
          }}
          placeholder="Select a segment"
          className="w-full mb-5"
          panelClassName="shadow-lg"
        />
        <SegmentEffortLeaderboard
          segmentId={selectedSegment}
          className="max-w-4xl mx-auto"
        />
      </div>
    </>
  );
}
