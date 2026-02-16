"use client";
import React, { useMemo, useState } from "react";
import { Card } from "primereact/card";
import { SelectButton } from "primereact/selectbutton";
import { useTheme } from "./ThemeProvider";
import type { Waypoint, UnitOfMeasure } from "../generated/schema";

// Color gradient stops for activity intensity
const COLOR_STOPS = [
  { pct: 0.01, color: [166, 217, 235] }, // Blue (rest)
  { pct: 0.43, color: [105, 205, 97] }, // Green
  { pct: 0.5, color: [255, 255, 0] }, // Yellow
  { pct: 0.76, color: [255, 127, 0] }, // Orange
  { pct: 1.0, color: [255, 0, 0] }, // Red (max)
];

/**
 * Returns a color for activity intensity where 0 = blue (rest), max = red (max exertion).
 */
function getColor(val: number, max = 4): string {
  const percent = Math.max(0, Math.min(1, val / max));

  let lower = COLOR_STOPS[0];
  let upper = COLOR_STOPS[COLOR_STOPS.length - 1];

  for (let i = 1; i < COLOR_STOPS.length; i++) {
    if (percent < COLOR_STOPS[i].pct) {
      lower = COLOR_STOPS[i - 1];
      upper = COLOR_STOPS[i];
      break;
    }
  }

  const range = upper.pct - lower.pct;
  const rangePct = range === 0 ? 0 : (percent - lower.pct) / range;

  const r = Math.round(
    lower.color[0] + (upper.color[0] - lower.color[0]) * rangePct
  );
  const g = Math.round(
    lower.color[1] + (upper.color[1] - lower.color[1]) * rangePct
  );
  const b = Math.round(
    lower.color[2] + (upper.color[2] - lower.color[2]) * rangePct
  );

  return `rgb(${r},${g},${b})`;
}

function ColorRampKey() {
  const gradient = `linear-gradient(to right, ${COLOR_STOPS.map(
    (stop) =>
      `rgb(${stop.color[0]},${stop.color[1]},${stop.color[2]}) ${Math.round(
        stop.pct * 100
      )}%`
  ).join(", ")})`;

  return (
    <div className="w-40 mx-auto mt-4 text-center">
      <div
        className="h-4 rounded-lg border border-gray-300 dark:border-gray-600"
        style={{ background: gradient }}
      />
      <div className="flex justify-between text-xs mt-1 text-gray-700 dark:text-gray-300">
        <span>Rest</span>
        <span className="text-red-600 dark:text-red-400">Max</span>
      </div>
    </div>
  );
}

type HourlyData = Waypoint[][];
type DailyData = HourlyData[];

/**
 * Groups waypoints by day and hour in the given timezone
 */
const pointsPerDay = (points: Waypoint[], timezone: string): DailyData => {
  if (points.length === 0) return [];

  const sorted = [...points].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const getLocalHour = (ts: string) =>
    Number(
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone: timezone,
      }).format(new Date(ts))
    );

  const firstTs = new Date(sorted[0].timestamp).getTime();
  const firstHour = getLocalHour(sorted[0].timestamp);

  const days: DailyData = [];
  days.push(Array.from({ length: 24 }, () => []));

  for (const point of sorted) {
    const ts = new Date(point.timestamp).getTime();
    const localHour = getLocalHour(point.timestamp);

    const hoursSinceFirst = Math.floor((ts - firstTs) / (1000 * 60 * 60));
    const dayIndex = Math.floor(hoursSinceFirst / 24);
    const hourIndex = (localHour - firstHour + 24) % 24;

    while (days.length <= dayIndex) {
      days.push(Array.from({ length: 24 }, () => []));
    }

    days[dayIndex][hourIndex].push(point);
  }

  return days;
};

type HeatmapTableProps = {
  values: Waypoint[][][];
  selected: number[] | null;
  setSelectedCell: (val: number[] | null) => void;
  startingHour: number;
  unitOfMeasure: UnitOfMeasure;
};

function HeatmapTable({
  values,
  selected,
  setSelectedCell,
  startingHour,
  unitOfMeasure,
}: HeatmapTableProps) {
  const { theme } = useTheme();
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    text: "",
  });

  const hourLabels = Array.from({ length: 24 }, (_, i) => {
    const h = (startingHour + i) % 24;
    return `${h === 0 ? 12 : h > 12 ? h - 12 : h}${h < 12 ? "am" : "pm"}`;
  });

  function returnDistanceBasedOnUOM(miles: number, uom: UnitOfMeasure): string {
    return uom === "IMPERIAL"
      ? `${miles.toFixed(2)} miles`
      : `${(miles * 1.60934).toFixed(2)} km`;
  }

  let prevMileAcrossDays: number | null = null;

const milesByHour = values.map((day) => {
  const hours: number[] = Array(24).fill(0);
  let prevMileInDay: number | null = prevMileAcrossDays;

  day.forEach((hourPoints, hi) => {
    hourPoints.forEach((point) => {
      if (point.mileMarker == null) return;

      const currMile = Number(point.mileMarker);

      if (prevMileInDay !== null) {
        const delta = currMile - prevMileInDay;
        if (delta >= 0 && delta < 10) {
          hours[hi] += delta;   // ✅ correct hour
        }
      }

      prevMileInDay = currMile;
      prevMileAcrossDays = currMile;
    });
  });

  return hours;
});

  function handleMouseEnter(e: React.MouseEvent, di: number, hi: number) {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.right + window.scrollX + 10,
      y: rect.top + window.scrollY,
      text: returnDistanceBasedOnUOM(milesByHour[di][hi], unitOfMeasure),
    });
  }

  function handleMouseLeave() {
    setTooltip((t) => ({ ...t, visible: false }));
  }

  function handleCellClick(points: Waypoint[]) {
    const pointTimestamps = points.map((point) =>
      new Date(point.timestamp).getTime()
    );
    setSelectedCell(pointTimestamps);
  }

  const cellBorder = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const stickyBg = theme === "dark" ? "bg-gray-800" : "bg-white";
  const stickyLabelClass = `sticky left-0 z-10 ${stickyBg} text-right font-bold text-xs pr-2 text-gray-700 dark:text-gray-300 min-w-[60px]`;

  return (
    <div className="flex flex-col items-start w-full">
      {tooltip.visible && (
        <div
          className="absolute bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded text-xs pointer-events-none whitespace-nowrap z-50"
          style={{
            top: tooltip.y,
            left: tooltip.x,
          }}
        >
          {tooltip.text}
        </div>
      )}

      <div className="overflow-x-auto w-full">
        <table className="border-collapse">
          <tbody>
            {Array.from({ length: 24 }, (_, hi) => (
              <tr key={hi} className="h-12">
                <td className={stickyLabelClass}>
                  {hourLabels[hi]}
                </td>
                {values.map((day, di) => {
                  let isSelected = false;
                  if (day[hi].length > 0 && selected) {
                    isSelected = selected?.includes(
                      new Date(day[hi][0].timestamp).getTime()
                    );
                  }
                  return (
                    <td
                      key={di}
                      className="w-16 h-12 p-1"
                    >
                      <div
                        className={`w-full h-full rounded cursor-pointer border transition-all ${cellBorder} ${
                          isSelected ? "ring-2 ring-blue-500" : ""
                        }`}
                        style={{
                          backgroundColor: getColor(milesByHour[di][hi]),
                        }}
                        onMouseEnter={(e) => handleMouseEnter(e, di, hi)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleCellClick(values[di][hi])}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="h-8">
              <th className={stickyLabelClass}>
                Day
              </th>
              {values.map((_, d) => (
                <th
                  key={d}
                  className="w-16 font-bold text-xs text-gray-700 dark:text-gray-300"
                >
                  {d + 1}
                </th>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="w-full">
        <ColorRampKey />
      </div>
    </div>
  );
}

type ActivityChartsProps = {
  points: Waypoint[];
  timezone: string;
  unitOfMeasure: UnitOfMeasure;
  selectedCell: number[] | null;
  setSelectedCell: (cell: number[] | null) => void;
  startTime: string;
};

export default function ActivityHeatmap({
  timezone,
  points,
  selectedCell,
  setSelectedCell,
  unitOfMeasure,
  startTime,
}: ActivityChartsProps) {
  const { theme } = useTheme();
  const [chart, setChart] = useState<"heatmap">("heatmap");

  const values: HourlyData[] = useMemo(
    () => pointsPerDay(points, timezone),
    [points, timezone]
  );

  const startingHour = useMemo(() => {
    return Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "numeric",
        hour12: false,
      }).format(new Date(startTime))
    );
  }, [timezone, startTime]);

  if (!points[0]?.timestamp) return null;

  const cardBg =
    theme === "dark"
      ? "bg-gray-800 border-gray-700 text-gray-100"
      : "bg-white border-gray-200 text-gray-900";

  return (
    <Card className={`${cardBg} border`}>
      <HeatmapTable
        startingHour={startingHour}
        values={values}
        selected={selectedCell}
        setSelectedCell={setSelectedCell}
        unitOfMeasure={unitOfMeasure}
      />
    </Card>
  );
}
