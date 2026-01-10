"use server";
import SegmentEffortLeaderboard from "@/src/components/SegmentLeaderboard";
import React from "react";

const APPSYNC_ENDPOINT =
  "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

async function fetchSegmentData(segmentId: string) {
  const query = `
query GetSegmentBySegmentId {
  getSegmentBySegmentId(segmentId: "${segmentId}") {
    segmentId
    title
    description
    city
    country
    state
    link
    location {
      lat
      lng
    }
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
  params: { segmentId: string };
}) {
  const segmentId = params.segmentId;

  let segmentData = null;

  try {
    segmentData = await fetchSegmentData(segmentId);

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
    <div>
      <SegmentEffortLeaderboard segmentId={segmentId} segmentName={segmentData.title}/>
    </div>
  );
}
