"use client";
import React, { useEffect, useMemo, useState } from "react";
import LiveMap, { Point as MapPoint } from "./LiveMap";
import LiveStats from "./LiveStats";
import PointsList from "./PointsList";
import LiveChat from "./LiveChat";
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

  const headerBg = theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white";

  const handlePointSelect = (i?: number | null) => {
    if (typeof i === "number") setSelectedIndex(i);
    else setSelectedIndex(null);
  };

  // If you want LiveChat to update the parent-level messages (e.g. to show count), you can pass a callback.
  // LiveChat currently manages its own local send flow; here we'll just keep the initial messages in sync.
  const onNewLocalMessage = (msg: any) => {
    setMessages((m) => [...m, msg]);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header: profile picture + username link */}
      <div
        className={`flex items-center justify-between mb-4 ${headerBg} p-3 rounded-lg`}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Avatar
              image={profilePicture}
              label={
                !profilePicture ? username?.charAt(0).toUpperCase() : undefined
              }
              shape="circle"
              size="xlarge"
              className="!w-16 !h-16"
            />
          </div>
          <div>
            <a
              href={`/profile/${username}`}
              className="text-lg font-semibold hover:underline"
              aria-label={`Open ${username} profile`}
            >
              {username}
            </a>
            <div className="text-sm text-gray-500">
              {initialStream?.title ?? "Live stream"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon="pi pi-download"
            className="p-button-text"
            onClick={() => {
              // easy GPX download helper if route exists
              const url = initialStream?.routeGpxUrl;
              if (url) {
                window.open(url, "_blank");
              } else {
                alert("No GPX available");
              }
            }}
          />
          <Button
            label="View profile"
            icon="pi pi-user"
            className="p-button-text"
            onClick={() => {
              window.location.href = `/profile/${username}`;
            }}
          />
        </div>
      </div>

      {/* Main layout: map on left, chat/points/stats on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[70vh]">
        <div className="lg:col-span-2 h-full rounded-lg overflow-hidden border">
          <div className="h-full">
            <LiveStats
              points={points}
              selectedIndex={selectedIndex}
            />
            <LiveMap
              center={mapCenter}
              points={points}
              selectedIndex={selectedIndex ?? undefined}
              onSelectIndex={(i) => handlePointSelect(i)}
            />
          </div>
        </div>

        <aside className="flex flex-col gap-4 h-full">

          {/* <div className="flex-1 rounded-lg overflow-hidden border p-3 bg-white dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-medium">Waypoints</div>
              <div className="text-xs text-gray-400">{points.length} points</div>
            </div>
            <PointsList
              points={points}
              selectedIndex={selectedIndex ?? undefined}
              onSelectIndex={(i) => {
                handlePointSelect(i);
                // also attempt to fly map -> by setting selectedIndex handled above
              }}
            />
          </div> */}

          <div className="col-span-1 row-span-1 rounded-lg overflow-hidden border p-0 h-[72%]">
            {/* LiveChat takfes initialMessages. It manages its own local message state.
                If you want LiveChat to push messages back here, you can enhance LiveChat to accept a callback. */}
            <div className="h-full">
              <LiveChat streamUsername={username} initialMessages={messages} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
