"use server";
import LiveProfileClient from "@/src/components/LiveProfileClient";
import React from "react";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { anonFetch } from "@/src/services/anon.service";

/**
 * Server page for /profile/[username]/[streamId]
 *
 * - Fetches user (and associated liveStreams / posts) server-side using anonymous credentials.
 * - Renders a small client wrapper (LiveProfileClient) to host the interactive bits.
 */

async function getAnonCreds() {
  const credentialsProvider = fromCognitoIdentityPool({
    identityPoolId: "us-west-1:495addf9-156d-41fd-bf55-3c576a9e1c5e",
    clientConfig: { region: "us-west-1" },
  });
  return await credentialsProvider();
}

async function fetchProfile(username: string, streamId: string) {
  const query = `
    query MyQuery {
      getUserByUserName(username: "${username}") {
        username
        profilePicture
        streamId
        bio
        live
        liveStreams(streamId: "${streamId}") {
          streamId
          mileMarker
          title
          timezone
          startTime
          unitOfMeasure
          startTime
          currentLocation {
            lat
            lng
          }
          finishTime
          chatMessages {
            text
            username
            createdAt
            profilePicture
          }
          waypoints {
            lat
            lng
            altitude
            mileMarker
            timestamp
          }
        }
      }
    }
  `;

  try {
    const anon = await getAnonCreds();
    const json = await anonFetch(query, anon);
    console.log(json);
    return json?.data?.getUserByUserName ?? null;
  } catch (error) {
    console.error("Failed fetching profile:", error);
    return null;
  }
}

export default async function ProfilePage({
  params,
}: {
  params: { username: string; streamId: string };
}) {
  const username = params?.username ?? "unknown";
  const streamId = params?.streamId ?? "unknown";

  let userData = null;
  try {
    userData = await fetchProfile(username, streamId);
    console.log(
      "Fetched profile for",
      username,
      userData
    );
  } catch (err) {
    console.error("fetchProfile error", err);
    userData = null;
  }

  if (!userData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="text-center text-gray-500">Profile not found</div>
      </div>
    );
  }

  // Render a client component and pass the server-fetched snapshot to it.
  // The client component will manage interactivity (theme, modals, navigation).
  return (
    <LiveProfileClient
      user={userData}
      stream={userData.liveStreams?.[0]}
    />
  );
}
