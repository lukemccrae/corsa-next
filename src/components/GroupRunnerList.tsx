"use client";
import React from "react";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { useTheme } from "./ThemeProvider";
import { useRouter } from "next/navigation";

type Runner = {
  username:  string;
  profilePicture?: string;
  streamId:  string;
  title?: string;
  startTime?:  string;
  finishTime?:  string;
  mileMarker?: number;
  live?: boolean;
  unitOfMeasure?: string;
  waypoints: Array<{
    timestamp: string;
    cumulativeVert?: number | string;
  }>;
};

type Props = {
  runners: Runner[];
};

const timeAgo = (iso?:  string) => {
  if (!iso) return "—";
  const d = new Date(iso).getTime();
  const now = Date.now();
  const s = Math.max(1, Math.round((now - d) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const formatElapsed = (start?:  string, finish?: string) => {
  if (!start) return "—";
  const startMs = new Date(Number(start)).getTime();
  const endMs = finish ? new Date(Number(finish)).getTime() : Date.now();
  const diffSec = Math.floor((endMs - startMs) / 1000);
  const h = Math.floor(diffSec / 3600);
  const m = Math.floor((diffSec % 3600) / 60);
  const s = diffSec % 60;
  return `${h}h ${m}m ${s}s`;
};

export default function GroupRunnersList({ runners }: Props) {
  const { theme } = useTheme();
  const router = useRouter();

  const cardBg = theme === "dark" ?  "bg-gray-800 text-gray-100" : "bg-white text-gray-900";
  const hoverBg = theme === "dark" ? "hover:bg-gray-700" :  "hover:bg-gray-50";

  if (! runners || runners.length === 0) {
    return <div className="text-center py-8 text-gray-500">No participants yet</div>;
  }

  return (
    <div className="space-y-3">
      {runners.map((runner) => {
        const lastPoint = runner.waypoints[runner. waypoints.length - 1];
        const vert = lastPoint?. cumulativeVert
          ? `${Number(lastPoint.cumulativeVert).toLocaleString()} ft`
          : "—";

        return (
          <div
            key={runner.streamId}
            className={`${cardBg} ${hoverBg} rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer`}
            onClick={() => router.push(`/live/${runner.username}/${runner.streamId}`)}
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <Avatar
                image={runner.profilePicture || undefined}
                label={!runner.profilePicture ? runner.username?.charAt(0).toUpperCase() : undefined}
                size="large"
                shape="circle"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg truncate">{runner.username}</h3>
                  {runner.live && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                      <i className="pi pi-circle-fill" style={{ fontSize: "0.5rem" }} />
                      LIVE
                    </span>
                  )}
                </div>

                {runner.title && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{runner.title}</p>}

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Distance</div>
                    <div className="font-semibold">
                      {runner.mileMarker?.toFixed(2) || "0.00"}{" "}
                      {runner. unitOfMeasure === "METRIC" ? "km" : "mi"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Elevation</div>
                    <div className="font-semibold">{vert}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Elapsed</div>
                    <div className="font-semibold">
                      {formatElapsed(runner.startTime, runner.finishTime)}
                    </div>
                  </div>
                </div>

                {/* Last update */}
                {lastPoint?. timestamp && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Last update: {timeAgo(lastPoint.timestamp)}
                  </div>
                )}
              </div>

              {/* View button */}
              <Button
                icon="pi pi-arrow-right"
                rounded
                text
                aria-label="View details"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/live/${runner.username}/${runner. streamId}`);
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}