"use client";
import React, { useState, useMemo } from "react";
import { InputText } from "primereact/inputtext";
import { useTheme } from "./ThemeProvider";
import type { Segment } from "../generated/schema";
import dynamic from "next/dynamic";
import {
  getFullStateName,
  getFullCountryName,
} from "../utils/abbreviations";
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
    return props.segments.filter((segment) => {
      // Check title and description (direct match)
      if (segment.title?.toLowerCase().includes(search)) return true;
      if (segment.description?.toLowerCase().includes(search)) return true;

      // Check city (direct match)
      if (segment.city?.toLowerCase().includes(search)) return true;

      // Check state - match both abbreviation AND full name
      if (segment.state) {
        const stateAbbrev = segment.state.toLowerCase();
        // Check if search matches the stored abbreviation
        if (stateAbbrev.includes(search)) return true;
        // Check if search matches the full state name
        const fullStateName = getFullStateName(segment.state);
        if (fullStateName?.toLowerCase().includes(search)) return true;
      }

      // Check country - match both code AND full name
      if (segment.country) {
        const countryCode = segment.country.toLowerCase();
        // Check if search matches the stored code
        if (countryCode.includes(search)) return true;
        // Check if search matches the full country name
        const fullCountryName = getFullCountryName(segment.country);
        if (fullCountryName?.toLowerCase().includes(search)) return true;
      }

      return false;
    });
  }, [props.segments, filterText]);

  return (
    <>
      <div className="mb-4">
        <InputText
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Search segments by location, title, or description..."
          className="w-full"
        />
        {filterText && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredSegments.length} of {props.segments.length} segments
          </div>
        )}
      </div>
      <div className="relative w-full mx-auto h-[70vh] rounded-lg overflow-hidden">
        <SegmentMap segments={filteredSegments}></SegmentMap>
      </div>
    </>
  );
}
  