"use server";
import React from "react";
import type { Metadata } from "next";
import SegmentLoginClient from "@/src/components/SegmentLoginClient";

const APPSYNC_ENDPOINT =
  process.env.APPSYNC_ENDPOINT ??
  "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY =
  process.env.APPSYNC_API_KEY ?? "da2-5f7oqdwtvnfydbn226e6c2faga";

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
  return json?.data?.getSegmentBySegmentId ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: { segmentId: string };
}): Promise<Metadata> {
  const segmentData = await fetchSegmentData(params.segmentId);

  if (!segmentData) {
    return {
      title: "Login - Burrito League",
    };
  }

  const location = [segmentData.city, segmentData.state, segmentData.country]
    .filter(Boolean)
    .join(", ");

  return {
    title: `Join ${segmentData.title} - Burrito League 🌯`,
    description: `Sign in to compete on ${segmentData.title}${
      location ? ` in ${location}` : ""
    } - Part of the Burrito League`,
    openGraph: {
      title: `Join ${segmentData.title} - Burrito League 🌯`,
      description: `Sign in to compete on this segment${
        location ? ` in ${location}` : ""
      }`,
      images: [
        {
          url: "https://i.imgur.com/gZiA2pq.png",
          width: 1200,
          height: 630,
          alt: "Burrito League",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Join ${segmentData.title} - Burrito League 🌯`,
      description: `Sign in to compete on this segment${
        location ? ` in ${location}` : ""
      }`,
      images: ["https://i.imgur.com/gZiA2pq. png"],
    },
  };
}

export default async function SegmentLoginPage({
  params,
}: {
  params: { segmentId: string };
}) {
  const segmentData = await fetchSegmentData(params.segmentId);

  return (
    <>
      <SegmentLoginClient
        segmentId={params.segmentId}
        segmentName={segmentData?.title}
      />
    </>
  );
}
