"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import LiveButton from "@/src/components/LiveButton";

/*
  Simplified LivePage feed

  - Show only correspondence (comments) and notes from the author (text posts).
  - Track entries are still loaded (for stats) but they are not shown in the main feed.
  - Right column compact history shows up to 3 of the author's text notes.
  - Added: generic "tracker" feed items that represent a point/marker associated with a session.
*/

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
        type: "tracker",
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
        type: "tracker",
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
        type: "tracker",
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
    "p-3 border-b " +
    (theme === "dark" ? "dark:border-white/6" : "border-gray-100");

  // --- New: create comment/text mock helpers so feed can include correspondence and author notes ---
  const createMockComments = (usernameStr: string, streamIds: string[]) => {
    const now = Date.now();
    const comments: any[] = [
      {
        id: `c-${now - 1000 * 60 * 40}`,
        type: "comment",
        username: "fan_amy",
        profilePicture: "https://i.pravatar.cc/100?img=5",
        createdAt: new Date(now - 1000 * 60 * 40).toISOString(),
        text: "Amazing notes — helped me plan my ride, thanks!",
        streamId: streamIds[0] ?? undefined,
      },
      {
        id: `c-${now - 1000 * 60 * 90}`,
        type: "comment",
        username: "coach_rob",
        profilePicture: "https://i.pravatar.cc/100?img=12",
        createdAt: new Date(now - 1000 * 60 * 90).toISOString(),
        text: "Nice strategy — would you share the elevation profile?",
        streamId: streamIds[0] ?? undefined,
      },
    ];
    return comments;
  };

  const createMockTextPosts = (usernameStr: string) => {
    const now = Date.now();
    return [
      {
        id: `t-${now - 1000 * 60 * 60 * 6}`,
        type: "text",
        username: usernameStr,
        profilePicture:
          published?.profilePicture ??
          live?.profilePicture ??
          "https://i.pravatar.cc/100?img=32",
        createdAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
        title: "Notes — Pre-ride strategy",
        text: "Planning a steady 50-mile route. Focus on fueling every 30 minutes and keeping cadence above 75.",
      },
      {
        id: `t-${now - 1000 * 60 * 60 * 30}`,
        type: "text",
        username: usernameStr,
        profilePicture:
          published?.profilePicture ??
          live?.profilePicture ??
          "https://i.pravatar.cc/100?img=32",
        createdAt: new Date(now - 1000 * 60 * 60 * 30).toISOString(),
        title: "Post-ride reflection",
        text: "Great day on the bike — learned that hydration timing mattered more than I expected.",
      },
    ];
  };

  // New helper: create generic "tracker" events for sessions
  // Waypoints are more general than a 'started' event and can include coordinates,
  // mile marker, elevation, and a short message. They'll be shown inline in the feed.
  const createWaypointEvents = (streams: any[]) => {
    return (streams || [])
      .filter((s) => s && s.startTime) // only streams with a start time
      .map((s) => ({
        id: `wp-${s.streamId ?? s.startTime}`,
        type: "tracker",
        username: s.username ?? username,
        profilePicture:
          s.profilePicture ??
          published?.profilePicture ??
          live?.profilePicture ??
          "https://i.pravatar.cc/100?img=32",
        createdAt: s.startTime,
        streamId: s.streamId,
        title: s.title ? `${s.title}` : "Tracker event",
        text: s.title ? `Tracker for ${s.title}` : "Tracker event.",
        lat: s.currentLocation?.lat ?? null,
        lng: s.currentLocation?.lng ?? null,
        mileMarker: s.mileMarker ?? null,
        cumulativeVert: s.cumulativeVert ?? null,
      }));
  };

  // Build a unified feed consisting ONLY of correspondence (comments), author's notes (text posts),
  // and "tracker" events which represent interesting points tied to sessions.
  const feed = useMemo(() => {
    // fetch stream ids so we can associate comments -> author's streams
    const streamIds = (entries || []).map((e) => e.streamId).filter(Boolean);

    const texts = createMockTextPosts(username).map((t) => ({
      ...t,
      createdAt: t.createdAt,
    }));

    const comments = createMockComments(username, streamIds).map((c) => ({
      ...c,
      createdAt: c.createdAt,
    }));

    const waypoints = createWaypointEvents(entries);

    // combine comments, texts, waypoint events and sort newest-first
    const combined = [...texts, ...comments, ...waypoints].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });

    return combined;
  }, [entries, username, published, live]);

  // prepare compact posts (author's notes only, up to 3)
  const compactPosts = useMemo(() => {
    return feed
      .filter((p) => p.type === "text" && p.username === username)
      .slice(0, 3);
  }, [feed, username]);

  // SmallPost callback example (comment click or reply)
  const handlePostAction = (post: any) => {
    if (post.type === "comment") {
      // open a reply composer or scroll to reply area — for now console
      console.log("Reply to comment", post);
    } else if (post.type === "text") {
      // show full note or navigate to a dedicated note view (not implemented yet)
      console.log("Open author note", post);
    } else if (post.type === "tracker") {
      // navigate to the corresponding live stream / map view if possible
      if (post.streamId) {
        router.push(`/live/${post.username}/${post.streamId}`);
      } else {
        console.log("tracker clicked", post);
      }
    }
  };

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
              <LiveButton
                username={username}
                streamId={"c148a8ce-441c-4ee3-9609-0076229d44ff"}
              ></LiveButton>
            </div>
          </div>
        </div>

        {/* Main content: feed (correspondence & author notes) */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (feed) - only text/comment posts plus waypoints */}
          <div className="lg:col-span-2 space-y-4">
            <div className={`${cardBase} overflow-hidden`}>
              <div className={sectionHeaderClass}>
                <div className="text-sm font-medium">
                  Correspondence & Notes
                </div>
              </div>

              <div className="p-4 space-y-4">
                {loading ? (
                  <div className="text-sm text-gray-500">Loading…</div>
                ) : feed.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No correspondence or notes yet.
                  </div>
                ) : (
                  feed.map((p: any) => {
                    const key = p.id ?? p.createdAt;
                    return (
                      <SmallPost
                        key={key}
                        post={p}
                        href={undefined}
                        onClick={handlePostAction}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right column (stats + compact notes) */}
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
                      Longest session
                    </span>
                    <span className="font-semibold text-lg">
                      {stats.longestStream
                        ? stats.longestStream.title ??
                          stats.longestStream.streamId
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={cardBase}>
              <div className={sectionHeaderClass}>
                <div className="text-sm font-medium">Tracker History</div>
              </div>

              <div className="p-3 space-y-3">
                {compactPosts.length === 0 ? (
                  <div className="text-sm text-gray-500">No posts yet.</div>
                ) : (
                  compactPosts.map((p) => {
                    const base = p.currentLocation ?? {
                      lat: 45.5231,
                      lng: -122.6765,
                    };
                    const pts = generateLongTrack(base);
                    return (
                      <SmallPost
                        key={p.streamId ?? p.startTime}
                        post={{
                          id: p.streamId ?? p.startTime,
                          type: "track",
                          username: p.username ?? username,
                          profilePicture: p.profilePicture,
                          createdAt: p.startTime ?? new Date().toISOString(),
                          title: p.title,
                          startTime: p.startTime,
                          finishTime: p.finishTime,
                          mileMarker: p.mileMarker,
                          cumulativeVert: p.cumulativeVert,
                          routeGpxUrl: p.routeGpxUrl,
                        }}
                        points={pts}
                        href={"/live/" + p.username + "/" + (p.streamId ?? "")}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Compact notes under the stats card */}
            <div className={cardBase}>
              <div className={sectionHeaderClass}>
                <div className="text-sm font-medium">Author Notes</div>
              </div>

              <div className="p-3 space-y-3">
                {compactPosts.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No author notes yet.
                  </div>
                ) : (
                  compactPosts.map((p) => {
                    return <SmallPost key={p.id} post={p} href={undefined} />;
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // small helper to convert center coords into an object for generating tracks when needed
  function centerToLatLng(c: [number, number]) {
    return { lat: c[0], lng: c[1] };
  }
}
