'use client';

import React, { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "primereact/card";

/**
 * Single-file page that renders:
 * - Leaflet map (top)
 * - Hoverable elevation profile (SVG) below the map
 *
 * Everything is kept in this file (no subcomponents) per request.
 *
 * Notes:
 * - The provided geometry array is interpreted as [lng, lat, elevation, cumulativeDistance, cumulativeVert]
 *   (the example data uses negative longitudes followed by latitudes).
 * - The elevation profile is interactive: moving the mouse over the chart highlights the nearest
 *   sample, shows a tooltip with the sample values, and places a marker on the map at that sample.
 */

/* sample data (use your full data here). Structure: [lng, lat, elevation, cumulativeDistance, cumulativeVert] */
const SAMPLES: Array<[number, number, number, number, number]> = [
  [-86.354259, 32.978366, 347.20001220703125, 0.02, 0],
  [-86.353963, 32.978255, 346.3999938964844, 0.04, 0],
  [-86.353671, 32.978117, 344.79998779296875, 0.07, 0],
  [-86.353204, 32.978194, 341, 0.08, 0],
  [-86.352995, 32.978217, 338.6000061035156, 0.09, 0],
  [-86.352786, 32.978217, 335.79998779296875, 0.1, 0],
  [-86.352598, 32.978307, 333.6000061035156, 0.11, 0],
  [-86.352523, 32.978379, 332.6000061035156, 0.12, 0],
  [-86.352469, 32.978455, 332.20001220703125, 0.12, 0],
  [-86.352437, 32.978541, 330.3999938964844, 0.13, 0],
  [-86.352367, 32.978613, 328, 0.13, 0],
  [-86.352266, 32.97859, 326.3999938964844, 0.15, 0],
  [-86.352067, 32.978509, 323.3999938964844, 0.15, 0],
  [-86.351987, 32.978446, 320.6000061035156, 0.16, 0],
  [-86.351938, 32.978365, 316.6000061035156, 0.17, 0],
  [-86.351885, 32.978289, 315.3999938964844, 0.17, 0],
  [-86.351788, 32.978257, 311.20001220703125, 0.18, 0],
  [-86.351729, 32.978334, 309.3999938964844, 0.18, 1.02],
  [-86.351724, 32.978424, 309.79998779296875, 0.19, 1.02],
  [-86.351724, 32.978518, 309.6000061035156, 0.2, 8.7],
  [-86.351772, 32.978698, 312.6000061035156, 0.21, 8.7],
  [-86.351836, 32.978784, 312, 0.22, 11.77],
  [-86.351928, 32.978847, 313.20001220703125, 0.23, 11.77],
  [-86.352072, 32.979004, 312.20001220703125, 0.24, 11.77],
  [-86.352126, 32.979085, 308.79998779296875, 0.24, 11.77],
];

export default function RouteView() {
  // normalized samples as objects for easier use
  const samples = useMemo(
    () =>
      SAMPLES.map((s, i) => ({
        idx: i,
        lng: s[0],
        lat: s[1],
        elevation: s[2],
        distance: s[3],
        cumulativeVert: s[4],
      })),
    []
  );

  // map polyline positions (leaflet wants [lat, lng])
  const polyline = useMemo(
    () => samples.map((p) => [p.lat, p.lng] as [number, number]),
    [samples]
  );

  // state for hovered index (null when not hovering)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // state for chart tooltip position (client coordinates inside chart container)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  // reference to chart container for mouse position calculations
  const chartRef = useRef<HTMLDivElement | null>(null);

  // derive map marker position from hoverIndex
  const markerPosition = hoverIndex != null ? [samples[hoverIndex].lat, samples[hoverIndex].lng] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* Map container */}
      <div className="rounded-lg overflow-hidden border mb-4 h-[40vh]">
        <MapContainer
          center={[samples[Math.floor(samples.length / 2)].lat, samples[Math.floor(samples.length / 2)].lng]}
          zoom={15}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="Map data © OpenStreetMap contributors"
          />

          <Polyline positions={polyline} pathOptions={{ color: "#3b82f6", weight: 4, opacity: 0.9 }} />

          {/* marker that follows hover (render only when hovering) */}
          {markerPosition && (
            <Marker
              position={markerPosition}
              icon={L.divIcon({
                className: "hover-marker",
                html: `<div style="
                  width:16px;height:16px;border-radius:50%;background:#e34a4a;border:3px solid white;box-shadow:0 0 8px #e34a4a66;
                "></div>`,
                iconSize: [18, 18],
                iconAnchor: [9, 9],
              })}
            />
          )}
        </MapContainer>
      </div>

      {/* Elevation profile */}
      <div className="rounded-lg border bg-white dark:bg-gray-900 p-4">
        <div ref={chartRef} className="relative w-full select-none">
          <ElevationProfile
            samples={samples}
            onHover={(i, clientX, clientY) => {
              if (i == null) {
                setHoverIndex(null);
                setTooltip((t) => ({ ...t, visible: false }));
              } else {
                setHoverIndex(i);
                // compute tooltip local position (clip to container)
                const rect = chartRef.current?.getBoundingClientRect();
                if (rect) {
                  const localX = Math.max(8, Math.min(rect.width - 8, clientX - rect.left));
                  const localY = Math.max(8, Math.min(rect.height - 8, clientY - rect.top));
                  setTooltip({ x: localX, y: localY, visible: true });
                } else {
                  setTooltip({ x: clientX, y: clientY, visible: true });
                }
              }
            }}
          />

          {/* Tooltip box */}
          {tooltip.visible && hoverIndex != null && (
            <div
              className="absolute z-20 pointer-events-none"
              style={{
                left: tooltip.x + 12,
                top: tooltip.y - 28,
                transform: "translateY(-50%)",
              }}
            >
              <div className="rounded-md bg-white/95 dark:bg-gray-800/95 border px-2 py-1 text-xs shadow">
                <div className="font-medium">
                  elev: {Math.round(samples[hoverIndex].elevation)} ft
                </div>
                <div className="text-gray-500 text-[11px]">
                  dist: {samples[hoverIndex].distance} mi • vert: {samples[hoverIndex].cumulativeVert}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ElevationProfile (inline function to keep everything in this file)
 *
 * - Renders a responsive SVG area chart of elevation vs sample index (distance approximates x)
 * - Calls onHover(index | null, clientX, clientY) as the mouse moves or leaves
 *
 * Props:
 * - samples: normalized sample objects
 * - onHover: callback
 */
function ElevationProfile({
  samples,
  onHover,
}: {
  samples: { idx: number; lat: number; lng: number; elevation: number; distance: number; cumulativeVert: number }[];
  onHover: (index: number | null, clientX: number, clientY: number) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // compute elevation range
  const elevs = samples.map((s) => s.elevation);
  const minElev = Math.min(...elevs);
  const maxElev = Math.max(...elevs);
  const pad = (maxElev - minElev) * 0.08 || 10;

  const viewBoxHeight = 120;
  const viewBoxWidth = 800; // logical width; we'll scale with preserveAspectRatio
  const points = samples.length;

  // helper translate sample index to x in SVG coords
  const xFor = (i: number, width: number) => {
    if (points <= 1) return width / 2;
    return (i / (points - 1)) * width;
  };

  const yFor = (elev: number, height: number) => {
    const top = maxElev + pad;
    const bottom = minElev - pad;
    const t = (elev - bottom) / (top - bottom); // 0..1
    // SVG y grows downward; invert
    return height - t * height;
  };

  // Build path strings
  const buildPaths = (width: number, height: number) => {
    const linePts: string[] = [];
    const areaPts: string[] = [];

    for (let i = 0; i < samples.length; i++) {
      const sx = xFor(i, width);
      const sy = yFor(samples[i].elevation, height);
      linePts.push(`${sx},${sy}`);
      areaPts.push(`${sx},${sy}`);
    }
    // close area to bottom
    areaPts.push(`${width},${height}`);
    areaPts.push(`0,${height}`);

    return {
      linePath: `M ${linePts.join(" L ")}`,
      areaPath: `${areaPts.join(" L ")} Z`,
    };
  };

  // mouse handlers on the overlay div
  const handleMove = (e: React.MouseEvent) => {
    const rect = (wrapperRef.current as HTMLDivElement).getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const width = rect.width;
    const t = Math.max(0, Math.min(1, localX / width));
    const idx = Math.round(t * (points - 1));
    onHover(idx, e.clientX, e.clientY);
  };

  const handleLeave = (e: React.MouseEvent) => {
    onHover(null, e.clientX, e.clientY);
  };

  // render responsive SVG (use viewBox so it scales)
  return (
    <div ref={wrapperRef} className="w-full">
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="none"
        className="w-full h-36"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        role="img"
        aria-label="Elevation profile"
      >
        {/* background */}
        <rect x={0} y={0} width={viewBoxWidth} height={viewBoxHeight} fill="transparent" />

        {/* compute paths using logical width/height */}
        {(() => {
          const { areaPath, linePath } = buildPaths(viewBoxWidth, viewBoxHeight);
          return (
            <>
              {/* gradient-ish fill (subtle) */}
              <path d={areaPath} fill="#3b82f6" opacity={0.12} stroke="none" />
              {/* central line */}
              <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

              {/* sample dots */}
              {samples.map((s, i) => {
                const cx = xFor(i, viewBoxWidth);
                const cy = yFor(s.elevation, viewBoxHeight);
                return <circle key={i} cx={cx} cy={cy} r={1.8} fill="#1e3a8a" opacity={0.9} />;
              })}
            </>
          );
        })()}
        {/* active vertical marker & label rendered via foreignObject for crisp HTML tooltip is not necessary
            We instead rely on an external tooltip positioned above the chart container. */}
      </svg>

      {/* small x-axis showing distance ticks */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <div>{samples[0] ? `${samples[0].distance} mi` : "0.00 mi"}</div>
        <div>{samples[Math.floor(samples.length / 2)] ? `${samples[Math.floor(samples.length / 2)].distance ?? ""} mi` : ""}</div>
        <div>{samples[samples.length - 1] ? `${samples[samples.length - 1].distance} mi` : ""}</div>
      </div>
    </div>
  );
}