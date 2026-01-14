"use server";
import LiveProfileClient from "@/src/components/LiveProfileClient";
import SegmentEffortLeaderboard from "@/src/components/SegmentLeaderboard";
import { useUser } from "@/src/context/UserContext";
import React, { use } from "react";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { anonFetch, getAnonCreds } from "@/src/services/anon.service";

/**
 * Server page for /burritoleague/[segmentId]
 *
 * - Fetches segment data server-side using anonymous credentials.
 * - Renders the segment leaderboard component.
 */

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

  try {
    const anon = await getAnonCreds();
    const json = await anonFetch(query, anon, undefined, { next: { revalidate: 30 } });
    return json?.data?.getSegmentBySegmentId ?? null;
  } catch (error) {
    console.error("fetchSegmentData error:", error);
    throw error;
  }
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
      <SegmentEffortLeaderboard segmentId={segmentId} segmentName={segmentData.title} />
    </div>
  );
}
