"use server";
import React from "react";
import { TrackerGroup } from "@/src/generated/schema";
import GroupPageClient from "@/src/components/GroupPageClient";

const APPSYNC_ENDPOINT =
  "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

async function fetchGroupData(groupId: string) {
  const query = `
    query MyQuery {
      getTrackerGroupData(groupId: "${groupId}") {
        groupId
        name
        currentLocation {
          lat
          lng
        }
        user {
          username
          userId
          profilePicture
        }
        livestreams {
          user {
            username
            userId
            profilePicture
          }
          streamId
          title
          startTime
          finishTime
          mileMarker
          currentLocation {
            lat
            lng
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
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch group data");
  }

  const json = await res.json();
  console.log(JSON.stringify(json, null, 2), "group data response");
  const user = json?.data?.getTrackerGroupData ?? null;
  return user;
}

export default async function GroupPage({
  params,
}: {
  params: { username: string; id: string };
}) {
  const username = params.username;
  const groupId = params.id;
  console.log(groupId, "GroupPage params groupId");

  let groupData = null;

  try {
    groupData = await fetchGroupData(groupId);
    console.log(groupData, "fetched group data");
  } catch (err) {
    console.error("fetchGroupData error", err);
    groupData = null;
  }

  if (!groupData) {
    return <div className="p-8 text-center">Group not found</div>;
  }

  const group = groupData;

  return (
    <GroupPageClient group={group} username={username} groupId={groupId} />
  );
}
