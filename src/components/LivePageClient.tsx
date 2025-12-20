"use client";
import React, { useEffect, useMemo, useState } from "react";
import LiveMap, { Point as MapPoint } from "./LiveMap";
import LiveStats from "./LiveStats";
import PointsList from "./PointsList";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { useTheme } from "./ThemeProvider";

type Props = {
  username: string;
  streamId: string;
  initialStream?: any;
  initialPoints?: any[]; // server-provided raw points (may have lat/long or lat/lng and timestamps as strings)
  initialMessages?: any[]; // chat messages
};

export default function LivePageClient({
  username,
  streamId,
  initialStream = {},
  initialPoints = [],
  initialMessages = [],
}: Props) {
  const { theme } = useTheme();

  // profile picture from server stream data (if present)
  const profilePicture: string | undefined =
    initialStream?.profilePicture ?? undefined;

  // normalize incoming points to the MapPoint type used by LiveMap/PointsList
  const normalizePoints = (pts: any[]): MapPoint[] => {
    return (pts || [])
      .map((p: any) => {
        // support several possible shapes: { lat, lng, timestamp }, { lat, long, timestamp }, strings, etc.
        const latRaw =
          p.lat ??
          p.latitude ??
          (p.currentLocation && p.currentLocation.lat) ??
          null;
        const lngRaw =
          p.lng ??
          p.longitude ??
          p.long ??
          (p.currentLocation && p.currentLocation.lng) ??
          null;
        const tsRaw = p.timestamp ?? p.time ?? p.createdAt ?? p.ts ?? null;

        const lat = typeof latRaw === "string" ? parseFloat(latRaw) : latRaw;
        const lng = typeof lngRaw === "string" ? parseFloat(lngRaw) : lngRaw;
        let timestamp: number;
        if (!tsRaw) {
          timestamp = Date.now();
        } else if (typeof tsRaw === "number") {
          timestamp = tsRaw;
        } else {
          // try ISO parse or numeric string
          const parsed = Date.parse(String(tsRaw));
          timestamp = isNaN(parsed) ? Number(tsRaw) || Date.now() : parsed;
        }

        const altitude =
          p.altitude ??
          p.elevation ??
          p.elev ??
          (p.alt
            ? typeof p.alt === "string"
              ? parseFloat(p.alt)
              : p.alt
            : undefined);

        const mileMarker = p.mileMarker ?? p.mile ?? p.miles ?? undefined;

        return {
          lat: Number(lat ?? 0),
          lng: Number(lng ?? 0),
          timestamp: Number(timestamp),
          altitude: altitude !== undefined ? Number(altitude) : undefined,
          mileMarker: mileMarker !== undefined ? Number(mileMarker) : undefined,
          message: p.message ?? undefined,
        } as MapPoint;
      })
      .filter((pt) => !isNaN(pt.lat) && !isNaN(pt.lng));
  };

  const [points, setPoints] = useState<MapPoint[]>(() =>
    normalizePoints(initialPoints)
  );
  const [messages, setMessages] = useState<any[]>(initialMessages ?? []);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // If initialPoints change (server revalidate), update normalized points
  useEffect(() => {
    setPoints(normalizePoints(initialPoints));
  }, [initialPoints]);

  // If initialMessages change, replace (useful if server passes fresh snapshot)
  useEffect(() => {
    setMessages(initialMessages ?? []);
  }, [initialMessages]);

  const handlePointSelect = (i?: number | null) => {
    if (typeof i === "number") setSelectedIndex(i);
    else setSelectedIndex(null);
  };

  const mapCenter = useMemo<[number, number] | undefined>(() => {
    if (points.length) {
      const last = points[points.length - 1];
      return [last.lat, last.lng];
    }
    if (initialStream?.currentLocation) {
      return [
        initialStream.currentLocation.lat,
        initialStream.currentLocation.lng,
      ];
    }
    return undefined;
  }, [points, initialStream]);

  const handleDownloadGpx = () => {
    const url = initialStream?.routeGpxUrl;
    if (url) {
      window.open(url, "_blank");
    } else {
      alert("No GPX available");
    }
  };

  // theme-aware card bg for any small inline header
  const headerBg = theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Main layout: map on left, chat/points on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[70vh]">
        <div className="lg:col-span-2 h-full flex flex-col gap-3">
          {/* Card directly ABOVE the map (not overlay). Compact profile + stats */}
          <LiveStats
            points={points}
            selectedIndex={selectedIndex}
            username={username}
            profilePicture={profilePicture}
            streamTitle={initialStream?.title}
            onDownloadGpx={handleDownloadGpx}
            className="" // spacing handled by parent
          />

          {/* Map card — sits under the header card */}
          <div className="h-[400px] rounded-lg overflow-hidden border">
            <LiveMap
              center={mapCenter}
              points={points}
              selectedIndex={selectedIndex ?? undefined}
              onSelectIndex={(i) => handlePointSelect(i)}
            />
          </div>
        </div>

        <aside className="flex flex-col gap-4 h-full">
          <div className="col-span-1 row-span-1 rounded-lg overflow-hidden border p-0 h-[72%]">
          </div>
        </aside>
      </div>
    </div>
  );
}