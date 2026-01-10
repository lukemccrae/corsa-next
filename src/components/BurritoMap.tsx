"use client";
import React, { useState, useMemo } from "react";

import { useTheme } from "./ThemeProvider";
import type { Segment } from "../generated/schema";
import dynamic from "next/dynamic";
// import { SegmentMap } from "./SegmentMap";
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


  

  return (
    <>
      <div className="relative w-full max-w-3xl mx-auto h-[70vh] rounded-lg overflow-hidden mt-10">
        <h1 className="text-3xl font-bold mb-3">🌯 Burrito League</h1>
        <SegmentMap segments={props.segments}></SegmentMap>
      </div>
    </>
  );
}
  