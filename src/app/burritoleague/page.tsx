import React from "react";
import BurritoMap from "@/src/components/BurritoMap";
import { Segment } from "@/src/generated/schema";
import type { Metadata } from 'next';
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { anonFetch } from "@/src/services/anon.service";

export const metadata: Metadata = {
  title: '🌯 Burrito League - CORSA',
  description: 'Join the Burrito League and compete on segments across the globe',
  openGraph: {
    title: '🌯 Burrito League - CORSA',
    description: 'Join the Burrito League and compete on segments across the globe',
    images: [
      {
        url: 'https://i.imgur.com/gZiA2pq.png', // Your burrito league image
        width: 1200,
        height: 630,
        alt: 'Burrito League',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🌯 Burrito League - CORSA',
    description: 'Join the Burrito League and compete on segments across the globe',
    images: ['https://i.imgur.com/gZiA2pq.png'],
  },
};

async function getAnonCreds() {
  const credentialsProvider = fromCognitoIdentityPool({
    identityPoolId: "us-west-1:495addf9-156d-41fd-bf55-3c576a9e1c5e",
    clientConfig: { region: "us-west-1" },
  });
  return await credentialsProvider();
}

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

  try {
    const anon = await getAnonCreds();
    const json = await anonFetch(query, anon);
    return {
      segments: json?.data?.getSegmentsByEntity ?? []
    };
  } catch (error) {
    console.error("Failed to fetch segment data:", error);
    throw error;
  }
}

export default async function BurritoLeaguePage() {
  let segmentData = null;

  try {
    const data = await fetchSegmentData();
    console.log(data);
    segmentData = data.segments.filter(
          (segment: Segment) => segment.title !== "ATY TEST"
        );;
  } catch (err) {
    console.error("fetchSegmentData error", err);
  }
  // return <div>Coming soon...</div>;
  return <BurritoMap segments={segmentData || []} />;

}