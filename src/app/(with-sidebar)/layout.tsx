import React from "react";
import Sidebar from "../../components/Sidebar";
import { LiveStream } from "@/src/generated/schema";
import { TrackerGroup } from "@/src/generated/schema";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { anonFetch, getAnonCreds } from "@/src/services/anon.service";

/**
 * Server layout that fetches streams by "entity" and passes them into the Sidebar.
 *
 * Notes:
 * - This file runs on the server using anonymous AWS Cognito credentials.
 * - The GraphQL query uses getStreamsByEntity(entity: ID) from your schema (see src/types/graphql.ts).
 * - Adjust the entity id (ENTITY_ID env) to whatever entity you want to scope streams to.
 */

const DEFAULT_ENTITY = "STREAM";

async function fetchStreamsByEntity(entity:  string | undefined) {
  const query = `
    query MyQuery {
      getStreamsByEntity(entity: "STREAM") {
        streamId
        routeGpxUrl
        live
        routeGpxUrl
        title
        username
        profilePicture
        slug
        currentLocation {
          lat
          lng
        }
      }
    }
  `;

  try {
    const anon = await getAnonCreds();
    const json = await anonFetch(query, anon, undefined, { next: { revalidate: 30 } });
    console.log(json, '<< json');
    
    return {
      streams: json?.data?.getStreamsByEntity ??  [],
      groups: json?.data?.getAllTrackerGroups ?? []
    };
  } catch (error) {
    console.error("Failed to fetch streams:", error);
    return { streams: [], groups: [] };
  }
}

export default async function WithSidebarLayout({ children }: { children: React. ReactNode }) {
  // run server-side fetch and map to Sidebar Channel shape
  const { streams, groups } = await fetchStreamsByEntity(DEFAULT_ENTITY || undefined);
  return (
    <div className="flex h-full w-full min-h-0">
      <Sidebar groups={groups} livestreams={streams} />
      <div className="flex-1 min-h-0 overflow-auto">
        {children}
      </div>
    </div>
  );
}