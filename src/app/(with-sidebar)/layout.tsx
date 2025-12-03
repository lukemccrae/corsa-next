import React from "react";
import Sidebar, { Channel } from "../../components/Sidebar";

/**
 * Server layout that fetches streams by "entity" and passes them into the Sidebar.
 *
 * Notes:
 * - This file runs on the server — it uses process.env for secrets.
 * - You must provide APPSYNC_ENDPOINT and APPSYNC_API_KEY (server env) that permit the query.
 *   e.g. in .env.local:
 *     APPSYNC_ENDPOINT=https://your-appsync-id.appsync-api.us-west-1.amazonaws.com/graphql
 *     APPSYNC_API_KEY=da2-...
 *
 * - The GraphQL query uses getStreamsByEntity(entity: ID) from your schema (see src/types/graphql.ts).
 * - Adjust the entity id (ENTITY_ID env) to whatever entity you want to scope streams to.
 */

const APPSYNC_ENDPOINT = "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";
const DEFAULT_ENTITY = "STREAM";

async function fetchStreamsByEntity(entity: string | undefined) {
  if (!APPSYNC_ENDPOINT || !APPSYNC_API_KEY) {
    console.warn("APPSYNC_ENDPOINT or APPSYNC_API_KEY not configured; returning empty stream list");
    return [];
  }

  const query = `
    query MyQuery {
      getStreamsByEntity(entity: "STREAM") {
        fullRouteData
        routeGpxUrl
        username
        profilePicture
        live
        routeGpxUrl
        slug
        currentLocation {
          lat
          lng
        }
      }
    }
  `;
  console.log(query)
  console.log(APPSYNC_API_KEY)
  const variables = { entity };

  const res = await fetch(APPSYNC_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": APPSYNC_API_KEY,
    },
    body: JSON.stringify({ query, variables }),
    // cache/revalidate as appropriate for your app
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    console.error("Failed to fetch streams:", await res.text());
    return [];
  }

  const json = await res.json();
  console.log(json, '<< json')
  const list = json?.data?.getStreamsByEntity ?? [];
  return list;
}

export default async function WithSidebarLayout({ children }: { children: React.ReactNode }) {
  // run server-side fetch and map to Sidebar Channel shape
  const raw = await fetchStreamsByEntity(DEFAULT_ENTITY || undefined);
  const livestreams: Channel[] = Array.isArray(raw)
    ? raw.map((s: any) => ({
      id: s.streamId ?? String(Math.random()).slice(2),
      name: s.username ?? (s.streamId ?? "unknown"),
      subtitle: s.title ?? null,
      avatar: s.profilePicture ?? null,
      live: !!s.live,
      viewers: s.viewers ?? null,
      currentLocation: s.currentLocation ?? null,
    }))
    : [];

  return (
    <div className="flex h-full w-full min-h-0">
      <Sidebar livestreams={livestreams} />
      <div className="flex-1 min-h-0 overflow-auto">
        {children}
      </div>
    </div>
  );
}