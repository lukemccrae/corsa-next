"use client";
import React, { useMemo } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useTheme } from "./ThemeProvider";
import type { SegmentActivity, Segment } from "../generated/schema";

type BurritoStatsCardsProps = {
  activities: SegmentActivity[];
  segments?: Segment[];
  isGlobalView?: boolean;
};

type UserStats = {
  userId: string;
  completions: number;
  totalTime: number;
  averageTime: number;
  fastestTime: number;
  activityTypes: Set<string>;
};

type SegmentStats = {
  segmentId: string;
  title: string;
  completions: number;
};

type ActivityTypeStats = {
  type: string;
  count: number;
  percentage: number;
};

/**
 * Stats Cards and Leaderboard
 * Displays key metrics:
 * - Top participants by segment completions
 * - Average/fastest completion times
 * - Most popular segments (global view) or attempt distribution (segment view)
 * - Activity type breakdown
 */
export default function BurritoStatsCards({
  activities,
  segments,
  isGlobalView = false,
}: BurritoStatsCardsProps) {
  const { theme } = useTheme();

  // Calculate user statistics
  const userStats = useMemo(() => {
    if (!activities || activities.length === 0) {
      return [];
    }

    const statsMap = new Map<string, UserStats>();

    activities.forEach((activity) => {
      const userId = activity.userId;
      if (!userId) return;

      const existing = statsMap.get(userId);
      const elapsedTime = activity.elapsedTime || 0;

      if (existing) {
        existing.completions += 1;
        existing.totalTime += elapsedTime;
        if (elapsedTime > 0) {
          existing.fastestTime = Math.min(existing.fastestTime, elapsedTime);
        }
        if (activity.activityType) {
          existing.activityTypes.add(activity.activityType);
        }
      } else {
        statsMap.set(userId, {
          userId,
          completions: 1,
          totalTime: elapsedTime,
          averageTime: elapsedTime,
          fastestTime: elapsedTime > 0 ? elapsedTime : Number.MAX_SAFE_INTEGER,
          activityTypes: new Set(
            activity.activityType ? [activity.activityType] : []
          ),
        });
      }
    });

    // Calculate averages and sort by completions
    return Array.from(statsMap.values())
      .map((stats) => ({
        ...stats,
        averageTime: stats.totalTime / stats.completions,
      }))
      .sort((a, b) => b.completions - a.completions);
  }, [activities]);

  // Calculate segment statistics (for global view)
  const segmentStats = useMemo(() => {
    if (!activities || !segments || !isGlobalView) {
      return [];
    }

    const statsMap = new Map<string, number>();

    activities.forEach((activity) => {
      const segmentId = activity.segmentId;
      if (!segmentId) return;

      statsMap.set(segmentId, (statsMap.get(segmentId) || 0) + 1);
    });

    // Match with segment titles and sort
    return Array.from(statsMap.entries())
      .map(([segmentId, completions]) => {
        const segment = segments.find((s) => s.segmentId === segmentId);
        return {
          segmentId,
          title: segment?.title || `Segment ${segmentId}`,
          completions,
        };
      })
      .sort((a, b) => b.completions - a.completions);
  }, [activities, segments, isGlobalView]);

  // Calculate activity type breakdown
  const activityTypeStats = useMemo(() => {
    if (!activities || activities.length === 0) {
      return [];
    }

    const typeMap = new Map<string, number>();

    activities.forEach((activity) => {
      if (!activity.activityType) return;
      const type = activity.activityType;
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });

    const total = activities.length;

    return Array.from(typeMap.entries())
      .map(([type, count]) => ({
        type,
        count,
        percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);
  }, [activities]);

  // Format time in seconds to readable format
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const cardBg =
    theme === "dark"
      ? "bg-gray-800 border-gray-700 text-gray-100"
      : "bg-white border-gray-200 text-gray-900";

  // Medal emoji for top performers
  const getMedal = (rank: number): string => {
    if (rank === 0) return "🥇";
    if (rank === 1) return "🥈";
    if (rank === 2) return "🥉";
    return "";
  };

  if (!activities || activities.length === 0) {
    return (
      <Card className={`${cardBg} border`}>
        <div className="text-center py-8">
          <i className="pi pi-chart-bar text-4xl text-gray-400 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            No statistics available
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Participants Leaderboard */}
      <Card className={`${cardBg} border`}>
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <i className="pi pi-trophy text-yellow-500" />
            Top Participants
          </h3>
          <DataTable
            value={userStats.slice(0, 10)}
            className="text-sm"
            stripedRows
            showGridlines
          >
            <Column
              field="rank"
              header="Rank"
              body={(_, options) => (
                <span className="text-lg">
                  {getMedal(options.rowIndex)}{" "}
                  {options.rowIndex + 1}
                </span>
              )}
              style={{ width: "80px" }}
            />
            <Column
              field="userId"
              header="User"
              body={(rowData) => (
                <span className="font-mono text-xs">{rowData.userId}</span>
              )}
            />
            <Column
              field="completions"
              header="Completions"
              sortable
              body={(rowData) => (
                <span className="font-bold text-green-600 dark:text-green-400">
                  {rowData.completions}
                </span>
              )}
            />
            <Column
              field="averageTime"
              header="Avg Time"
              sortable
              body={(rowData) => formatTime(rowData.averageTime)}
            />
            <Column
              field="fastestTime"
              header="Fastest"
              sortable
              body={(rowData) => (
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {formatTime(rowData.fastestTime)}
                </span>
              )}
            />
          </DataTable>
        </div>
      </Card>

      {/* Activity Type Breakdown */}
      <Card className={`${cardBg} border`}>
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <i className="pi pi-chart-pie text-purple-500" />
            Activity Type Breakdown
          </h3>
          <div className="space-y-3">
            {activityTypeStats.map((stat) => (
              <div key={stat.type} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold">{stat.type}</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {stat.count} ({stat.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Most Popular Segments (Global View Only) */}
      {isGlobalView && segmentStats.length > 0 && (
        <Card className={`${cardBg} border`}>
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <i className="pi pi-map-marker text-red-500" />
              Most Popular Segments
            </h3>
            <DataTable
              value={segmentStats.slice(0, 5)}
              className="text-sm"
              stripedRows
              showGridlines
            >
              <Column
                field="rank"
                header="#"
                body={(_, options) => options.rowIndex + 1}
                style={{ width: "50px" }}
              />
              <Column field="title" header="Segment" />
              <Column
                field="completions"
                header="Completions"
                sortable
                body={(rowData) => (
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {rowData.completions}
                  </span>
                )}
              />
            </DataTable>
          </div>
        </Card>
      )}

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`${cardBg} border`}>
          <div className="text-center">
            <i className="pi pi-users text-4xl text-blue-500 mb-2" />
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {userStats.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Participants
            </div>
          </div>
        </Card>

        <Card className={`${cardBg} border`}>
          <div className="text-center">
            <i className="pi pi-clock text-4xl text-green-500 mb-2" />
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatTime(
                userStats.reduce((sum, u) => sum + u.averageTime, 0) /
                  (userStats.length || 1)
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Overall Avg Time
            </div>
          </div>
        </Card>

        <Card className={`${cardBg} border`}>
          <div className="text-center">
            <i className="pi pi-bolt text-4xl text-yellow-500 mb-2" />
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {(() => {
                const validTimes = userStats
                  .map((u) => u.fastestTime)
                  .filter((t) => t < Number.MAX_SAFE_INTEGER);
                return validTimes.length > 0
                  ? formatTime(Math.min(...validTimes))
                  : "N/A";
              })()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Fastest Time Overall
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
