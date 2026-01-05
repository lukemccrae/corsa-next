"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Card } from "primereact/card";
import { useTheme } from "@/src/components/ThemeProvider";
import { useUser } from "@/src/context/UserContext";
import SegmentLeaderboard from "@/src/components/SegmentLeaderboard";

const SmallTrackMap = dynamic(
  () => import("@/src/components/SmallTrackMap"),
  { ssr: false }
);

// Mock data - Tempe, Arizona segment
const MOCK_SEGMENT = {
  name: "Tempe Arizona Chipotle Challenge",
  distance: 0.8,
  elevationGain: 300,
  description: "Whoever logs the most segment completions from Mill Ave Bridge to the top of 'A' wins free Chipotle for a year!",
  points: [
    [33.4254, -111.9379], // Start - Mill Ave Bridge area
    [33.4265, -111.9385],
    [33.4278, -111.9391],
    [33.4289, -111.9397],
    [33.4298, -111.9403], // Summit
  ] as [number, number][],
};

const MOCK_ENTRIES = [
  {
    rank: 1,
    userId: "user1",
    username: "michael_lee",
    profilePicture: "https://i.pravatar.cc/150? img=11",
    time: 387, // 6:27
    date: "2026-01-02T07:30:00Z",
    gender: "M" as const,
    attemptCount: 24,
    lastEffort: "2026-01-02T07:30:00Z",
  },
  {
    rank:  2,
    userId: "user2",
    username: "alex_morrison",
    profilePicture:  "https://i.pravatar.cc/150?img=12",
    time: 412, // 6:52
    date: "2025-12-28T06:45:00Z",
    gender:  "F" as const,
    attemptCount: 19,
    lastEffort: "2025-12-28T06:45:00Z",
  },
  {
    rank: 3,
    userId: "user3",
    username: "marcus_j",
    time: 425, // 7:05
    date: "2025-12-20T08:15:00Z",
    gender:  "M" as const,
    attemptCount: 18,
    lastEffort: "2025-12-20T08:15:00Z",
  },
  {
    rank: 4,
    userId: "user4",
    username: "marcus_j",
    profilePicture: "https://i.pravatar.cc/150? img=14",
    time: 438, // 7:18
    date: "2025-12-15T17:20:00Z",
    gender:  "F" as const,
    attemptCount: 12,
    lastEffort: "2025-12-15T17:20:00Z",
  },
  {
    rank:  5,
    userId: "james_p",
    username: "tempe_trail_runner",
    time: 451, // 7:31
    date: "2025-12-10T06:30:00Z",
    gender:  "M" as const,
    attemptCount: 7,
    lastEffort: "2025-12-10T06:30:00Z",
  },
];

export default function SegmentDetailPage() {
  const { segmentId } = useParams();
  const { user } = useUser();
  const { theme } = useTheme();
  const [segment, setSegment] = useState(MOCK_SEGMENT);
  const [entries, setEntries] = useState(MOCK_ENTRIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetch
    const fetchSegmentData = async () => {
      setLoading(true);
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSegment(MOCK_SEGMENT);
      setEntries(MOCK_ENTRIES);
      setLoading(false);
    };

    fetchSegmentData();
  }, [segmentId]);

  const cardBg =
    theme === "dark"
      ? "bg-gray-800 border-gray-700"
      :  "bg-white border-gray-200";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <i className="pi pi-spin pi-spinner text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Page Title & Description */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {segment.name}
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            {segment.description}
          </p>
        </div>

        {/* Map Section */}
        <Card className={`mb-6 ${cardBg} border`}>
          <div className="h-64 md:h-96 rounded-lg overflow-hidden">
            <SmallTrackMap points={segment.points} zoom={14} center={[33.4276, -111.9391]} className="h-full w-full"/>
          </div>
        </Card>

        {/* Leaderboard Section */}
        <SegmentLeaderboard segmentName={segment.name} segmentDistance={segment.distance} segmentElevationGain={segment.elevationGain} unitOfMeasure="IMPERIAL" entries={entries} currentUserId={user?.userId}/>
      </div>
    </div>
  );
}