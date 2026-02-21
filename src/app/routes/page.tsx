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

const RouteMapPanel = dynamic(() => import("@/src/components/RouteMapPanel"), {
  ssr: false,
});

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
        className="relative w-full"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseLeave={handleLeave}
        onTouchEnd={handleLeave}
        style={{ touchAction: "none" }}
      >
        <svg
          viewBox={`0 0 ${VBW} ${VBH}`}
          preserveAspectRatio="none"
          className="w-full h-24 block"
        >
          <rect x="0" y="0" width={VBW} height={VBH} fill="transparent" />
          <path d={areaPath} fill="rgba(59,130,246,0.18)" stroke="none" />
          <path
            d={linePath}
            fill="none"
            stroke="rgba(59,130,246,0.9)"
            strokeWidth="2"
          />
          {activeX != null && activeY != null && (
            <>
              <line
                x1={activeX}
                y1={0}
                x2={activeX}
                y2={VBH}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1"
              />
              <circle
                cx={activeX}
                cy={activeY}
                r="4"
                fill="rgba(59,130,246,1)"
              />
            </>
          )}
        </svg>

        {active && activeX != null && (
          <div
            className={[
              "absolute z-10 px-2 py-1 rounded text-[11px] leading-tight",
              "bg-gray-900 text-white shadow",
              tooltipAbove ? "bottom-2" : "top-2",
            ].join(" ")}
            style={{ left: `${tooltipLeftPct}%`, transform: "translateX(-50%)" }}
          >
            {active.distance.toFixed(2)} mi · {Math.round(active.elevation)} ft
          </div>
        )}
      </div>

      <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-1">
        <div>{samples[0] ? `${samples[0].distance.toFixed(2)} mi` : "0.00 mi"}</div>
        <div>
          {samples[Math.floor(n / 2)]
            ? `${samples[Math.floor(n / 2)].distance.toFixed(2)} mi`
            : ""}
        </div>
        <div>
          {samples[n - 1]
            ? `${samples[n - 1].distance.toFixed(2)} mi`
            : ""}
        </div>
      </div>
    </div>
  );
}

export default function RoutesPage() {
  const { user } = useUser();
  const toast = useRef<any>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      minElev: minElevFt != null ? fmtGain(minElevFt, uom) : null,
      maxElev: maxElevFt != null ? fmtGain(maxElevFt, uom) : null,
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

      {/* IMPORTANT: prevent page scrolling; never exceed viewport height */}
      <div className="h-[100vh] overflow-hidden">
        <div className="h-full flex flex-col md:flex-row">
          {/* Left sidebar (desktop) / mobile route panel */}
          <div className="w-full md:w-[420px] md:border-r border-gray-200 dark:border-gray-800 flex flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 md:px-4 md:py-3 border-b border-gray-200 dark:border-gray-800">
              {selectedRoute ? (
                <button
                  className="text-sm font-semibold"
                  onClick={() => setSelectedRoute(null)}
                  aria-label="Back to route list"
                >
                  <i className="pi pi-chevron-left mr-2" />
                  Routes
                </button>
              ) : (
                <h2 className="text-sm md:text-base font-semibold">My Routes</h2>
              )}

              <Button
                icon="pi pi-upload"
                onClick={() => setUploadModalVisible(true)}
                disabled={!user}
                tooltip="Upload route"
                tooltipOptions={{ position: "left" }}
                size="small"
              />
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {!selectedRoute ? (
                <div className="h-full overflow-hidden px-3 py-2 md:px-4 md:py-4">
                  {loadingRoutes ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <i className="pi pi-spin pi-spinner mr-2" />
                      Loading…
                    </div>
                  ) : routes.length === 0 ? (
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <i className="pi pi-map mr-2" />
                      <p className="mt-1">No routes yet.</p>
                      <p>Upload your first route!</p>
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      {routes.map((r) => (
                        <li key={`${r.storageUrl}-${r.createdAt}`}>
                          <button
                            className="w-full text-left rounded-md px-2 py-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                            onClick={() => setSelectedRoute(r)}
                            aria-label={`View route ${r.name}`}
                          >
                            <div className="font-medium text-sm">{r.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-2">
                              <span>{fmtDistance(r.distanceInMiles ?? 0, r.uom)}</span>
                              <span>↑ {fmtGain(r.gainInFeet ?? 0, r.uom)}</span>
                              <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop details panel (UNCHANGED STRUCTURE), but now with safe overflow handling */}
                  <div className="hidden md:block h-full overflow-hidden px-4 py-4">
                    {/* Name + date */}
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold">{selectedRoute.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(selectedRoute.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Stats grid */}
                    {stats && (
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="rounded-md border border-gray-200 dark:border-gray-800 p-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Distance
                          </div>
                          <div className="font-semibold">{stats.distance}</div>
                        </div>
                        <div className="rounded-md border border-gray-200 dark:border-gray-800 p-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Ascent
                          </div>
                          <div className="font-semibold">{stats.gain}</div>
                        </div>
                        {stats.minElev && (
                          <div className="rounded-md border border-gray-200 dark:border-gray-800 p-3">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Min Elev
                            </div>
                            <div className="font-semibold">{stats.minElev}</div>
                          </div>
                        )}
                        {stats.maxElev && (
                          <div className="rounded-md border border-gray-200 dark:border-gray-800 p-3">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Max Elev
                            </div>
                            <div className="font-semibold">{stats.maxElev}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Loading / error / elevation profile */}
                    {loadingCoords && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <i className="pi pi-spin pi-spinner mr-2" />
                        Loading route data…
                      </div>
                    )}
                    {coordsError && (
                      <div className="text-sm text-red-500">
                        <i className="pi pi-exclamation-triangle mr-2" />
                        {coordsError}
                      </div>
                    )}
                    {coords.length > 0 && (
                      <div>
                        <div className="text-sm font-semibold mb-2">
                          Elevation Profile
                        </div>
                        {hoverCoord && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            {hoverCoord.distance.toFixed(2)} mi ·{" "}
                            {Math.round(hoverCoord.elevation)} ft · ↑{" "}
                            {hoverCoord.cumulativeVert.toFixed(0)} ft
                          </div>
                        )}
                        <ElevationProfile
                          samples={coords}
                          activeIndex={hoverIndex}
                          onHover={handleHover}
                        />
                      </div>
                    )}
                  </div>

                  {/* MOBILE panel: Map (top) + small route data + elevation (bottom). No page scroll. */}
                  <div className="md:hidden h-full flex flex-col min-h-0 overflow-hidden">
                    {/* MAP ON TOP (mobile only) */}
                    <div className="h-[46vh] min-h-0">
                      <RouteMapPanel polyline={polyline} hoverCoord={hoverCoord} />
                    </div>

                    {/* Small route data */}
                    <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {selectedRoute.name}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">
                            {new Date(selectedRoute.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {stats ? (
                          <div className="text-right text-[11px] leading-tight text-gray-600 dark:text-gray-300 shrink-0">
                            <div>{stats.distance}</div>
                            <div>↑ {stats.gain}</div>
                          </div>
                        ) : null}
                      </div>

                      {hoverCoord && (
                        <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                          {hoverCoord.distance.toFixed(2)} mi ·{" "}
                          {Math.round(hoverCoord.elevation)} ft · ↑{" "}
                          {hoverCoord.cumulativeVert.toFixed(0)} ft
                        </div>
                      )}

                      {loadingCoords && (
                        <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                          <i className="pi pi-spin pi-spinner mr-2" />
                          Loading…
                        </div>
                      )}
                      {coordsError && (
                        <div className="mt-1 text-[11px] text-red-500">
                          <i className="pi pi-exclamation-triangle mr-2" />
                          {coordsError}
                        </div>
                      )}
                    </div>

                    {/* ELEVATION AT BOTTOM (mobile only) */}
                    <div className="flex-1 min-h-0 px-3 py-2 overflow-hidden">
                      {coords.length > 0 ? (
                        <>
                          <div className="text-xs font-semibold mb-1">
                            Elevation
                          </div>
                          <ElevationProfile
                            samples={coords}
                            activeIndex={hoverIndex}
                            onHover={handleHover}
                          />
                        </>
                      ) : (
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          No elevation data yet.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right panel: full-height map (desktop only) */}
          <div className="hidden md:block flex-1 min-h-0">
            <div className="h-full">
              <RouteMapPanel polyline={polyline} hoverCoord={hoverCoord} />
            </div>
          </div>

          {/* Mobile when NO selectedRoute: keep the existing behavior (list only). */}
        </div>
      </div>
    </>
  );
}