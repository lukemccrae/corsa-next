"use client";
import React, { useMemo } from "react";
import { Card } from "primereact/card";
import { useTheme } from "./ThemeProvider";
import type { SegmentActivity } from "../generated/schema";

type BurritoActivityTimelineProps = {
  activities: SegmentActivity[];
  title?: string;
};

/**
 * Activity Timeline Heatmap
 * Shows activity completions over time (daily breakdown for January 2026)
 * For global view: Aggregates all activities across all segments
 * For segment view: Shows activities for that specific segment
 */
export default function BurritoActivityTimeline({
  activities,
  title = "Activity Timeline",
}: BurritoActivityTimelineProps) {
  const { theme } = useTheme();

  // Process activities and group by day
  const dailyActivities = useMemo(() => {
    if (!activities || activities.length === 0) {
      return [];
    }

    // Group activities by day (using startDateLocal)
    const activityMap = new Map<string, number>();

    activities.forEach((activity) => {
      if (!activity.startDateLocal) return;

      // Extract date (YYYY-MM-DD) from timestamp
      const date = new Date(activity.startDateLocal);
      const dateKey = date.toISOString().split("T")[0];

      activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
    });

    // Convert to array and sort by date
    return Array.from(activityMap.entries())
      .map(([date, count]) => ({
        date,
        count,
        dateObj: new Date(date),
      }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [activities]);

  // Calculate max count for color scaling
  const maxCount = useMemo(() => {
    return Math.max(...dailyActivities.map((d) => d.count), 1);
  }, [dailyActivities]);

  // Calculate average per day
  const avgPerDay = useMemo(() => {
    if (dailyActivities.length === 0 || activities.length === 0) {
      return 0;
    }
    return Math.round(activities.length / dailyActivities.length);
  }, [activities.length, dailyActivities.length]);

  // Get color based on activity count
  const getColor = (count: number): string => {
    if (count === 0) {
      return theme === "dark" ? "bg-gray-700" : "bg-gray-100";
    }

    const intensity = count / maxCount;

    if (intensity < 0.25) {
      return theme === "dark" ? "bg-green-900" : "bg-green-100";
    } else if (intensity < 0.5) {
      return theme === "dark" ? "bg-green-700" : "bg-green-300";
    } else if (intensity < 0.75) {
      return theme === "dark" ? "bg-orange-700" : "bg-orange-300";
    } else {
      return theme === "dark" ? "bg-red-700" : "bg-red-400";
    }
  };

  const cardBg =
    theme === "dark"
      ? "bg-gray-800 border-gray-700 text-gray-100"
      : "bg-white border-gray-200 text-gray-900";

  if (dailyActivities.length === 0) {
    return (
      <Card className={`${cardBg} border`}>
        <div className="text-center py-8">
          <i className="pi pi-chart-line text-4xl text-gray-400 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            No activity data available
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`${cardBg} border`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">{title}</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Less</span>
            <div className="flex gap-1">
              <div
                className={`w-4 h-4 rounded ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                }`}
              />
              <div
                className={`w-4 h-4 rounded ${
                  theme === "dark" ? "bg-green-900" : "bg-green-100"
                }`}
              />
              <div
                className={`w-4 h-4 rounded ${
                  theme === "dark" ? "bg-green-700" : "bg-green-300"
                }`}
              />
              <div
                className={`w-4 h-4 rounded ${
                  theme === "dark" ? "bg-orange-700" : "bg-orange-300"
                }`}
              />
              <div
                className={`w-4 h-4 rounded ${
                  theme === "dark" ? "bg-red-700" : "bg-red-400"
                }`}
              />
            </div>
            <span className="text-gray-600 dark:text-gray-400">More</span>
          </div>
        </div>

        {/* Activity heatmap grid */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-2 min-w-max">
            {dailyActivities.map((day, index) => {
              const dayName = day.dateObj.toLocaleDateString("en-US", {
                weekday: "short",
              });
              const dayNum = day.dateObj.getDate();
              const month = day.dateObj.toLocaleDateString("en-US", {
                month: "short",
              });

              return (
                <div
                  key={day.date}
                  className="group relative"
                  aria-label={`${month} ${dayNum}: ${day.count} activities`}
                >
                  <div
                    className={`w-full aspect-square rounded-lg ${getColor(
                      day.count
                    )} border-2 ${
                      theme === "dark"
                        ? "border-gray-600"
                        : "border-gray-300"
                    } transition-all hover:scale-110 cursor-pointer flex flex-col items-center justify-center`}
                  >
                    <div className="text-xs font-semibold">{dayName}</div>
                    <div className="text-lg font-bold">{dayNum}</div>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
                      <div className="font-semibold">
                        {month} {dayNum}
                      </div>
                      <div>
                        {day.count} activit{day.count === 1 ? "y" : "ies"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {dailyActivities.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Active Days
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {activities.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Activities
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {avgPerDay}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Avg per Day
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {maxCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Peak Day
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
