"use server";
import React from "react";
import LivePageClient from "../../../../components/LivePageClient";

const APPSYNC_ENDPOINT =
  "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

async function fetchLiveStream(username: string, streamId: string) {
  console.log(streamId, "<< id");
  const query = `
    query MyQuery {
      getUserByUserName(username: "${username}") {
        userId
        username
        liveStreams(streamId: "${streamId}") {
          delayInSeconds
          deviceLogo
        }
      }
    }
  `;
  console.log(query);

  const res = await fetch(APPSYNC_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": APPSYNC_API_KEY,
    },
    body: JSON.stringify({ query }),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch live stream");
  }

  const json = await res.json();
  console.log(json, "<> hi");
  // The response shape: json.data.getUserByUserName.liveStreams is an array
  const streams = json?.data?.getUserByUserName?.liveStreams ?? [];
  const stream = Array.isArray(streams) ? streams[0] ?? null : streams;
  return stream;
}

export default async function LivePage({
  params,
}: {
  params: { username: string; id: string };
}) {
  const username = params.username;
  const streamId = params.id;

  let stream: any = null;

  try {
    stream = await fetchLiveStream(username, streamId);
    console.log(stream, username, streamId);
  } catch (err) {
    console.error("fetchLiveStream error", err);
    stream = null;
  }

  if (!stream) {
    return <div className="p-6">Stream not found</div>;
  }

  // Normalize points and chat messages so the client component receives stable props
  const initialPoints = stream.points ?? stream.waypoints ?? [];
  const initialMessages = stream.chatMessages ?? [];

  return (
    // Pass the server-fetched data to the client component as props.
    // The client component will hold local state, manage interactions, and render LiveMap / LiveStats / LiveChat.
    <LivePageClient
      username={username}
      streamId={streamId}
      initialStream={stream}
      initialPoints={initialPoints}
      initialMessages={initialMessages}
    />
  );
}
