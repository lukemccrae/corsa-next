"use client";
import React, { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Card } from "primereact/card";
import { useTheme } from "@/src/components/ThemeProvider";
import { useUser } from "@/src/context/UserContext";
import SegmentLeaderboard from "@/src/components/SegmentLeaderboard";
import dynamic from "next/dynamic";

const SmallTrackMap = dynamic(() => import("@/src/components/SmallTrackMap"), {
  ssr: false,
});

// Segment data from your image
const SEGMENTS = [
  {
    label: "Burrito League Calgary",
    value: "burrito-league-calgary",
    city: "Calgary",
    state: "Alberta",
    country: "CAN",
  },
  {
    label: "Burrito League Blairmore",
    value: "burrito-league-blairmore",
    city: "Crowsnest Pass",
    state: "Alberta",
    country: "CAN",
  },
  {
    label: "Tempe Burrito League",
    value: "tempe-burrito-league",
    city: "Tempe",
    state: "AZ",
    country: "USA",
  },
  {
    label: "CocoLocoBurrito",
    value: "cocolocoburrito",
    city: "Flagstaff",
    state: "AZ",
    country: "USA",
  },
  {
    label: "Tucson Burrito League",
    value: "tucson-burrito-league",
    city: "Tucson",
    state: "AZ",
    country: "USA",
  },
  {
    label: "Prescott Burrito League",
    value: "prescott-burrito-league",
    city: "Prescott",
    state: "AZ",
    country: "USA",
  },
  {
    label: "Marana Burrito League",
    value: "marana-burrito-league",
    city: "Marana",
    state: "AZ",
    country: "USA",
  },
  {
    label: "Gila Bend Burrito League",
    value: "gila-bend-burrito-league",
    city: "Gila Bend",
    state: "AZ",
    country: "USA",
  },
  {
    label: "Burrito League - Oscar's Mexican Restaurant",
    value: "burrito-league-oscars",
    city: "Redlands",
    state: "CA",
    country: "USA",
  },
  {
    label: "Burrito League San Francisco",
    value: "burrito-league-sf",
    city: "San Francisco",
    state: "CA",
    country: "USA",
  },
  {
    label: "Burrito League - Santa Barbara w/ rabbit",
    value: "burrito-league-santa-barbara",
    city: "Santa Barbara",
    state: "CA",
    country: "USA",
  },
  {
    label: "Burrito League Denver OFFICIAL Route",
    value: "burrito-league-denver",
    city: "Denver / Wheat Ridge",
    state: "CO",
    country: "USA",
  },
  {
    label: "Boulder Burrito League",
    value: "boulder-burrito-league",
    city: "Boulder",
    state: "CO",
    country: "USA",
  },
  {
    label: "Castle Rock Burrito League",
    value: "castle-rock-burrito-league",
    city: "Castle Rock",
    state: "CO",
    country: "USA",
  },
];

// Mock leaderboard data generator
const generateMockLeaderboard = (segmentName: string) => {
  const baseUsers = [
    {
      username: "go_shep",
      profilePicture: "https://i.pravatar.cc/150? img=12",
    },
    {
      username: "jamilcoury",
      profilePicture: "https://i.pravatar.cc/150?img=33",
    },
    {
      username: "dirty. t. run. club",
      profilePicture: "https://i.pravatar.cc/150?img=45",
    },
    {
      username: "finding_my_dirt",
      profilePicture: "https://i.pravatar.cc/150?img=8",
    },
    {
      username: "cprunsfar",
      profilePicture: "https://i.pravatar.cc/150?img=28",
    },
    { username: "amglaze", profilePicture: "https://i.pravatar.cc/150?img=15" },
    {
      username: "zachmayfield95",
      profilePicture: "https://i.pravatar.cc/150?img=22",
    },
    {
      username: "sam_marks",
      profilePicture: "https://i.pravatar.cc/150?img=37",
    },
    {
      username: "lukejay180",
      profilePicture: "https://i.pravatar.cc/150?img=42",
    },
    {
      username: "trappephoto",
      profilePicture: "https://i.pravatar.cc/150?img=50",
    },
  ];

  // Randomize order and times for each segment
  const shuffled = [...baseUsers].sort(() => Math.random() - 0.5);

  return shuffled.map((user, index) => ({
    rank: index + 1,
    userId: `user-${index}`,
    username: user.username,
    profilePicture: user.profilePicture,
    time: 600 + Math.floor(Math.random() * 300) + index * 15, // 10-20 minutes
    date: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    attemptCount: Math.floor(Math.random() * 10) + 1,
    lastEffort: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    gender: Math.random() > 0.5 ? "M" : ("F" as "M" | "F"),
  }));
};

// Mock route points for map
const generateMockRoute = (): [number, number][] => {
  const startLat = 33.4 + Math.random() * 0.05;
  const startLng = -111.9 + Math.random() * 0.05;

  const points: [number, number][] = [];
  for (let i = 0; i < 20; i++) {
    points.push([
      startLat + i * 0.001 + Math.random() * 0.0005,
      startLng + i * 0.001 + Math.random() * 0.0005,
    ]);
  }
  return points;
};

export default function SegmentDemoPage() {
  const { theme } = useTheme();
  const { user } = useUser();

  const [selectedSegment, setSelectedSegment] = useState<string>('tempe-burrito-league');
  const [loading, setLoading] = useState(false);

  // In a real implementation, you'd fetch this from GraphQL
  const segmentData = selectedSegment
    ? {
        name: SEGMENTS.find((s) => s.value === selectedSegment)?.label || "",
        distance: 3.1 + Math.random() * 2, // 3-5 miles
        elevationGain: 150 + Math.floor(Math.random() * 300), // 150-450 ft
        leaderboard: generateMockLeaderboard(selectedSegment),
        routePoints: generateMockRoute(),
      }
    : null;

  const handleSegmentChange = async (e: { value: string }) => {
    setLoading(true);
    setSelectedSegment(e.value);

    // Simulate GraphQL query delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // TODO: Replace with actual GraphQL query
    // const result = await fetchSegmentDetails({ segmentId: e.value });
    // const leaderboard = await fetchSegmentLeaderboard({ segmentId: e.value });

    setLoading(false);
  };

  const cardBg =
    theme === "dark"
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200";

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section with Image */}
      <div className="mb-8">
        <div className="relative w-full h-40 rounded-lg overflow-hidden mb-6">
          <img
            src="https://www.mountainoutpost.com/wp-content/uploads/2026/01/Untitled-design-1024x576.png"
            alt="Burrito League runners"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-4 md:p-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-1">
                Burrito League Segments
              </h1>
              <p className="text-sm md:text-base text-gray-200">
                Run, compete, and enjoy burritos across North America
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Segment Selector */}
      <Card className={`mb-8 ${cardBg} border`}>
        <div className="flex flex-col gap-4">
          <label className="text-lg font-semibold">Choose a Segment</label>
          <Dropdown
            value={selectedSegment}
            onChange={handleSegmentChange}
            options={SEGMENTS}
            optionLabel="label"
            placeholder="Select a Burrito League segment..."
            className="w-full"
            filter
            filterPlaceholder="Search segments..."
            emptyMessage="No segments found"
          />

          {selectedSegment && (
            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>
                <i className="pi pi-map-marker mr-1" />
                {SEGMENTS.find((s) => s.value === selectedSegment)?.city}
              </span>
              <span>
                <i className="pi pi-globe mr-1" />
                {SEGMENTS.find((s) => s.value === selectedSegment)?.state},{" "}
                {SEGMENTS.find((s) => s.value === selectedSegment)?.country}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <i className="pi pi-spin pi-spinner text-4xl text-blue-500" />
        </div>
      )}

      {/* Segment Details */}
      {!loading && segmentData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard - takes up 2 columns */}
          <div className="lg:col-span-2">
            <SegmentLeaderboard
              segmentName={segmentData.name}
              segmentDistance={segmentData.distance}
              segmentElevationGain={segmentData.elevationGain}
              unitOfMeasure="IMPERIAL"
              entries={segmentData.leaderboard}
              currentUserId={user?.userId}
            />
          </div>

          {/* Map - takes up 1 column */}
          <div className="lg: col-span-1">
            <Card className={`${cardBg} border h-full`}>
              <h3 className="text-xl font-semibold mb-4">Route Map</h3>
              <div className="rounded-lg overflow-hidden">
                <SmallTrackMap
                  points={segmentData.routePoints}
                  zoom={12}
                  className="h-96"
                />
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Distance
                    </span>
                    <p className="font-semibold text-lg">
                      {segmentData.distance.toFixed(2)} mi
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Elevation
                    </span>
                    <p className="font-semibold text-lg">
                      {segmentData.elevationGain} ft
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
      {/* Info Card */}
      <Card className={`mt-8 ${cardBg} border`}>
        <div className="flex items-start gap-4">
          <i className="pi pi-info-circle text-blue-500 text-2xl" />
          <div>
            <h3 className="font-semibold mb-2">About Burrito Leagues</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Burrito Leagues are community running events where participants
              race to a local burrito restaurant. Each segment represents a
              different location across North America. Track your times, compete
              on leaderboards, and join the community!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
