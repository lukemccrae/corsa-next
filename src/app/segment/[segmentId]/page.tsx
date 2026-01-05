"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Card } from "primereact/card";
import { useTheme } from "@/src/components/ThemeProvider";
import { useUser } from "@/src/context/UserContext";
import SegmentLeaderboard, { LeaderboardEntry } from "@/src/components/SegmentLeaderboard";
import { Segment, SegmentLeaderboardEntry } from "@/src/generated/schema";
import { fetchSegmentDetails, fetchSegmentLeaderboard } from "@/src/services/segment.service";

const SmallTrackMap = dynamic(
  () => import("@/src/components/SmallTrackMap"),
  { ssr: false }
);

export default function SegmentDetailPage() {
  const { segmentId } = useParams();
  const { user } = useUser();
  const { theme } = useTheme();
  
  const [segment, setSegment] = useState<Segment | null>(null);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!segmentId || typeof segmentId !== "string") {
        setError("Invalid segment ID");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch segment details and leaderboard in parallel
        const [segmentResult, leaderboardResult] = await Promise.all([
          fetchSegmentDetails({ segmentId }),
          fetchSegmentLeaderboard({ segmentId }),
        ]);

        if (segmentResult.errors) {
          throw new Error(segmentResult.errors[0]?.message || "Failed to fetch segment");
        }

        if (leaderboardResult.errors) {
          throw new Error(leaderboardResult.errors[0]?.message || "Failed to fetch leaderboard");
        }

        const segmentData:  Segment = segmentResult.data?. getSegmentBySegmentId;
        const leaderboardData:  SegmentLeaderboardEntry[] = leaderboardResult.data?. getSegmentLeaderboard || [];

        if (! segmentData) {
          throw new Error("Segment not found");
        }

        setSegment(segmentData);

        // Transform API leaderboard entries to component format
        // Note: Your API doesn't return time/date/gender, so we'll need to add those fields
        // to your GraphQL schema or work with what's available
        const transformedEntries:  LeaderboardEntry[] = leaderboardData.map((entry, index) => ({
          rank: index + 1,
          userId: entry.userId,
          username: entry.username,
          profilePicture: entry.profilePicture || undefined,
          time: 0, // You'll need to add this field to your schema
          date: entry.lastEffortAt || new Date().toISOString(),
          attemptCount: entry.attemptCount,
          lastEffort: entry.lastEffortAt || undefined,
          // gender field not in schema - you may want to add it
        }));

        setLeaderboardEntries(transformedEntries);
      } catch (err) {
        console.error("Error fetching segment data:", err);
        setError(err instanceof Error ? err.message :  "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [segmentId]);

  const cardBg =
    theme === "dark"
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <i className="pi pi-spin pi-spinner text-4xl text-blue-500" />
      </div>
    );
  }

  if (error || !segment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className={`p-6 ${cardBg}`}>
          <p className="text-red-500">{error || "Segment not found"}</p>
        </Card>
      </div>
    );
  }

  // Convert route points to [lat, lng] format for the map
  const mapPoints:  [number, number][] = segment.route?. points
    ?  segment.route.points
        .filter((p) => p?. lat != null && p?.lng != null)
        .map((p) => [p! .lat, p!.lng] as [number, number])
    : [];

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {segment.title}
        </h1>
        {segment.description && (
          <p className="text-gray-600 dark:text-gray-400">
            {segment.description}
          </p>
        )}
      </div>

      {/* Leaderboard Section */}
      <div className="space-y-4">
        <SegmentLeaderboard
          segmentName={segment.title}
          segmentDistance={segment.route?.distance || 0}
          segmentElevationGain={segment.route?.gain || undefined}
          unitOfMeasure={segment.route?.uom || "IMPERIAL"}
          entries={leaderboardEntries}
          currentUserId={user?.userId}
        />
      </div>

      {/* Map Section */}
      {mapPoints.length > 0 && (
        <Card className={`${cardBg} p-0 overflow-hidden`}>
          <div className="h-96 w-full">
            <SmallTrackMap
              points={mapPoints}
              className="h-full w-full rounded-lg"
            />
          </div>
        </Card>
      )}
    </div>
  );
}