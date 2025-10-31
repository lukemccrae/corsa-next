"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BasicMap from "../../../components/BasicMap";
import {
  getPublishedUserInfo,
  getLivestreamByUserId,
  retrieveMapResource,
} from "../../../services/anon.service";
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
        const pubData =
          pub?.data?.getPublishedUserInfo ?? pub?.getPublishedUserInfo ?? null;
        const liveData =
          liveRes?.data?.getLiveStreamByUserId ??
          liveRes?.getLiveStreamByUserId ??
          null;

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

  // Shared card classes for consistent elevation and outline
  const cardBase =
    theme === "dark"
      ? "rounded-xl border p-3 bg-gray-800 dark:border-white/6 shadow"
      : "rounded-xl border p-3 bg-white border-gray-200 shadow-lg";

  const sectionHeaderClass =
    "p-3 border-b " +
    (theme === "dark" ? "dark:border-white/6" : "border-gray-100");

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Profile header (Twitter-like)
          NOTE: avatar was previously being clipped because the cover wrapper used overflow-hidden.
          Fix: keep the cover element itself rounded/overflow-hidden, but place the avatar in an absolutely
          positioned sibling so it can overlap the cover without being clipped.
      */}
      <div className="relative">
        <div
          className={`h-60 w-full rounded-lg overflow-hidden ${
            theme === "dark"
              ? "bg-gradient-to-r from-gray-800 to-gray-900 filter brightness-90"
              : "bg-gradient-to-r from-white to-gray-100"
          } `}
          aria-hidden
        >
          {/* Use deviceLogo / profile image as faint cover if available */}
          {
            <img
              src={"https://i.imgur.com/h5fqzGG.png"}
              alt={`${username} cover`}
              className="w-full h-full object-cover"
            />
          }
        </div>

        {/* Avatar + follow button — positioned so it overlaps the cover but is not clipped */}
        <div className="absolute inset-x-0 -bottom-15 flex items-end justify-between px-6 pointer-events-none">
          <div className="pointer-events-auto">
            <Avatar
              image={"https://i.imgur.com/iOtuPi3.jpeg"}
              label={
                !published?.profilePicture && !live?.profilePicture
                  ? username?.charAt(0).toUpperCase()
                  : undefined
              }
              size="xlarge"
              shape="circle"
              className="!w-28 !h-28 ring-2 ring-white dark:ring-gray-900 shadow"
            />
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            {/* <Button
              icon="pi pi-ellipsis-h"
              className="p-button-rounded p-button-text"
            /> */}
            <Button
              label="Follow"
              icon="pi pi-user-plus"
              className="p-button-outlined"
            />
          </div>
        </div>
      </div>

      {/* Name / handle / bio / meta */}
      <div className="mt-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{username}</h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              @{username}
            </div>
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
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Following
                </div>
                <div className="font-semibold">{prettyNumber(151)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Followers
                </div>
                <div className="font-semibold">{prettyNumber(2264)}</div>
              </div>
            </div>
          </div>

          {/* Right column: live summary */}
          
        </div>

        {/* Main content: map + posts (left), stats / sidebar (right) */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (main) */}
          <div className="lg:col-span-2 space-y-4">
            <div
              className={`${
                theme === "dark"
                  ? "rounded-xl overflow-hidden shadow"
                  : "rounded-xl overflow-hidden shadow-lg border border-gray-100"
              }`}
            >
              <div className={sectionHeaderClass}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Entries</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {live?.username}
                  </div>
                </div>
              </div>
              <div className="h-96">
                <BasicMap center={center} zoom={12} className="h-full w-full" />
              </div>
            </div>

            {/* Posts / tweets-style feed (placeholder) */}
            <div className={`${cardBase} overflow-hidden`}>
              <div className={sectionHeaderClass}>
                <div className="text-sm font-medium">Posts</div>
              </div>

              <div className="p-4">
                {loading ? (
                  <div className="text-sm text-gray-500">Loading feed…</div>
                ) : (
                  <>
                    <article className="flex gap-3">
                      <Avatar
                        image={published?.profilePicture}
                        size="large"
                        shape="circle"
                        className="!w-12 !h-12"
                      />
                      <div className="flex-1">
                        <div className="text-sm">
                          <strong>{username}</strong>{" "}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            @{username} · 5h
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                          Live tracking demo post — position updates, stats and
                          GPX download available on the right.
                        </p>
                        <div className="mt-2 flex items-center gap-6 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <i className="pi pi-comment" /> 3
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="pi pi-retweet" /> 12
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="pi pi-heart" /> 88
                          </div>
                        </div>
                      </div>
                    </article>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
