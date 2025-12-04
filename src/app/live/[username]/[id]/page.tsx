"use server";
import React from "react";
import LivePageClient from "../../../../components/LivePageClient";
import { User } from "@/src/types/graphql";

const APPSYNC_ENDPOINT =
  "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

async function fetchUserDataForStream(username: string, streamId: string) {
  const query = `
    query MyQuery {
      getUserByUserName(username: "${username}") {
        userId
        username
        profilePicture
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
    throw new Error("Failed to fetch live stream data");
  }

  const json = await res.json();
  console.log(json, '<< json')
  const user = json?.data?.getUserByUserName;
  return user;
}

export default async function LivePage({
  params,
}: {
  params: { username: string; id: string };
}) {
  const username = params.username;
  const streamId = params.id;

  let streamData: User | null = null;

  try {
    streamData = await fetchUserDataForStream(username, streamId);
  } catch (err) {
    console.error("fetchUserDataForStream error", err);
    streamData = null;
  }

  if (!streamData) {
    return <div className="p-6">Stream not found</div>;
  }

  // Normalize points and chat messages so the client component receives stable props
  const initialPoints = streamData.liveStreams?.[0]?.waypoints ?? []
  const initialMessages = streamData.liveStreams?.[0]?.chatMessages ?? [];

  return (
    // Pass the server-fetched data to the client component as props.
    // The client component will hold local state, manage interactions, and render LiveMap / LiveStats / LiveChat.
    <LivePageClient
      username={username}
      streamId={streamId}
      initialStream={streamData}
      initialPoints={initialPoints}
      initialMessages={initialMessages}
    />
  );
}
