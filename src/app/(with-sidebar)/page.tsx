"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { LiveStream, TrackerGroup } from "@/src/generated/schema";
import { redirect } from "next/navigation";

const FullScreenMap = dynamic(() => import("../../components/BasicMap"), {
  ssr: false,
});

const APPSYNC_ENDPOINT = "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

export default function Home() {
  const [livestreams, setLivestreams] = useState<LiveStream[]>([]);
  const [groups, setGroups] = useState<TrackerGroup[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([45.5231, -122.6765]);

  useEffect(() => {
    async function fetchData() {
      try {
        const query = `
          query MyQuery {
            getAllTrackerGroups {
              name
              user {
                profilePicture
                username
                live
              }
              groupId
              currentLocation {
                lat
                lng
              }
            }
            getStreamsByEntity(entity: "STREAM") {
              fullRouteData
              streamId
              routeGpxUrl
              live
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

        const response = await fetch(APPSYNC_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": APPSYNC_API_KEY,
          },
          body: JSON.stringify({ query }),
        });

        const { data } = await response.json();
        
        const streams = data?. getStreamsByEntity || [];
        const trackerGroups = data?.getAllTrackerGroups || [];
        
        setLivestreams(streams);
        setGroups(trackerGroups);

        // Center map on first live stream with location
        const liveStream = streams.find(
          (s:  LiveStream) => s.live && s.currentLocation
        );
        if (liveStream?. currentLocation) {
          setMapCenter([
            liveStream.currentLocation. lat,
            liveStream. currentLocation.lng,
          ]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
    
    // Refresh every 30 seconds
    // replace this with a socket subscription to the mutation
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-screen">
      <FullScreenMap
        center={mapCenter}
        zoom={6}
        livestreams={livestreams}
        groups={groups}
      />
    </div>
  );
}