"use server";
import React from "react";
import BurritoMap from "@/src/components/BurritoMap";

const APPSYNC_ENDPOINT =
  "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

async function fetchSegmentData(segmentId: string) {
  const query = `
    query MyQuery {
      getSegmentsByEntity(entity: "2026_BURRITO_LEAGUE") {
      segmentId
      city
      country
      link
      state
      title
      description
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
      "x-api-key":  APPSYNC_API_KEY,
    },
    body:  JSON.stringify({ query, variables }),
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch segment data");
  }

  const json = await res. json();
  return {
    segments: json?. data?.getSegmentsByEntity ??  []
  };
}

export default async function SegmentPage({
  params,
}: {
  params: { segmentId:  string };
}) {
  const segmentId = params.segmentId;

  let segmentData = null;

  try {
    const data = await fetchSegmentData(segmentId);
    console.log(data);
    segmentData = data.segments;
  } catch (err) {
    console.error("fetchSegmentData error", err);
  }

  return <BurritoMap segments={segmentData} />;
}