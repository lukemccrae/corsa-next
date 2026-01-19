"use client";
import React, { useState, useMemo } from "react";
import { InputText } from "primereact/inputtext";
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
  const [filterText, setFilterText] = useState("");

  const segmentOptions = useMemo(
    () =>
      props.segments.map((segment) => ({
        label: segment.title,
        value: segment.segmentId,
      })),
    [props.segments]
  );

  const filteredSegments = useMemo(() => {
    if (!filterText.trim()) return props.segments;
    
    const search = filterText.toLowerCase();
    return props.segments.filter(segment => 
      segment.title?.toLowerCase().includes(search) ||
      segment.description?.toLowerCase().includes(search) ||
      segment.city?.toLowerCase().includes(search) ||
      segment.state?.toLowerCase().includes(search) ||
      segment.country?.toLowerCase().includes(search)
    );
  }, [props.segments, filterText]);

  return (
    <>
      <div className="w-full mx-auto mb-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="p-input-icon-left w-full">
              <i className="pi pi-search" />
              <InputText
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Search segments by name, location, or description..."
                className="w-full"
              />
            </span>
          </div>
          {filterText && (
            <div className="text-sm opacity-70">
              Showing {filteredSegments.length} of {props.segments.length} segments
            </div>
          )}
        </div>
      </div>
      <div className="relative w-full mx-auto h-[70vh] rounded-lg overflow-hidden">
        <SegmentMap segments={filteredSegments}></SegmentMap>
      </div>
    </>
  );
}
  