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

// Mapping of state names to abbreviations and vice versa
const STATE_MAPPINGS: Record<string, string[]> = {
  'alabama': ['al', 'alabama'],
  'al': ['al', 'alabama'],
  'alaska': ['ak', 'alaska'],
  'ak': ['ak', 'alaska'],
  'arizona': ['az', 'arizona'],
  'az': ['az', 'arizona'],
  'arkansas': ['ar', 'arkansas'],
  'ar': ['ar', 'arkansas'],
  'california': ['ca', 'california'],
  'ca': ['ca', 'california'],
  'colorado': ['co', 'colorado'],
  'co': ['co', 'colorado'],
  'connecticut': ['ct', 'connecticut'],
  'ct': ['ct', 'connecticut'],
  'delaware': ['de', 'delaware'],
  'de': ['de', 'delaware'],
  'florida': ['fl', 'florida'],
  'fl': ['fl', 'florida'],
  'georgia': ['ga', 'georgia'],
  'ga': ['ga', 'georgia'],
  'hawaii': ['hi', 'hawaii'],
  'hi': ['hi', 'hawaii'],
  'idaho': ['id', 'idaho'],
  'id': ['id', 'idaho'],
  'illinois': ['il', 'illinois'],
  'il': ['il', 'illinois'],
  'indiana': ['in', 'indiana'],
  'in': ['in', 'indiana'],
  'iowa': ['ia', 'iowa'],
  'ia': ['ia', 'iowa'],
  'kansas': ['ks', 'kansas'],
  'ks': ['ks', 'kansas'],
  'kentucky': ['ky', 'kentucky'],
  'ky': ['ky', 'kentucky'],
  'louisiana': ['la', 'louisiana'],
  'la': ['la', 'louisiana'],
  'maine': ['me', 'maine'],
  'me': ['me', 'maine'],
  'maryland': ['md', 'maryland'],
  'md': ['md', 'maryland'],
  'massachusetts': ['ma', 'massachusetts'],
  'ma': ['ma', 'massachusetts'],
  'michigan': ['mi', 'michigan'],
  'mi': ['mi', 'michigan'],
  'minnesota': ['mn', 'minnesota'],
  'mn': ['mn', 'minnesota'],
  'mississippi': ['ms', 'mississippi'],
  'ms': ['ms', 'mississippi'],
  'missouri': ['mo', 'missouri'],
  'mo': ['mo', 'missouri'],
  'montana': ['mt', 'montana'],
  'mt': ['mt', 'montana'],
  'nebraska': ['ne', 'nebraska'],
  'ne': ['ne', 'nebraska'],
  'nevada': ['nv', 'nevada'],
  'nv': ['nv', 'nevada'],
  'new hampshire': ['nh', 'new hampshire'],
  'nh': ['nh', 'new hampshire'],
  'new jersey': ['nj', 'new jersey'],
  'nj': ['nj', 'new jersey'],
  'new mexico': ['nm', 'new mexico'],
  'nm': ['nm', 'new mexico'],
  'new york': ['ny', 'new york'],
  'ny': ['ny', 'new york'],
  'north carolina': ['nc', 'north carolina'],
  'nc': ['nc', 'north carolina'],
  'north dakota': ['nd', 'north dakota'],
  'nd': ['nd', 'north dakota'],
  'ohio': ['oh', 'ohio'],
  'oh': ['oh', 'ohio'],
  'oklahoma': ['ok', 'oklahoma'],
  'ok': ['ok', 'oklahoma'],
  'oregon': ['or', 'oregon'],
  'or': ['or', 'oregon'],
  'pennsylvania': ['pa', 'pennsylvania'],
  'pa': ['pa', 'pennsylvania'],
  'rhode island': ['ri', 'rhode island'],
  'ri': ['ri', 'rhode island'],
  'south carolina': ['sc', 'south carolina'],
  'sc': ['sc', 'south carolina'],
  'south dakota': ['sd', 'south dakota'],
  'sd': ['sd', 'south dakota'],
  'tennessee': ['tn', 'tennessee'],
  'tn': ['tn', 'tennessee'],
  'texas': ['tx', 'texas'],
  'tx': ['tx', 'texas'],
  'utah': ['ut', 'utah'],
  'ut': ['ut', 'utah'],
  'vermont': ['vt', 'vermont'],
  'vt': ['vt', 'vermont'],
  'virginia': ['va', 'virginia'],
  'va': ['va', 'virginia'],
  'washington': ['wa', 'washington'],
  'wa': ['wa', 'washington'],
  'west virginia': ['wv', 'west virginia'],
  'wv': ['wv', 'west virginia'],
  'wisconsin': ['wi', 'wisconsin'],
  'wi': ['wi', 'wisconsin'],
  'wyoming': ['wy', 'wyoming'],
  'wy': ['wy', 'wyoming'],
};

// Mapping of country names to abbreviations and common variations
const COUNTRY_MAPPINGS: Record<string, string[]> = {
  'united states': ['usa', 'us', 'united states', 'united states of america', 'america'],
  'usa': ['usa', 'us', 'united states', 'united states of america', 'america'],
  'us': ['usa', 'us', 'united states', 'united states of america', 'america'],
  'america': ['usa', 'us', 'united states', 'united states of america', 'america'],
  'united kingdom': ['uk', 'gb', 'united kingdom', 'great britain', 'britain'],
  'uk': ['uk', 'gb', 'united kingdom', 'great britain', 'britain'],
  'gb': ['uk', 'gb', 'united kingdom', 'great britain', 'britain'],
  'canada': ['ca', 'can', 'canada'],
  'ca': ['ca', 'can', 'canada'],
  'can': ['ca', 'can', 'canada'],
  'mexico': ['mx', 'mex', 'mexico'],
  'mx': ['mx', 'mex', 'mexico'],
  'mex': ['mx', 'mex', 'mexico'],
};

// Helper function to check if search term matches a location field with abbreviation support
const matchesLocation = (fieldValue: string | null | undefined, searchTerm: string): boolean => {
  if (!fieldValue) return false;
  
  const fieldLower = fieldValue.toLowerCase();
  const searchLower = searchTerm.toLowerCase();
  
  // Direct match
  if (fieldLower.includes(searchLower)) return true;
  
  // Check state mappings
  const stateMappings = STATE_MAPPINGS[searchLower];
  if (stateMappings) {
    return stateMappings.some(variant => fieldLower.includes(variant));
  }
  
  // Check country mappings
  const countryMappings = COUNTRY_MAPPINGS[searchLower];
  if (countryMappings) {
    return countryMappings.some(variant => fieldLower.includes(variant));
  }
  
  return false;
};

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
      matchesLocation(segment.state, search) ||
      matchesLocation(segment.country, search)
    );
  }, [props.segments, filterText]);

  return (
    <>
      <div className="w-3/4 md:w-1/2 mx-auto m-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="p-input-icon-left w-full">
              <InputText
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Search"
                className="w-full"
              />
            </span>
          </div>
        </div>
      </div>
      <div className="relative w-full mx-auto h-[60vh] rounded-lg overflow-hidden">
        <SegmentMap segments={filteredSegments}></SegmentMap>
      </div>
    </>
  );
}
  