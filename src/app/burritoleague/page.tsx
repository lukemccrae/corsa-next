import React from "react";
import BurritoMap from "@/src/components/BurritoMap";
import { Segment } from "@/src/generated/schema";
import type { Metadata } from "next";
import BurritoLeagueStats from "@/src/components/BurritoLeagueStats";

export const metadata: Metadata = {
  title: "🌯 Burrito League - CORSA",
  description:
    "Connect with others in the Burrito League",
  openGraph: {
    title: "🌯 Burrito League - CORSA",
    description:
      "Connect with others in the Burrito League",
    images: [
      {
        url: "https://i.imgur.com/gZiA2pq.png", // Your burrito league image
        width: 1200,
        height: 630,
        alt: "Burrito League",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "🌯 Burrito League - CORSA",
    description:
      "Connect with others in Burrito League",
    images: ["https://i.imgur.com/gZiA2pq.png"],
  },
};

const APPSYNC_ENDPOINT =
  "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

async function fetchSegmentData() {
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

  const res = await fetch(APPSYNC_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": APPSYNC_API_KEY,
    },
    body: JSON.stringify({ query }),
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch segment data");
  }

  const json = await res.json();
  return {
    segments: json?.data?.getSegmentsByEntity ?? [],
  };
}

export default async function BurritoLeaguePage() {
  let segmentData = null;

  try {
    const data = await fetchSegmentData();
    console.log(data);
    segmentData = data.segments.filter(
      (segment: Segment) => segment.title !== "ATY TEST"
    );
  } catch (err) {
    console.error("fetchSegmentData error", err);
  }
  // return <div>Coming soon...</div>;

  return (
    <>
      <BurritoMap segments={segmentData || []} />
      {/* <BurritoLeagueStats
        segmentName="Burrito League"
      /> */}
    </>
  )
}
