"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dialog } from "primereact/dialog";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Route } from "@/src/generated/schema";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";

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

/** SVG elevation profile with hover + current position indicator */
function ElevationProfile({
  samples,
  activeIndex,
  onHover,
}: {
  samples: Coord[];
  activeIndex: number | null;
  onHover: (index: number | null) => void;
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
    [n],
  );

  const yFor = useCallback(
    (elev: number) => {
      const top = maxElev + pad;
      const bottom = minElev - pad;
      const t = (elev - bottom) / (top - bottom);
      return VBH - t * VBH;
    },
    [maxElev, minElev, pad],
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

  const setFromClientX = (clientX: number) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const localX = clientX - rect.left;
    const t = Math.max(0, Math.min(1, localX / rect.width));
    const idx = Math.round(t * (n - 1));
    onHover(idx);
  };

  const handleMouseMove = (e: React.MouseEvent) => setFromClientX(e.clientX);
  const handleTouchMove = (e: React.TouchEvent) => {
    const t = e.touches?.[0];
    if (!t) return;
    setFromClientX(t.clientX);
  };

  const handleLeave = () => onHover(null);

  const active =
    activeIndex != null && samples[activeIndex] ? samples[activeIndex] : null;
  const activeX = active ? xFor(active.idx) : null;
  const activeY = active ? yFor(active.elevation) : null;

  return (
    <div className="w-full">
      <div
        ref={wrapperRef}
        className="relative w-full h-36 sm:h-40 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden select-none touch-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleLeave}
        onTouchStart={handleTouchMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleLeave}
        role="img"
        aria-label="Elevation profile"
      >
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${VBW} ${VBH}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="elevFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          <path d={areaPath} fill="url(#elevFill)" />
          <path d={linePath} fill="none" stroke="#60a5fa" strokeWidth="2" />

          {/* Current position indicator */}
          {activeX != null && activeY != null && (
            <>
              <line
                x1={activeX}
                y1={0}
                x2={activeX}
                y2={VBH}
                stroke="#f97316"
                strokeWidth="2"
                opacity="0.9"
              />
              <circle
                cx={activeX}
                cy={activeY}
                r="5"
                fill="#f97316"
                stroke="#111827"
                strokeWidth="2"
              />
            </>
          )}
        </svg>

        <div className="absolute left-2 top-2 text-[11px] text-gray-600 dark:text-gray-300">
          Hover or drag to inspect
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
        <span>
          {samples[0] ? `${samples[0].distance.toFixed(2)} mi` : "0.00 mi"}
        </span>
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
  const [loadState, setLoadState] = useState<"idle" | "loading" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!visible || !route?.storageUrl) {
      setCoords([]);
      setLoadState("idle");
      setHoverIndex(null);
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
        setHoverIndex(parsed.length ? parsed.length - 1 : null);
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
    [coords],
  );

  const selected = useMemo(() => {
    if (hoverIndex == null) return null;
    return coords[hoverIndex] ?? null;
  }, [coords, hoverIndex]);

  const markerPosition = useMemo(() => {
    if (!selected) return null;
    return [selected.lat, selected.lng] as [number, number];
  }, [selected]);

  const markerIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: `<div style="width:14px;height:14px;border-radius:9999px;background:#f97316;border:2px solid #111827;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      }),
    [],
  );

  const handleHover = useCallback((i: number | null) => setHoverIndex(i), []);

  const mapCenter = useMemo((): [number, number] => {
    if (coords.length > 0) {
      const mid = coords[Math.floor(coords.length / 2)];
      return [mid.lat, mid.lng];
    }
    return [0, 0];
  }, [coords]);

  const info = (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
      <div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Elevation
        </div>
        <div className="font-semibold text-gray-900 dark:text-gray-100">
          {selected ? `${Math.round(selected.elevation)} ft` : "—"}
        </div>
      </div>
      <div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Distance</div>
        <div className="font-semibold text-gray-900 dark:text-gray-100">
          {selected ? `${selected.distance.toFixed(2)} mi` : "—"}
        </div>
      </div>
      <div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Cumulative vert
        </div>
        <div className="font-semibold text-gray-900 dark:text-gray-100">
          {selected ? `${selected.cumulativeVert.toFixed(0)} ft` : "—"}
        </div>
      </div>
      <div className="col-span-2 sm:col-span-1">
        <div className="text-xs text-gray-500 dark:text-gray-400">Lat,Lng</div>
        <div className="font-semibold text-gray-900 dark:text-gray-100">
          {selected
            ? `${selected.lat.toFixed(5)},${selected.lng.toFixed(5)}`
            : "—"}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog
      header={route?.name ? `Route: ${route.name}` : "Route"}
      visible={visible}
      onHide={onHide}
      modal
      dismissableMask
      className="w-[95vw] max-w-5xl"
      contentClassName="p-0"
    >
      {loadState === "loading" && (
        <div className="p-6 text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <i className="pi pi-spin pi-spinner" />
          Loading route…
        </div>
      )}

      {loadState === "error" && (
        <div className="p-6 text-sm text-red-600 dark:text-red-400">
          <div className="flex items-center gap-2">
            <i className="pi pi-exclamation-triangle" />
            <span>Failed to load route: {errorMsg}</span>
          </div>
        </div>
      )}

      {loadState === "idle" && coords.length > 0 && (
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
          {/* Mobile friendly: keep data visible, compact */}
          <Card className="shadow-none border border-gray-200 dark:border-gray-700">
            {info}
          </Card>

          <Divider className="my-0" />

          {/* Map (no movement/centering on hover anymore) */}
          <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <MapContainer
              center={mapCenter}
              zoom={12}
              style={{ height: 260, width: "100%" }}
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              />
              <Polyline
                positions={polyline}
                pathOptions={{ color: "#60a5fa", weight: 3, opacity: 0.9 }}
              />
              <FitBounds positions={polyline} />
              {markerPosition && (
                <Marker position={markerPosition} icon={markerIcon} />
              )}
            </MapContainer>
          </div>

          {/* Elevation chart with indicator */}
          <Card className="shadow-none border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Elevation profile
            </div>
            <ElevationProfile
              samples={coords}
              activeIndex={hoverIndex}
              onHover={handleHover}
            />
          </Card>
        </div>
      )}
    </Dialog>
  );
}
