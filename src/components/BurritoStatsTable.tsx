"use client";
import React, { useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { useTheme } from "./ThemeProvider";
import { SegmentActivity } from "../generated/schema";

const METERS_TO_MILES = 1609.34;

type Props = {
  activities: SegmentActivity[];
  title?: string;
};

type UserStats = {
  userId: string;
  userName: string;
  totalCompletions: number;
  totalDistance: number;
  totalElapsedTime: number;
  totalMovingTime: number;
  activityTypes: string[];
  mostRecentActivity: string;
};

/**
 * BurritoStatsTable Component
 * 
 * Displays aggregated statistics per user in a sortable, filterable table.
 * Shows completions, distance, time, activity types, and most recent activity.
 * Works with both all segments (main page) and single segment (detail page) views.
 */
export default function BurritoStatsTable({ activities, title }: Props) {
  const { theme } = useTheme();

  // Aggregate activities by user
  const userStats = useMemo(() => {
    if (!activities || activities.length === 0) {
      return [];
    }

    const statsByUser = new Map<string, UserStats>();

    activities.forEach((activity) => {
      const userId = activity.userId || 'Unknown';
      
      if (!statsByUser.has(userId)) {
        statsByUser.set(userId, {
          userId,
          // TODO: Fetch actual user names from getUserByUserName query or user service
          userName: userId,
          totalCompletions: 0,
          totalDistance: 0,
          totalElapsedTime: 0,
          totalMovingTime: 0,
          activityTypes: [],
          mostRecentActivity: activity.startDate,
        });
      }

      const stats = statsByUser.get(userId)!;
      stats.totalCompletions += activity.segmentCompletions || 1;
      stats.totalDistance += (activity.distance || 0) / METERS_TO_MILES;
      stats.totalElapsedTime += activity.elapsedTime || 0;
      stats.totalMovingTime += activity.movingTime || 0;

      // Track unique activity types
      const activityType = activity.sportType || activity.activityType || 'Unknown';
      if (!stats.activityTypes.includes(activityType)) {
        stats.activityTypes.push(activityType);
      }

      // Track most recent activity
      if (new Date(activity.startDate) > new Date(stats.mostRecentActivity)) {
        stats.mostRecentActivity = activity.startDate;
      }
    });

    return Array.from(statsByUser.values()).sort((a, b) => 
      b.totalCompletions - a.totalCompletions
    );
  }, [activities]);

  // Format time in seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Column templates
  const userNameTemplate = (rowData: UserStats) => {
    return (
      <div className="font-medium">
        {rowData.userName}
      </div>
    );
  };

  const completionsTemplate = (rowData: UserStats) => {
    return (
      <div className="font-semibold text-blue-500">
        {rowData.totalCompletions}
      </div>
    );
  };

  const distanceTemplate = (rowData: UserStats) => {
    return <span>{rowData.totalDistance.toFixed(2)} mi</span>;
  };

  const elapsedTimeTemplate = (rowData: UserStats) => {
    return <span>{formatTime(rowData.totalElapsedTime)}</span>;
  };

  const movingTimeTemplate = (rowData: UserStats) => {
    return <span>{formatTime(rowData.totalMovingTime)}</span>;
  };

  const activityTypesTemplate = (rowData: UserStats) => {
    return (
      <div className="flex gap-1 flex-wrap">
        {rowData.activityTypes.map((type, idx) => (
          <span
            key={idx}
            className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400"
          >
            {type}
          </span>
        ))}
      </div>
    );
  };

  const recentActivityTemplate = (rowData: UserStats) => {
    return <span>{formatDate(rowData.mostRecentActivity)}</span>;
  };

  // Handle empty state
  if (!activities || activities.length === 0) {
    const cardBg = theme === 'dark'
      ? 'bg-gray-800 border-gray-700 text-gray-100'
      : 'bg-white border-gray-200 text-gray-900';

    return (
      <Card title={title || "Activity Statistics"} className={`${cardBg} border`}>
        <div className="flex items-center justify-center py-8 text-gray-400">
          <div className="text-center">
            <i className="pi pi-table text-4xl mb-3 opacity-50" />
            <p>No activity data available yet</p>
          </div>
        </div>
      </Card>
    );
  }

  const cardBg = theme === 'dark'
    ? 'bg-gray-800 border-gray-700 text-gray-100'
    : 'bg-white border-gray-200 text-gray-900';

  return (
    <Card title={title || "Activity Statistics"} className={`${cardBg} border`}>
      <DataTable
        value={userStats}
        sortMode="multiple"
        paginator={userStats.length > 10}
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        className="text-sm"
        stripedRows
        emptyMessage="No statistics available"
      >
        <Column
          field="userName"
          header="Participant"
          sortable
          body={userNameTemplate}
          style={{ minWidth: '150px' }}
        />
        <Column
          field="totalCompletions"
          header="Completions"
          sortable
          body={completionsTemplate}
          style={{ minWidth: '120px' }}
        />
        <Column
          field="totalDistance"
          header="Distance"
          sortable
          body={distanceTemplate}
          style={{ minWidth: '120px' }}
        />
        <Column
          field="totalElapsedTime"
          header="Elapsed Time"
          sortable
          body={elapsedTimeTemplate}
          style={{ minWidth: '130px' }}
        />
        <Column
          field="totalMovingTime"
          header="Moving Time"
          sortable
          body={movingTimeTemplate}
          style={{ minWidth: '130px' }}
        />
        <Column
          field="activityTypes"
          header="Activity Types"
          body={activityTypesTemplate}
          style={{ minWidth: '150px' }}
        />
        <Column
          field="mostRecentActivity"
          header="Most Recent"
          sortable
          body={recentActivityTemplate}
          style={{ minWidth: '130px' }}
        />
      </DataTable>
    </Card>
  );
}
