"use server";
import React from "react";
import { TrackerGroup } from "@/src/generated/schema";
import GroupPageClient from "@/src/components/GroupPageClient";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { anonFetch, getAnonCreds } from "@/src/services/anon.service";

async function fetchGroupData(groupId: string) {
  console.log(groupId, "fetching group data for groupId");
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

  try {
    const anon = await getAnonCreds();
    const json = await anonFetch(query, anon, undefined, { next: { revalidate: 30 } });
    console.log(JSON.stringify(json, null, 2), "group data response");
    return json?.data?.getTrackerGroupData ?? null;
  } catch (error) {
    console.error("Failed to fetch group data:", error);
    throw error;
  }
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
