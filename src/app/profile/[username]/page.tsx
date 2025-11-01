"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BasicMap from "../../../components/BasicMap";
import SmallTrackMap from "../../../components/SmallTrackMap";
import SmallPost from "../../../components/SmallPost";
import {
  getPublishedUserInfo,
  getLivestreamByUserId,
  retrieveMapResource,
  getLiveStreams,
} from "../../../services/anon.service";
import { useUser } from "../../../context/UserContext";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { useTheme } from "../../../components/ThemeProvider";
import { Card } from "primereact/card";

/* ... rest of file above unchanged ... */
// (The top of this file up to the return is unchanged; we only modify the JSX for the right column to add compact posts under stats.)

// inside the component return, replace the right column section with the following.
// For clarity, here's the full updated return body (kept the earlier code but modified the right column to include SmallPost list):

export default function LivePage() {
  const params = useParams();
  const router = useRouter();
  const username = (params as any)?.username ?? "unknown";
  const { getAnon } = useUser();
  const { theme } = useTheme();

  const [published, setPublished] = useState<any | null>(null);
  const [live, setLive] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [gpxLoading, setGpxLoading] = useState(false);

  const [entries, setEntries] = useState<any[]>([]);
  const [entriesLoading, setEntriesLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const anon = await getAnon();
        const pub = await getPublishedUserInfo({ username, anon });
        const liveRes = await getLivestreamByUserId({ username, anon });

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

  // mock entries helper (unchanged)
  const createMockEntries = (usernameStr: string): any[] => {
    const now = Date.now();
    const profilePic = "https://i.pravatar.cc/100?img=32";
    return [
      {
        streamId: "mock-001",
        title: "Morning Ride — River Loop",
        startTime: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
        finishTime: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
        mileMarker: 18.2,
        cumulativeVert: 950,
        profilePicture: profilePic,
        routeGpxUrl: "",
        username: usernameStr,
        currentLocation: { lat: 45.525, lng: -122.68 },
      },
      {
        streamId: "mock-002",
        title: "Lunch Loop",
        startTime: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
        finishTime: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
        mileMarker: 42.5,
        cumulativeVert: 2100,
        profilePicture: profilePic,
        routeGpxUrl: "",
        username: usernameStr,
        currentLocation: { lat: 45.528, lng: -122.67 },
      },
      {
        streamId: "mock-003",
        title: "Evening Recovery",
        startTime: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
        finishTime: new Date(now - 1000 * 60 * 60 * 70).toISOString(),
        mileMarker: 7.8,
        cumulativeVert: 120,
        profilePicture: profilePic,
        routeGpxUrl: "",
        username: usernameStr,
        currentLocation: { lat: 45.522, lng: -122.675 },
      },
    ];
  };

  useEffect(() => {
    let mounted = true;

    async function loadEntries() {
      setEntriesLoading(true);
      try {
        const anon = await getAnon();
        const res = await getLiveStreams(anon);
        const list = res?.data?.getLiveStreams ?? res?.getLiveStreams ?? [];
        const filtered = (list as any[]).filter(
          (s) => s?.username === username
        );

        const sorted = filtered.sort((a, b) => {
          const ta = a?.startTime ? new Date(a.startTime).getTime() : 0;
          const tb = b?.startTime ? new Date(b.startTime).getTime() : 0;
          return tb - ta;
        });

        const finalEntries =
          sorted.length > 0 ? sorted : createMockEntries(username);

        if (!mounted) return;
        setEntries(finalEntries);
      } catch (err) {
        console.error("Failed to fetch live streams for user", err);
        if (mounted) {
          setEntries(createMockEntries(username));
        }
      } finally {
        if (mounted) setEntriesLoading(false);
      }
    }

    loadEntries();
    return () => {
      mounted = false;
    };
  }, [username, getAnon]);

  const openGPX = async (s?: any) => {
    const stream = s ?? live;
    if (!stream?.routeGpxUrl) return alert("No GPX available for this stream");
    try {
      setGpxLoading(true);
      const gpx = await retrieveMapResource(stream.routeGpxUrl);
      const blob = new Blob([gpx], { type: "application/gpx+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${username}-${stream.streamId ?? "route"}.gpx`;
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
    : [45.5231, -122.6765];

  const prettyNumber = (n?: number) => {
    if (n == null) return "—";
    if (n >= 1000) return `${Math.round(n / 100) / 10}K`;
    return `${n}`;
  };

  const formatStart = (iso?: string) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  const formatDuration = (ms: number) => {
    if (!ms || ms <= 0) return "—";
    const seconds = Math.round(ms / 1000);
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const formatPace = (durationMs?: number, miles?: number | string) => {
    if (!durationMs || !miles) return "—";
    const milesNum = Number(miles);
    if (!milesNum || milesNum <= 0) return "—";
    const totalSec = Math.round(durationMs / 1000);
    const secPerMile = Math.round(totalSec / milesNum);
    const mins = Math.floor(secPerMile / 60);
    const secs = secPerMile % 60;
    return `${mins}:${secs.toString().padStart(2, "0")} /mi`;
  };

  const generateLongTrack = (base?: {
    lat: number;
    lng: number;
  }): [number, number][] => {
    const points: [number, number][] = [];
    if (!base) {
      const start: [number, number] = [41.0, -74.0];
      for (let i = 0; i < 10; i++) {
        points.push([start[0] + i * 0.4, start[1] - i * 4.5]);
      }
      return points;
    }
    for (let i = 0; i < 10; i++) {
      const lat = base.lat + (i - 4.5) * 0.3;
      const lng = base.lng + (i - 4.5) * 3.5;
      points.push([lat, lng]);
    }
    return points;
  };

  const stats = useMemo(() => {
    if (!entries || entries.length === 0) {
      return {
        totalStreams: 0,
        totalDistance: 0,
        totalVert: 0,
        avgVert: 0,
        longestDurationMs: 0,
        longestStream: null as any,
        mostRecent: null as any,
      };
    }

    let totalDistance = 0;
    let totalVert = 0;
    let longestDurationMs = 0;
    let longestStream: any | null = null;

    entries.forEach((s) => {
      const mile = s.mileMarker != null ? Number(s.mileMarker) : NaN;
      const vert = s.cumulativeVert != null ? Number(s.cumulativeVert) : NaN;
      if (!isNaN(mile)) totalDistance += mile;
      if (!isNaN(vert)) totalVert += vert;

      if (s.startTime && s.finishTime) {
        const start = new Date(s.startTime).getTime();
        const finish = new Date(s.finishTime).getTime();
        if (!isNaN(start) && !isNaN(finish)) {
          const dur = finish - start;
          if (dur > longestDurationMs) {
            longestDurationMs = dur;
            longestStream = s;
          }
        }
      }
    });

    const avgVert = entries.length > 0 ? totalVert / entries.length : 0;
    const mostRecent = entries[0] ?? null;

    return {
      totalStreams: entries.length,
      totalDistance,
      totalVert,
      avgVert,
      longestDurationMs,
      longestStream,
      mostRecent,
    };
  }, [entries]);

  const cardBase =
    theme === "dark"
      ? "rounded-xl border p-3 bg-gray-800 dark:border-white/6 shadow"
      : "rounded-xl border p-3 bg-white border-gray-200 shadow-lg";

  const sectionHeaderClass =
    "p-3 border-b " + (theme === "dark" ? "dark:border-white/6" : "border-gray-100");

  // prepare compact posts (take up to 3 most recent entries)
  const compactPosts = entries.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Profile header (unchanged) */}
      <div className="relative">
        <div
          className={`h-60 w-full rounded-lg overflow-hidden ${
            theme === "dark"
              ? "bg-gradient-to-r from-gray-800 to-gray-900 filter brightness-90"
              : "bg-gradient-to-r from-white to-gray-100"
          } `}
          aria-hidden
        >
          <img
            src={"https://i.imgur.com/h5fqzGG.png"}
            alt={`${username} cover`}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute inset-x-0 -bottom-15 flex items-end justify-between px-6 pointer-events-none">
          <div className="pointer-events-auto">
            <Avatar
              image={published?.profilePicture ?? live?.profilePicture}
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
            <Button
              label="Follow"
              icon="pi pi-user-plus"
              className="p-button-outlined"
            />
          </div>
        </div>
      </div>

      {/* Name / handle / bio / meta (unchanged) */}
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
              <div className="flex items-center gap-2">
                <i className="pi pi-map-marker" />
                <span>Unknown location</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="pi pi-calendar" />
                <span>Joined —</span>
              </div>
            </div>

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
        </div>

        {/* Main content: entries list + map + posts */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (main) unchanged */}
          <div className="lg:col-span-2 space-y-4">
            {/* trackers list ... (same as before) */}
            <div
              className={`${
                theme === "dark"
                  ? "rounded-xl overflow-hidden shadow"
                  : "rounded-xl overflow-hidden shadow-lg border border-gray-100"
              }`}
            > 
            </div>

            <div className={`${cardBase} overflow-hidden`}>
              <div className={sectionHeaderClass}>
                <div className="text-sm font-medium">Activity</div>
              </div>

              <div className="p-4">
                {loading ? (
                  <div className="text-sm text-gray-500">Loading feed…</div>
                ) : (
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
                )}
              </div>
            </div>
          </div>

          {/* Right column (stats + compact posts) */}
          <div className="space-y-4">
            <div className={cardBase}>
              <div className={sectionHeaderClass}>
                <div className="text-sm font-medium">Stats</div>
              </div>

              <div className="p-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">
                      Total trackers
                    </span>
                    <span className="font-semibold text-lg">
                      {stats.totalStreams}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Total time</span>
                    <span className="font-semibold text-lg">
                      {stats.totalStreams}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">
                      Total distance (mi)
                    </span>
                    <span className="font-semibold text-lg">
                      {stats.totalDistance
                        ? stats.totalDistance.toFixed(1)
                        : "—"}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">
                      Total elevation (ft)
                    </span>
                    <span className="font-semibold text-lg">
                      {stats.totalVert ? Math.round(stats.totalVert) : "—"}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">
                      Avg elevation / stream
                    </span>
                    <span className="font-semibold text-lg">
                      {stats.avgVert ? Math.round(stats.avgVert) : "—"}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">
                      Avg elevation / stream
                    </span>
                    <span className="font-semibold text-lg">
                      {stats.avgVert ? Math.round(stats.avgVert) : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact posts under the stats card */}
            <div className={cardBase}>
              <div className={sectionHeaderClass}>
                <div className="text-sm font-medium">Tracker History</div>
                
              </div>

              <div className="p-3 space-y-3">
                {compactPosts.length === 0 ? (
                  <div className="text-sm text-gray-500">No posts yet.</div>
                ) : (
                  compactPosts.map((p) => {
                    const base = p.currentLocation ?? { lat: 45.5231, lng: -122.6765 };
                    const pts = generateLongTrack(base);
                    return (
                      <SmallPost
                        key={p.streamId ?? p.startTime}
                        post={p}
                        points={pts}
                        href={"/live/" + p.username + '/3'}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}