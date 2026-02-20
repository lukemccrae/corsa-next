"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useUser } from "@/src/context/UserContext";
import RouteUploadModal from "@/src/components/RouteUploadModal";
import { Route } from "@/src/generated/schema";
import dynamic from "next/dynamic";

const RouteMapPanel = dynamic(
  () => import("@/src/components/RouteMapPanel"),
  { ssr: false },
);

const APPSYNC_ENDPOINT =
  "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";
const S3_BASE = "https://corsa-geojson-bucket.s3.us-west-1.amazonaws.com/";

function fmtDistance(miles: number, uom?: string) {
  return uom === "METRIC"
    ? `${(miles * 1.60934).toFixed(2)} km`
    : `${miles.toFixed(2)} mi`;
}

function fmtGain(feet: number, uom?: string) {
  return uom === "METRIC"
    ? `${(feet * 0.3048).toFixed(0)} m`
    : `${feet.toFixed(0)} ft`;
}

type RouteWithId = Route & { id: string };

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
    const touch = e.touches?.[0];
    if (!touch) return;
    setFromClientX(touch.clientX);
  };
  const handleLeave = () => onHover(null);

  const active =
    activeIndex != null && samples[activeIndex] ? samples[activeIndex] : null;
  const activeX = active != null ? xFor(active.idx) : null;
  const activeY = active != null ? yFor(active.elevation) : null;

  const tooltipLeftPct =
    activeX != null ? Math.max(5, Math.min(95, (activeX / VBW) * 100)) : 0;
  const tooltipAbove = activeY != null && activeY > VBH * 0.35;

  return (
    <div className="w-full">
      <div
        ref={wrapperRef}
        className="relative w-full h-32 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 select-none touch-none cursor-crosshair"
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
            <linearGradient id="epFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#epFill)" />
          <path d={linePath} fill="none" stroke="#60a5fa" strokeWidth="2" />
          {activeX != null && activeY != null && (
            <>
              <line
                x1={activeX}
                y1={0}
                x2={activeX}
                y2={VBH}
                stroke="#f97316"
                strokeWidth="1.5"
                opacity="0.9"
              />
              <line
                x1={0}
                y1={activeY}
                x2={VBW}
                y2={activeY}
                stroke="#f97316"
                strokeWidth="1"
                strokeDasharray="6,4"
                opacity="0.7"
              />
              <circle
                cx={activeX}
                cy={activeY}
                r="5"
                fill="#f97316"
                stroke="#fff"
                strokeWidth="2"
              />
            </>
          )}
        </svg>

        {active && activeX != null && (
          <div
            className="absolute z-10 pointer-events-none"
            style={{
              left: `${tooltipLeftPct}%`,
              top: tooltipAbove ? undefined : "8px",
              bottom: tooltipAbove ? "8px" : undefined,
              transform: "translateX(-50%)",
            }}
          >
            <div className="bg-gray-900/90 text-white text-xs rounded px-2 py-1 shadow whitespace-nowrap">
              {active.distance.toFixed(2)} mi · {Math.round(active.elevation)} ft
            </div>
          </div>
        )}
      </div>

      <div className="mt-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
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

export default function RoutesPage() {
  const { user } = useUser();
  const toast = useRef<Toast>(null);

  const [routes, setRoutes] = useState<RouteWithId[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteWithId | null>(null);

  const [coords, setCoords] = useState<Coord[]>([]);
  const [loadingCoords, setLoadingCoords] = useState(false);
  const [coordsError, setCoordsError] = useState("");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (user?.preferred_username) fetchRoutes();
  }, [user?.preferred_username]);

  const fetchRoutes = async () => {
    setLoadingRoutes(true);
    try {
      const query = `
        query GetUserRoutes {
          getUserByUserName(username: "${user?.preferred_username}") {
            routes {
              storageUrl
              overlayUrl
              createdAt
              distanceInMiles
              gainInFeet
              name
              uom
            }
          }
        }
      `;
      const response = await fetch(APPSYNC_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": APPSYNC_API_KEY,
        },
        body: JSON.stringify({ query }),
      });
      const { data } = await response.json();
      const fetched: RouteWithId[] = data?.getUserByUserName?.routes || [];
      setRoutes(fetched);
      setSelectedRoute((prev) => prev ?? (fetched.length > 0 ? fetched[0] : null));
    } catch (error) {
      console.error("Error fetching routes:", error);
      toast.current?.show({
        severity: "error",
        summary: "Failed to load routes",
        detail: "Could not fetch your routes. Please try again.",
        life: 5000,
      });
    } finally {
      setLoadingRoutes(false);
    }
  };

  useEffect(() => {
    if (!selectedRoute?.storageUrl) {
      setCoords([]);
      setCoordsError("");
      return;
    }
    let cancelled = false;
    setLoadingCoords(true);
    setCoordsError("");
    setHoverIndex(null);

    fetch(`${S3_BASE}${selectedRoute.storageUrl}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (cancelled) return;
        setCoords(parseGeoJson(json));
        setLoadingCoords(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setCoordsError(err instanceof Error ? err.message : String(err));
        setLoadingCoords(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedRoute?.storageUrl]);

  const handleUploadSuccess = (routeId: string) => {
    toast.current?.show({
      severity: "success",
      summary: "Route Uploaded",
      detail: `Route ${routeId} uploaded successfully`,
      life: 3000,
    });
    fetchRoutes();
  };

  const handleHover = useCallback((i: number | null) => setHoverIndex(i), []);

  const polyline = useMemo(
    () => coords.map((p) => [p.lat, p.lng] as [number, number]),
    [coords],
  );

  const hoverCoord = hoverIndex != null ? (coords[hoverIndex] ?? null) : null;

  const stats = useMemo(() => {
    if (!selectedRoute) return null;
    const { uom, distanceInMiles, gainInFeet } = selectedRoute;
    const elevs = coords.map((c) => c.elevation);
    const minElevFt = elevs.length > 0 ? Math.min(...elevs) : null;
    const maxElevFt = elevs.length > 0 ? Math.max(...elevs) : null;
    return {
      distance: fmtDistance(distanceInMiles ?? 0, uom),
      gain: fmtGain(gainInFeet ?? 0, uom),
      minElev:
        minElevFt != null ? fmtGain(minElevFt, uom) : null,
      maxElev:
        maxElevFt != null ? fmtGain(maxElevFt, uom) : null,
    };
  }, [selectedRoute, coords]);

  return (
    <>
      <Toast ref={toast} />
      <RouteUploadModal
        visible={uploadModalVisible}
        onHide={() => setUploadModalVisible(false)}
        onSuccess={handleUploadSuccess}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-80 flex-none flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
            {selectedRoute ? (
              <button
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                onClick={() => setSelectedRoute(null)}
                aria-label="Back to route list"
              >
                <i className="pi pi-arrow-left text-xs" />
                <span>Routes</span>
              </button>
            ) : (
              <h2 className="text-base font-semibold">My Routes</h2>
            )}
            <Button
              icon="pi pi-upload"
              rounded
              text
              size="small"
              aria-label="Upload route"
              onClick={() => setUploadModalVisible(true)}
              disabled={!user}
              tooltip="Upload route"
              tooltipOptions={{ position: "left" }}
            />
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {!selectedRoute ? (
              loadingRoutes ? (
                <div className="p-4 text-sm text-gray-500 flex items-center gap-2">
                  <i className="pi pi-spin pi-spinner" />
                  <span>Loading…</span>
                </div>
              ) : routes.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">
                  <i className="pi pi-map text-3xl block mb-2" />
                  <p>No routes yet.</p>
                  <p className="mt-1">Upload your first route!</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {routes.map((r, i) => (
                    <li key={r.storageUrl ?? i}>
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                        onClick={() => setSelectedRoute(r)}
                        aria-label={`View route ${r.name}`}
                      >
                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                          {r.name}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            {fmtDistance(r.distanceInMiles ?? 0, r.uom)}
                          </span>
                          <span>↑ {fmtGain(r.gainInFeet ?? 0, r.uom)}</span>
                          <span>
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <div className="p-4 space-y-4">
                {/* Name + date */}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug">
                    {selectedRoute.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {new Date(selectedRoute.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Stats grid */}
                {stats && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Distance
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                        {stats.distance}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Ascent
                      </div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                        {stats.gain}
                      </div>
                    </div>
                    {stats.minElev && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Min Elev
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                          {stats.minElev}
                        </div>
                      </div>
                    )}
                    {stats.maxElev && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Max Elev
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                          {stats.maxElev}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Loading / error / elevation profile */}
                {loadingCoords && (
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <i className="pi pi-spin pi-spinner" />
                    <span>Loading route data…</span>
                  </div>
                )}
                {coordsError && (
                  <div className="text-sm text-red-500 flex items-center gap-1">
                    <i className="pi pi-exclamation-triangle" />
                    <span>{coordsError}</span>
                  </div>
                )}
                {coords.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Elevation Profile
                    </div>
                    <ElevationProfile
                      samples={coords}
                      activeIndex={hoverIndex}
                      onHover={handleHover}
                    />
                    {hoverCoord && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex gap-4">
                        <span>{hoverCoord.distance.toFixed(2)} mi</span>
                        <span>{Math.round(hoverCoord.elevation)} ft</span>
                        <span>↑ {hoverCoord.cumulativeVert.toFixed(0)} ft</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right panel: full-height map */}
        <div className="flex-1 relative overflow-hidden">
          <RouteMapPanel
            polyline={polyline}
            hoverCoord={
              hoverCoord
                ? {
                    lat: hoverCoord.lat,
                    lng: hoverCoord.lng,
                    elevation: hoverCoord.elevation,
                    distance: hoverCoord.distance,
                  }
                : null
            }
          />
          {!selectedRoute && !loadingRoutes && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl px-6 py-4 text-center shadow-lg">
                <i className="pi pi-map text-4xl text-gray-400 block mb-2" />
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Select a route to view it on the map
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
