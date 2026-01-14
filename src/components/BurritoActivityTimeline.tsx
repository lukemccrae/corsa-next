"use client";
import React, { useMemo } from "react";
import { Chart } from "primereact/chart";
import { Card } from "primereact/card";
import { useTheme } from "./ThemeProvider";
import { SegmentActivity } from "../generated/schema";
import { METERS_TO_MILES } from "../helpers/constants";

type Props = {
  activities: SegmentActivity[];
  title?: string;
};

/**
 * BurritoActivityTimeline Component
 * 
 * Displays a timeline chart showing activity distribution over time.
 * Shows total completions, unique participants, and total distance aggregated by date.
 * Works with both all segments (main page) and single segment (detail page) views.
 */
export default function BurritoActivityTimeline({ activities, title }: Props) {
  const { theme } = useTheme();

  // Process activities into chart data
  const chartData = useMemo(() => {
    if (!activities || activities.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Aggregate by date
    const activityByDate = new Map<string, {
      count: number;
      users: Set<string>;
      totalDistance: number;
    }>();

    activities.forEach((activity) => {
      const date = activity.startDateLocal || activity.startDate;
      if (!date) return;

      // Extract date part only (YYYY-MM-DD)
      const dateKey = new Date(date).toISOString().split('T')[0];
      
      if (!activityByDate.has(dateKey)) {
        activityByDate.set(dateKey, {
          count: 0,
          users: new Set(),
          totalDistance: 0,
        });
      }

      const dateData = activityByDate.get(dateKey)!;
      dateData.count += activity.segmentCompletions || 1;
      if (activity.userId) {
        dateData.users.add(activity.userId);
      }
      dateData.totalDistance += (activity.distance || 0) / METERS_TO_MILES;
    });

    // Sort dates and prepare data
    const sortedDates = Array.from(activityByDate.keys()).sort();
    
    const completions = sortedDates.map(date => activityByDate.get(date)!.count);
    const uniqueParticipants = sortedDates.map(date => activityByDate.get(date)!.users.size);
    const distances = sortedDates.map(date => activityByDate.get(date)!.totalDistance);

    // Format labels to be more readable
    const labels = sortedDates.map(date => {
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    return {
      labels,
      datasets: [
        {
          type: 'bar' as const,
          label: 'Total Completions',
          backgroundColor: theme === 'dark' ? 'rgba(99, 179, 237, 0.6)' : 'rgba(54, 162, 235, 0.6)',
          borderColor: theme === 'dark' ? 'rgba(99, 179, 237, 1)' : 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          data: completions,
          yAxisID: 'y',
        },
        {
          type: 'line' as const,
          label: 'Unique Participants',
          borderColor: theme === 'dark' ? 'rgba(255, 159, 64, 1)' : 'rgba(255, 99, 132, 1)',
          backgroundColor: theme === 'dark' ? 'rgba(255, 159, 64, 0.2)' : 'rgba(255, 99, 132, 0.2)',
          borderWidth: 2,
          fill: false,
          data: uniqueParticipants,
          yAxisID: 'y',
        },
        {
          type: 'line' as const,
          label: 'Total Distance (mi)',
          borderColor: theme === 'dark' ? 'rgba(75, 192, 192, 1)' : 'rgba(75, 192, 192, 1)',
          backgroundColor: theme === 'dark' ? 'rgba(75, 192, 192, 0.2)' : 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
          fill: false,
          data: distances,
          yAxisID: 'y1',
        },
      ],
    };
  }, [activities, theme]);

  // Chart options with theme awareness
  const chartOptions = useMemo(() => {
    const textColor = theme === 'dark' ? '#e5e7eb' : '#374151';
    const gridColor = theme === 'dark' ? '#374151' : '#e5e7eb';

    return {
      maintainAspectRatio: false,
      responsive: true,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                if (context.dataset.label === 'Total Distance (mi)') {
                  label += context.parsed.y.toFixed(2);
                } else {
                  label += Math.round(context.parsed.y);
                }
              }
              return label;
            }
          }
        },
      },
      scales: {
        x: {
          grid: {
            color: gridColor,
          },
          ticks: {
            color: textColor,
          },
        },
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          grid: {
            color: gridColor,
          },
          ticks: {
            color: textColor,
          },
          title: {
            display: true,
            text: 'Count',
            color: textColor,
          },
        },
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: textColor,
          },
          title: {
            display: true,
            text: 'Distance (mi)',
            color: textColor,
          },
        },
      },
    };
  }, [theme]);

  // Handle empty state
  if (!activities || activities.length === 0) {
    const cardBg = theme === 'dark' 
      ? 'bg-gray-800 border-gray-700 text-gray-100'
      : 'bg-white border-gray-200 text-gray-900';

    return (
      <Card title={title || "Activity Timeline"} className={`${cardBg} border`}>
        <div className="flex items-center justify-center py-8 text-gray-400">
          <div className="text-center">
            <i className="pi pi-chart-line text-4xl mb-3 opacity-50" />
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
    <Card title={title || "Activity Timeline"} className={`${cardBg} border`}>
      <div style={{ height: '400px' }}>
        <Chart type="bar" data={chartData} options={chartOptions} />
      </div>
    </Card>
  );
}
