"use client";
import React, { useEffect, useState } from "react";
import LiveMap, { Point } from "./LiveMap";
import LiveStats from "./LiveStats";
import LiveChat from "./LiveChat";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";

type StreamShape = {
  title?: string;
  streamId?: string;
  startTime?: string | number;
  finishTime?: string | number;
  currentLocation?: { lat?: number; lng?: number } | null;
  routeGpxUrl?: string | null;
  // the server query maps waypoints -> points, but allow either
  points?: any[];
  waypoints?: any[];
  chatMessages?: any[];
  [k: string]: any;
};

export default function LivePageClient({
  username,
  streamId,
  initialStream,
  initialPoints,
  initialMessages,
}: {
  username: string;
  streamId: string;
  initialStream: StreamShape;
  initialPoints: any[];
  initialMessages: any[];
}) {
  // Local state for interactive client-side behavior
  const [stream, setStream] = useState<StreamShape>(initialStream);
  const [points, setPoints] = useState<Point[]>(
    (initialPoints ?? []).map((p: any) => normalizePoint(p))
  );
  const [messages, setMessages] = useState<any[]>(initialMessages ?? []);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [gpxLoading, setGpxLoading] = useState(false);

  useEffect(() => {
    // If server passes a new stream object (rare on first render), sync local copy.
    setStream(initialStream);
  }, [initialStream]);

  useEffect(() => {
    setPoints((initialPoints ?? []).map((p: any) => normalizePoint(p)));
  }, [initialPoints]);

  useEffect(() => {
    setMessages(initialMessages ?? []);
  }, [initialMessages]);

  function normalizePoint(p: any): Point {
    // Accept different shapes (lat/lng or lat/long)
    const lat =
      p.lat != null ? Number(p.lat) : p.latitude != null ? Number(p.latitude) : undefined;
    const lng =
      p.lng != null ? Number(p.lng) : p.long != null ? Number(p.long) : p.longitude != null ? Number(p.longitude) : undefined;
    const timestamp = p.timestamp != null ? Number(p.timestamp) : p.ts ?? undefined;
    return {
      lat: lat ?? 0,
      lng: lng ?? 0,
      timestamp: timestamp ?? Date.now(),
      altitude: p.altitude ?? p.elevation ?? null,
      mileMarker: p.mileMarker ?? p.mile ?? null,
      message: p.message ?? p.note ?? undefined,
    };
  }

  const handleSelectIndex = (i: number | null) => {
    setSelectedIndex(i);
  };

  const downloadGPX = async () => {
    const url = stream?.routeGpxUrl;
    if (!url) {
      alert("No GPX available for this stream");
      return;
    }

    try {
      setGpxLoading(true);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch GPX");
      const text = await res.text();
      const blob = new Blob([text], { type: "application/gpx+xml" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${username}-${stream.streamId ?? streamId}.gpx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error("GPX download failed", err);
      alert("Failed to download GPX");
    } finally {
      setGpxLoading(false);
    }
  };

  return (
    <div className="h-full w-full p-4 md:p-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-4">
      <div className="flex-1 min-h-[60vh] md:min-h-[72vh] rounded-2xl overflow-hidden shadow">
        <LiveMap
          center={
            stream?.currentLocation
              ? [stream.currentLocation.lat ?? 37.7749, stream.currentLocation.lng ?? -122.4194]
              : [37.7749, -122.4194]
          }
          points={points}
          selectedIndex={selectedIndex}
          onSelectIndex={(i) => handleSelectIndex(i)}
        />
      </div>

      <aside className="w-full md:w-96 flex flex-col gap-4">
        <div className="flex items-center justify-between bg-white/80 dark:bg-gray-800/80 rounded-xl p-3 shadow">
          <div className="flex items-center gap-3">
            <Avatar
              label={username?.charAt(0)?.toUpperCase()}
              shape="circle"
              size="large"
            />
            <div className="flex flex-col">
              <div className="font-semibold">{username}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">
                {stream?.title ? `Live — ${stream.title}` : "Live"}
              </div>
            </div>
          </div>
          <div>
            <Button
              icon="pi pi-download"
              className="p-button-text"
              onClick={downloadGPX}
              aria-label="Download GPX"
              loading={gpxLoading}
            />
          </div>
        </div>

        <LiveStats points={points} selectedIndex={selectedIndex} />

        <div className="w-full lg:w-96 flex-shrink-0 rounded-xl overflow-hidden border border-gray-100 dark:border-white/6 shadow bg-white dark:bg-gray-800">
          <LiveChat
            streamUsername={username}
            initialMessages={messages}
            onNewMessage={(m: any) => setMessages((s) => [...s, m])}
          />
        </div>
      </aside>
    </div>
  );
}