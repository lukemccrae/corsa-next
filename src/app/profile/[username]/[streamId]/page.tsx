"use server";
import ProfileClient from "@/src/components/ProfileClient";
import React from "react";

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
          startTime
          unitOfMeasure
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

  const res = await fetch(APPSYNC_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": APPSYNC_API_KEY,
    },
    body: JSON.stringify({ query, variables: { username } }),
    // server side caching / revalidation for this page
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Failed fetching profile:", res.status, text);
    return null;
  }

  const json = await res.json().catch(() => null);
  console.log(json)
  return json?.data?.getUserByUserName ?? null;
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
      userData ? "found" : "not found"
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
  return <ProfileClient user={userData} username={username} streamId={streamId} />;
}
  