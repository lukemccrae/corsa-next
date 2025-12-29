"use client";
import React, { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { useTheme } from "./ThemeProvider";

type Runner = {
  username: string;
  profilePicture?: string;
  streamId: string;
  title?:  string;
  waypoints:  Array<{
    lat: number;
    lng: number;
    timestamp: string;
    altitude?:  number;
    mileMarker?:  number;
  }>;
  mileMarker?: number;
  live?:  boolean;
};

type Props = {
  runners: Runner[];
};

// Generate distinct colors for each runner
const RUNNER_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
];

export default function GroupLiveMap({ runners }: Props) {
  const { theme } = useTheme();
  const [selectedRunner, setSelectedRunner] = useState<string | null>(null);

  // Calculate map center (average of all last positions)
  const mapCenter = useMemo<[number, number]>(() => {
    const positions = runners
      .map((r) => {
        const last = r.waypoints[r.waypoints.length - 1];
        return last ? [last.lat, last.lng] : null;
      })
      .filter(Boolean) as [number, number][];

    if (positions.length === 0) return [37.7749, -122.4194]; // default SF

    const avgLat = positions. reduce((sum, p) => sum + p[0], 0) / positions.length;
    const avgLng = positions.reduce((sum, p) => sum + p[1], 0) / positions.length;
    return [avgLat, avgLng];
  }, [runners]);

  // Create icon for each runner with their color
  const createRunnerIcon = (runner: Runner, index: number) => {
    const color = RUNNER_COLORS[index % RUNNER_COLORS.length];
    const isSelected = selectedRunner === runner.streamId;
    const size = isSelected ? 24 : 18;

    return L.divIcon({
      className: "runner-marker",
      html: `<div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border:  3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ${isSelected ? "transform: scale(1.2);" : ""}
      "></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  return (
    <div className="relative w-full h-[500px]">
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="w-full h-full rounded-lg"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          className={theme === "dark" ? "dark-topo" : ""}
        />

        {runners.map((runner, index) => {
          const color = RUNNER_COLORS[index % RUNNER_COLORS.length];
          const positions = runner.waypoints. map((w) => [w.lat, w.lng] as [number, number]);
          const lastPos = positions[positions.length - 1];

          if (!lastPos) return null;

          return (
            <React.Fragment key={runner.streamId}>
              {/* Route line */}
              {positions.length > 1 && (
                <Polyline
                  positions={positions}
                  pathOptions={{
                    color: color,
                    weight: 4,
                    opacity: selectedRunner === runner.streamId ? 1 : 0.6,
                  }}
                  eventHandlers={{
                    click:  () => setSelectedRunner(runner.streamId),
                  }}
                />
              )}

              {/* Current position marker */}
              <Marker
                position={lastPos}
                icon={createRunnerIcon(runner, index)}
                eventHandlers={{
                  click:  () => setSelectedRunner(runner. streamId),
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <div className="font-bold">{runner.username}</div>
                    {runner.title && <div className="text-xs">{runner.title}</div>}
                    <div className="text-xs mt-1">
                      Distance: {runner.mileMarker?. toFixed(2) || "0. 00"} mi
                    </div>
                    {runner.live && (
                      <div className="text-xs text-green-600 font-semibold">● LIVE</div>
                    )}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-xs">
        <div className="text-xs font-bold mb-2">Participants</div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {runners. map((runner, index) => {
            const color = RUNNER_COLORS[index % RUNNER_COLORS.length];
            return (
              <button
                key={runner.streamId}
                onClick={() => setSelectedRunner(runner.streamId)}
                className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-xs ${
                  selectedRunner === runner.streamId ?  "bg-gray-100 dark:bg-gray-700" : ""
                }`}
              >
                <div
                  style={{ backgroundColor: color }}
                  className="w-3 h-3 rounded-full border-2 border-white"
                />
                <span className="truncate flex-1">{runner.username}</span>
                {runner.live && <span className="text-green-600 text-[10px]">● LIVE</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}