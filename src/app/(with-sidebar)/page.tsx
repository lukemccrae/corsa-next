"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { LiveStream, TrackerGroup } from "@/src/generated/schema";
import { anonFetch, getAnonCreds } from "@/src/services/anon.service";

const FullScreenMap = dynamic(() => import("../../components/BasicMap"), {
  ssr: false,
});

export default function Home() {
  const [livestreams, setLivestreams] = useState<LiveStream[]>([]);
  const [groups, setGroups] = useState<TrackerGroup[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    45.5231, -122.6765,
  ]);

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

        const anon = await getAnonCreds();
        const data = await anonFetch(query, anon);
        console.log(data, '<< data')

        const streams = data?.getStreamsByEntity || [];
        const trackerGroups = data?.getAllTrackerGroups || [];

        setLivestreams(streams);
        setGroups(trackerGroups);
        console.log(livestreams, '<< livestreams')

        // Center map on first live stream with location
        const liveStream = streams.find(
          (s: LiveStream) => s.live && s.currentLocation
        );
        if (liveStream?.currentLocation) {
          setMapCenter([
            liveStream.currentLocation.lat,
            liveStream.currentLocation.lng,
          ]);
        }
      } catch (error) {
        console.error("fetchSegmentData error:", error);
        throw error;
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
