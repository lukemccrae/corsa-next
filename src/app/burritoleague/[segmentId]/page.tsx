"use server";
import LiveProfileClient from "@/src/components/LiveProfileClient";
import SegmentEffortLeaderboard from "@/src/components/SegmentLeaderboard";
import BurritoActivityTimeline from "@/src/components/BurritoActivityTimeline";
import BurritoStatsCards from "@/src/components/BurritoStatsCards";
import { useUser } from "@/src/context/UserContext";
import React, { use } from "react";

/**
 * Server page for /profile/[username]
 *
 * - Fetches user (and associated liveStreams / posts) server-side using an AppSync API key.
 * - Renders a small client wrapper (ProfileClient) to host the interactive bits (buttons, feed).
 *
 * Environment:
 * - Prefer APPSYNC_ENDPOINT and APPSYNC_API_KEY from process.env.
 * - If not provided, falls back to the endpoint/key used elsewhere in the repo.
 */

const APPSYNC_ENDPOINT =
  process.env.APPSYNC_ENDPOINT ??
  "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY =
  process.env.APPSYNC_API_KEY ?? "da2-5f7oqdwtvnfydbn226e6c2faga";

async function fetchIntegrationData(username: string) {
  const query = `
    query GetSegmentBySegmentId {
          getUserByUserName(username: "${username}") {
          stravaIntegration {
            athleteId
          }
        }
    }
  `;

  const variables = { username };

  const res = await fetch(APPSYNC_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": APPSYNC_API_KEY,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch segment data");
  }

  const json = await res.json();
  return json?.data?.getUserByUserName ?? null;
}

async function fetchSegmentData(segmentId: string) {
  const query = `
    query GetSegmentBySegmentId {
        getSegmentBySegmentId(segmentId: "${segmentId}") {
            activities {
              activityName
              distance
              elapsedTime
              activityId
              activityType
              createdAt
              movingTime
              segmentCompletions
              segmentId
              sportType
              startDate
              startDateLocal
              userId
            }
            burritoPrize
            city
            country
            description
            entity
            host
            link
            location {
                lat
                lng
            }
            otherPrize
            segmentId
            startDateUTC
            state
            timezone
            title
        }
    }
  `;

  const variables = { segmentId };

  const res = await fetch(APPSYNC_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": APPSYNC_API_KEY,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch segment data");
  }

  const json = await res.json();
  return json?.data?.getSegmentBySegmentId ?? null;
}

export default async function SegmentDetailPage({
  params,
}: {
  params: { segmentId: string; };
}) {
  const segmentId = params.segmentId;

  let segmentData = null;
  let integrationData = null;
  try {

    segmentData = await fetchSegmentData(segmentId);
    console.log(segmentData, '<< data')

  } catch (err) {
    console.error("fetchSegmentData error", err);
  }

  if (!segmentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="pi pi-exclamation-triangle text-6xl text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Segment not found</h1>
          <p className="text-gray-600 dark:text-gray-400">
            The segment you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🌯 {segmentData.title}</h1>
        {segmentData.description && (
          <p className="text-gray-600 dark:text-gray-400">
            {segmentData.description}
          </p>
        )}
        {segmentData.city && (
          <p className="text-sm text-gray-500 dark:text-gray-500">
            📍 {segmentData.city}
            {segmentData.state && `, ${segmentData.state}`}
            {segmentData.country && `, ${segmentData.country}`}
          </p>
        )}
      </div>

      {/* Visualizations */}
      <div className="space-y-8 mb-8">
        {/* Activity Timeline */}
        <BurritoActivityTimeline 
          activities={segmentData.activities || []}
          title="Segment Activity Timeline"
        />

        {/* Stats Cards */}
        <BurritoStatsCards 
          activities={segmentData.activities || []}
          isGlobalView={false}
        />
      </div>

      {/* Leaderboard */}
      <SegmentEffortLeaderboard segmentId={segmentId} segmentName={segmentData.title} />
    </div>
  );
}
