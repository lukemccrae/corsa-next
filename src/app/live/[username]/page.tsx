"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BasicMap from "../../../components/BasicMap";
import { getPublishedUserInfo, getLivestreamByUserId, retrieveMapResource } from "../../../services/anon.service";
import { useUser } from "../../../context/UserContext";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { useTheme } from "../../../components/ThemeProvider";

type PublishedInfo = {
  profilePicture?: string;
  bio?: string;
  plans?: any[];
};

type LiveStream = {
  currentLocation?: { lat: number; lng: number };
  profilePicture?: string;
  streamId?: string;
  title?: string;
  startTime?: string;
  finishTime?: string;
  timezone?: string;
  delayInSeconds?: number;
  unitOfMeasure?: string;
  username?: string;
  deviceLogo?: string;
  lastSeen?: string;
  routeGpxUrl?: string;
  mileMarker?: number;
  cumulativeVert?: number;
};

export default function LivePage() {
  const params = useParams();
  const username = (params as any)?.username ?? "unknown";
  const { getAnon } = useUser();
  const { theme } = useTheme();

  const [published, setPublished] = useState<PublishedInfo | null>(null);
  const [live, setLive] = useState<LiveStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [gpxLoading, setGpxLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const anon = await getAnon();
        const pub = await getPublishedUserInfo({ username, anon });
        const liveRes = await getLivestreamByUserId({ username, anon });

        // The GraphQL responses are returned with a top-level data property
        // but the anonFetch wrapper returns whatever the API returns, so guard carefully.
        const pubData = pub?.data?.getPublishedUserInfo ?? pub?.getPublishedUserInfo ?? null;
        const liveData = liveRes?.data?.getLiveStreamByUserId ?? liveRes?.getLiveStreamByUserId ?? null;

        if (!mounted) return;
        setPublished(pubData);
        setLive(liveData);
      } catch (err) {
        console.error("Failed to fetch live user data", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [username, getAnon]);

  const openGPX = async () => {
    if (!live?.routeGpxUrl) return alert("No GPX available for this stream");
    try {
      setGpxLoading(true);
      const gpx = await retrieveMapResource(live.routeGpxUrl);
      // show the GPX text in a new tab for quick download / inspection
      const blob = new Blob([gpx], { type: "application/gpx+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${username}-route.gpx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("GPX retrieval failed", e);
      alert("Failed to download GPX");
    } finally {
      setGpxLoading(false);
    }
  };

  const center: [number, number] = live?.currentLocation
    ? [live.currentLocation.lat, live.currentLocation.lng]
    : [45.5231, -122.6765]; // fallback to Portland center for a neutral map

  const prettyNumber = (n?: number) => {
    if (n == null) return "—";
    if (n >= 1000) return `${Math.round(n / 100) / 10}K`;
    return `${n}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Profile header (Twitter-like) */}
      <div className="relative rounded-lg overflow-hidden">
        <div
          className={`h-40 w-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 ${
            theme === "dark" ? "filter brightness-90" : ""
          }`}
          aria-hidden
        >
          {/* Use deviceLogo / profile image as faint cover if available */}
          {live?.deviceLogo && (
            <img
              src={live.deviceLogo}
              alt={`${username} cover`}
              className="w-full h-full object-cover opacity-30"
            />
          )}
        </div>

        {/* Avatar + follow button */}
        <div className="absolute left-6 -bottom-12 flex items-center gap-4">
          <Avatar
            image={published?.profilePicture ?? live?.profilePicture}
            label={(!published?.profilePicture && !live?.profilePicture) ? username?.charAt(0).toUpperCase() : undefined}
            size="xlarge"
            shape="circle"
            className="!w-28 !h-28 ring-4 ring-white dark:ring-gray-900"
          />
        </div>

        <div className="absolute right-6 -bottom-10">
          <div className="flex items-center gap-2">
            <Button icon="pi pi-ellipsis-h" className="p-button-rounded p-button-text" />
            <Button label="Follow" icon="pi pi-user-plus" className="p-button-outlined" />
          </div>
        </div>
      </div>

      {/* Name / handle / bio / meta */}
      <div className="mt-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{username}</h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">@{username}</div>
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 max-w-2xl">
              {published?.bio ?? "No bio provided."}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              {/* Location / Joined items — placeholders where data is missing */}
              <div className="flex items-center gap-2">
                <i className="pi pi-map-marker" />
                <span>Unknown location</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="pi pi-calendar" />
                <span>Joined —</span>
              </div>
            </div>

            {/* Stats row like Twitter */}
            <div className="mt-4 flex items-center gap-6">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
                <div className="font-semibold">{prettyNumber(151)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
                <div className="font-semibold">{prettyNumber(2264)}</div>
              </div>
            </div>
          </div>

          {/* Right column: live summary */}
          <div className="w-full md:w-64">
            <div className="rounded-xl border p-3 bg-white dark:bg-gray-800 dark:border-white/6">
              <div className="text-xs text-gray-500 dark:text-gray-400">Live status</div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${live ? "bg-red-500" : "bg-gray-400"}`} />
                <div className="text-sm font-medium">{live ? "Live now" : "Offline"}</div>
              </div>

              <Divider className="my-2" />

              <div className="text-xs text-gray-500 dark:text-gray-400">Stream</div>
              <div className="font-semibold">{live?.title ?? "No active stream"}</div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-xs text-gray-400">Distance</div>
                  <div className="font-medium">{live?.mileMarker ? `${live.mileMarker} mi` : "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Vert</div>
                  <div className="font-medium">{live?.cumulativeVert ? `${live.cumulativeVert} m` : "—"}</div>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Button label="Open GPX" icon="pi pi-download" onClick={openGPX} loading={gpxLoading} disabled={!live?.routeGpxUrl} />
                <Button label="View Live" icon="pi pi-map" className="p-button-text" onClick={() => { /* could open map modal */ }} />
              </div>
            </div>
          </div>
        </div>

        {/* Main content: map + posts (left), stats / sidebar (right) */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (main) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl overflow-hidden shadow">
              <div className="p-3 border-b bg-white dark:bg-gray-800 dark:border-white/6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Map</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{live?.username}</div>
                </div>
              </div>
              <div className="h-96">
                <BasicMap center={center} zoom={12} className="h-full w-full" />
              </div>
            </div>

            {/* Posts / tweets-style feed (placeholder) */}
            <div className="rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow">
              <div className="p-3 border-b dark:border-white/6">
                <div className="text-sm font-medium">Posts</div>
              </div>

              <div className="p-4">
                {loading ? (
                  <div className="text-sm text-gray-500">Loading feed…</div>
                ) : (
                  <>
                    <article className="flex gap-3">
                      <Avatar image={published?.profilePicture} size="large" shape="circle" className="!w-12 !h-12" />
                      <div className="flex-1">
                        <div className="text-sm">
                          <strong>{username}</strong>{" "}
                          <span className="text-xs text-gray-500 dark:text-gray-400">@{username} · 5h</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                          Live tracking demo post — position updates, stats and GPX download available on the right.
                        </p>
                        <div className="mt-2 flex items-center gap-6 text-xs text-gray-500">
                          <div className="flex items-center gap-1"><i className="pi pi-comment" /> 3</div>
                          <div className="flex items-center gap-1"><i className="pi pi-retweet" /> 12</div>
                          <div className="flex items-center gap-1"><i className="pi pi-heart" /> 88</div>
                        </div>
                      </div>
                    </article>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right column (sidebar) */}
          <aside className="space-y-4">
            <div className="rounded-xl border p-3 bg-white dark:bg-gray-800 dark:border-white/6">
              <div className="text-sm font-medium">About</div>
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">{published?.bio ?? "No bio available."}</div>
              <Divider className="my-2" />
              <div className="text-xs text-gray-500">Metadata</div>
              <div className="mt-2 text-sm">
                <div className="flex justify-between"><span>Started</span><span className="font-medium">{live?.startTime ?? "—"}</span></div>
                <div className="flex justify-between"><span>Last seen</span><span className="font-medium">{live?.lastSeen ?? "—"}</span></div>
                <div className="flex justify-between"><span>Timezone</span><span className="font-medium">{live?.timezone ?? "—"}</span></div>
              </div>
            </div>

            <div className="rounded-xl border p-3 bg-white dark:bg-gray-800 dark:border-white/6">
              <div className="text-sm font-medium">Activity</div>
              <div className="mt-2 text-sm">
                <div className="flex justify-between text-gray-500"><span>Streams</span><span className="font-medium">1</span></div>
                <div className="flex justify-between text-gray-500 mt-1"><span>Plans</span><span className="font-medium">{published?.plans?.length ?? 0}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}