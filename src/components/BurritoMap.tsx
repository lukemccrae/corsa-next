"use client";
import React, { useState, useMemo } from "react";

import { useTheme } from "./ThemeProvider";
import type { Segment, SegmentActivity } from "../generated/schema";
import dynamic from "next/dynamic";
import BurritoActivityTimeline from "./BurritoActivityTimeline";
import BurritoStatsCards from "./BurritoStatsCards";

type CoverMapProps = {
  segments: Segment[];
};

const SegmentMap = dynamic(
  () =>
    import("@/src/components/SegmentMap").then(
      (mod) => mod.SegmentMap
    ),
  { ssr: false }
);

export default function BurritoMap(props: CoverMapProps) {
  const { theme } = useTheme();
  const [selectedSegment, setSelectedSegment] = useState<string>("407488430");

  const segmentOptions = useMemo(
    () =>
      props.segments.map((segment) => ({
        label: segment.title,
        value: segment.segmentId,
      })),
    [props.segments]
  );

  // Aggregate all activities from all segments
  const allActivities = useMemo(() => {
    const activities: SegmentActivity[] = [];
    props.segments.forEach((segment) => {
      if (segment.activities) {
        activities.push(...(segment.activities.filter(Boolean) as SegmentActivity[]));
      }
    });
    return activities;
  }, [props.segments]);

  return (
    <>
      <div className="relative w-full max-w-7xl mx-auto px-4 mt-10">
        <h1 className="text-3xl font-bold mb-6">🌯 Burrito League</h1>
        
        {/* Map Section */}
        <div className="mb-8 h-[60vh] rounded-lg overflow-hidden">
          <SegmentMap segments={props.segments}></SegmentMap>
        </div>

        {/* Visualizations Section */}
        <div className="space-y-8 mb-8">
          {/* Activity Timeline */}
          <BurritoActivityTimeline 
            activities={allActivities}
            title="🌯 Burrito League Activity Timeline - January 2026"
          />

          {/* Stats Cards */}
          <BurritoStatsCards 
            activities={allActivities}
            segments={props.segments}
            isGlobalView={true}
          />
        </div>
      </div>
    </>
  );
}
  