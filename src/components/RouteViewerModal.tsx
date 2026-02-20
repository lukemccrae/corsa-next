"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Route } from "@/src/generated/schema";

const S3_BASE = "https://corsa-geojson-bucket.s3.us-west-1.amazonaws.com/";

type Coord = {
  idx: number;
  lng: number;
  lat: number;
  elevation: number;
  distance: number;
  cumulativeVert: number;
};

function parseGeoJson(json: unknown): Coord[] {
  const fc = json as {
    type: string;
    features: Array<{
      geometry: { type: string; coordinates: number[][] };
    }>;
  };
  if (!fc || fc.type !== "FeatureCollection" || !Array.isArray(fc.features)) {
    throw new Error("Invalid GeoJSON: expected FeatureCollection");
  }
  for (const feature of fc.features) {
    if (feature?.geometry?.type === "LineString") {
      return feature.geometry.coordinates.map((c, i) => ({
        idx: i,
        lng: c[0] ?? 0,
        lat: c[1] ?? 0,
        elevation: c[2] ?? 0,
        distance: c[3] ?? 0,
        cumulativeVert: c[4] ?? 0,
      }));
    }
  }
  throw new Error("No LineString feature found in GeoJSON");
}

/** Fits the map to the route bounds */
function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(L.latLngBounds(positions), { padding: [24, 24] });
    }
  }, [map, positions]);
  return null;
}

/** SVG elevation profile with hover */
function ElevationProfile({
  samples,
  onHover,
}: {
  samples: Coord[];
  onHover: (index: number | null, clientX: number, clientY: number) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const elevs = useMemo(() => samples.map((s) => s.elevation), [samples]);
  const minElev = Math.min(...elevs);
  const maxElev = Math.max(...elevs);
  const pad = (maxElev - minElev) * 0.08 || 10;

  const VBH = 120;
  const VBW = 800;
  const n = samples.length;

  const xFor = useCallback(
    (i: number) => (n <= 1 ? VBW / 2 : (i / (n - 1)) * VBW),
    [n]
  );

  const yFor = useCallback(
    (elev: number) => {
      const top = maxElev + pad;
      const bottom = minElev - pad;
      const t = (elev - bottom) / (top - bottom);
      return VBH - t * VBH;
    },
    [maxElev, minElev, pad]
  );

  const { areaPath, linePath } = useMemo(() => {
    const linePts: string[] = [];
    const areaPts: string[] = [];
    for (let i = 0; i < n; i++) {
      const sx = xFor(i);
      const sy = yFor(samples[i].elevation);
      linePts.push(`${sx},${sy}`);
      areaPts.push(`${sx},${sy}`);
    }
    areaPts.push(`${VBW},${VBH}`);
    areaPts.push(`0,${VBH}`);
    return {
      linePath: `M ${linePts.join(" L ")}`,
      areaPath: `${areaPts.join(" L ")} Z`,
    };
  }, [n, samples, xFor, yFor]);

  const handleMove = (e: React.MouseEvent) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const localX = e.clientX - rect.left;
    const t = Math.max(0, Math.min(1, localX / rect.width));
    const idx = Math.round(t * (n - 1));
    onHover(idx, e.clientX, e.clientY);
  };

  const handleLeave = (e: React.MouseEvent) => {
    onHover(null, e.clientX, e.clientY);
  };

  return (
    <div ref={wrapperRef} className="w-full">
      <svg
        viewBox={`0 0 ${VBW} ${VBH}`}
        preserveAspectRatio="none"
        className="w-full h-36"
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        role="img"
        aria-label="Elevation profile"
      >
        <rect x={0} y={0} width={VBW} height={VBH} fill="transparent" />
        <path d={areaPath} fill="#3b82f6" opacity={0.12} stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
        <span>{samples[0] ? `${samples[0].distance.toFixed(2)} mi` : "0.00 mi"}</span>
        <span>
          {samples[Math.floor(n / 2)]
            ? `${samples[Math.floor(n / 2)].distance.toFixed(2)} mi`
            : ""}
        </span>
        <span>
          {samples[n - 1] ? `${samples[n - 1].distance.toFixed(2)} mi` : ""}
        </span>
      </div>
    </div>
  );
}

type Props = {
  visible: boolean;
  onHide: () => void;
  route: Route | null;
};

export default function RouteViewerModal({ visible, onHide, route }: Props) {
  const [coords, setCoords] = useState<Coord[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });
  const chartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!visible || !route?.storageUrl) {
      setCoords([]);
      setLoadState("idle");
      return;
    }
    let cancelled = false;
    setLoadState("loading");
    setErrorMsg("");

    const url = `${S3_BASE}${route.storageUrl}`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        const parsed = parseGeoJson(json);
        setCoords(parsed);
        setLoadState("idle");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMsg(msg);
        setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [visible, route?.storageUrl]);

  const polyline = useMemo(
    () => coords.map((p) => [p.lat, p.lng] as [number, number]),
    [coords]
  );

  const markerPosition = useMemo(
    () =>
      hoverIndex != null && coords[hoverIndex]
        ? ([coords[hoverIndex].lat, coords[hoverIndex].lng] as [number, number])
        : null,
    [hoverIndex, coords]
  );

  const markerIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#e34a4a;border:3px solid white;box-shadow:0 0 6px #e34a4a99;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      }),
    []
  );

  const handleHover = useCallback(
    (i: number | null, clientX: number, clientY: number) => {
      if (i == null) {
        setHoverIndex(null);
        setTooltip((t) => ({ ...t, visible: false }));
      } else {
        setHoverIndex(i);
        const rect = chartRef.current?.getBoundingClientRect();
        if (rect) {
          const localX = Math.max(8, Math.min(rect.width - 8, clientX - rect.left));
          const localY = Math.max(8, Math.min(rect.height - 8, clientY - rect.top));
          setTooltip({ x: localX, y: localY, visible: true });
        }
      }
    },
    []
  );

  const mapCenter = useMemo(
    (): [number, number] =>
      coords.length > 0
        ? [coords[Math.floor(coords.length / 2)].lat, coords[Math.floor(coords.length / 2)].lng]
        : [0, 0],
    [coords]
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={route?.name ?? "Route"}
      modal
      dismissableMask
      style={{ width: "min(90vw, 860px)" }}
    >
      {loadState === "loading" && (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <i className="pi pi-spin pi-spinner mr-2" />
          Loading route&hellip;
        </div>
      )}

      {loadState === "error" && (
        <div className="flex flex-col items-center justify-center h-64 text-red-500 gap-2">
          <i className="pi pi-exclamation-triangle text-2xl" />
          <p>Failed to load route: {errorMsg}</p>
        </div>
      )}

      {loadState === "idle" && coords.length > 0 && (
        <div className="flex flex-col gap-4">
          {/* Map */}
          <div className="rounded-lg overflow-hidden border h-72">
            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="Map data &copy; OpenStreetMap contributors"
              />
              <FitBounds positions={polyline} />
              <Polyline
                positions={polyline}
                pathOptions={{ color: "#3b82f6", weight: 4, opacity: 0.9 }}
              />
              {markerPosition && (
                <Marker position={markerPosition} icon={markerIcon} />
              )}
            </MapContainer>
          </div>

          {/* Elevation graph */}
          <div className="rounded-lg border bg-white dark:bg-gray-900 p-4">
            <div ref={chartRef} className="relative w-full select-none">
              <ElevationProfile samples={coords} onHover={handleHover} />
              {tooltip.visible && hoverIndex != null && coords[hoverIndex] && (
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
                      elev: {Math.round(coords[hoverIndex].elevation)} ft
                    </div>
                    <div className="text-gray-500 text-[11px]">
                      dist: {coords[hoverIndex].distance.toFixed(2)} mi &bull; vert:{" "}
                      {coords[hoverIndex].cumulativeVert.toFixed(0)} ft
                    </div>
                    <div className="text-gray-400 text-[10px]">
                      {coords[hoverIndex].lat.toFixed(5)}, {coords[hoverIndex].lng.toFixed(5)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
