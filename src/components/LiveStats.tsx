"use client";
import React, { useMemo } from "react";
import { Button } from "primereact/button";
import { useTheme } from "./ThemeProvider";
import { Point } from "./LiveMap";

type Props = {
  points: Point[];
  selectedIndex?: number | null;
  className?: string;
  onDownloadGpx?: () => void;
};

/**
 * LiveStatsCompact
 *
 * Very small horizontal stats card meant to sit above the map container.
 * - Minimal footprint on small screens (collapses into two rows)
 * - Matches app theme using tailwind + ThemeProvider
 * - Uses PrimeReact Button for any actions (download GPX)
 */
export default function LiveStats({
  points,
  selectedIndex,
  className = "",
  onDownloadGpx,
}: Props) {
  const { theme } = useTheme();

  const totalMiles = useMemo(() => {
    if (!points || points.length === 0) return 0;
    const last = points[points.length - 1];
    return typeof last.mileMarker === "number" ? last.mileMarker : Number(((points.length - 1) * 0.5).toFixed(2));
  }, [points]);

  const elapsed = useMemo(() => {
    if (!points || points.length < 2) return "0m";
    const start = points[0].timestamp;
    const end = points[points.length - 1].timestamp;
    const seconds = Math.max(0, Math.floor((end - start) / 1000));
    const mins = Math.floor(seconds / 60);
    if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
    return `${mins}m`;
  }, [points]);

  const lastAltitude = useMemo(() => {
    if (!points || points.length === 0) return "—";
    const last = points[points.length - 1].altitude;
    return last ?? "—";
  }, [points]);

  const selectedSummary = useMemo(() => {
    if (typeof selectedIndex !== "number" || !points[selectedIndex]) return null;
    const p = points[selectedIndex];
    return {
      mile: p.mileMarker ?? "—",
      time: new Date(p.timestamp).toLocaleTimeString(),
    };
  }, [points, selectedIndex]);

  const bg = theme === "dark" ? "bg-gray-800/80 text-gray-100" : "bg-white/90 text-gray-900";
  const border = theme === "dark" ? "border border-white/6" : "border border-gray-200";

  return (
    <div
      className={`w-full ${className} ${bg} ${border} rounded-xl p-2 shadow-sm flex flex-col sm:flex-row items-center gap-2`}
      aria-live="polite"
    >
      <div className="flex-1 w-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-400">Distance</div>
          <div className="text-sm font-semibold">{totalMiles.toFixed(2)} mi</div>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <div className="text-xs text-gray-400">Elapsed</div>
          <div className="text-sm font-semibold">{elapsed}</div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="text-xs text-gray-400">Elevation</div>
          <div className="text-sm font-semibold">{lastAltitude} ft</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-400 hidden sm:block">Points</div>
          <div className="text-sm font-semibold">{points.length}</div>
        </div>
      </div>

      {/* Selected point compact */}
      {selectedSummary ? (
        <div className="flex-shrink-0 px-3 py-1 rounded-md bg-gray-100/60 dark:bg-white/6 text-xs">
          <div className="font-medium">Selected</div>
          <div className="text-xs text-gray-500 dark:text-gray-300">
            Mile {selectedSummary.mile} • {selectedSummary.time}
          </div>
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex-shrink-0">
        {onDownloadGpx ? (
          <Button
            icon="pi pi-download"
            className="p-button-text"
            onClick={onDownloadGpx}
            aria-label="Download GPX"
          />
        ) : null}
      </div>
    </div>
  );
}