"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getPublishedUserInfo,
  getLivestreamByUserId,
  getLiveStreams,
} from "../../../services/anon.service";
import { useUser } from "../../../context/UserContext";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { useTheme } from "../../../components/ThemeProvider";
import LiveButton from "@/src/components/LiveButton";
import FeedItem from "@/src/components/FeedItem";
import { User } from "@/src/generated/graphql";
import { PostEntry } from "@/src/types";

export default function LivePage() {
  const params = useParams();
  const router = useRouter();
  const username = (params as any)?.username ?? "unknown";
  const { getAnon } = useUser();
  const { theme } = useTheme();

  const [user, setUser] = useState<User | null>(null);
  const [live, setLive] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState<any[]>([]);

  const sortedFeed = useMemo(() => {
    const posts = user?.posts ?? [];
    return [...posts]
      .filter((p): p is NonNullable<typeof p> => p != null)
      .sort((a, b) => {
        const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
  }, [user]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const anon = await getAnon();
        const pub = await getPublishedUserInfo({ username, anon });
        const liveRes = await getLivestreamByUserId({ username, anon });

        const userData =
          pub?.data?.getUserByUserName ?? pub?.getUserByUserName ?? null;
        const liveData =
          liveRes?.data?.getLiveStreamByUserId ??
          liveRes?.getLiveStreamByUserId ??
          null;

        if (!mounted) return;
        setUser(userData);
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
  console.log(user, '<< user')
  if(!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="text-center text-gray-500">
          loading profile...
        </div>
      </div>
    )
  }
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Profile header (unchanged) */}
      <div className="relative">
        <div
          className={`h-60 w-full rounded-lg overflow-hidden ${theme === "dark"
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
              image={user?.profilePicture ?? live?.profilePicture}
              label={
                !user?.profilePicture && !live?.profilePicture
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
              {user?.bio ?? "No bio provided."}
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
                <div className="font-semibold">{151}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Followers
                </div>
                <div className="font-semibold">{2264}</div>
              </div>
              <LiveButton
                username={username}
                streamId={"c148a8ce-441c-4ee3-9609-0076229d44ff"}
              ></LiveButton>
            </div>
          </div>
        </div>

        {/* Main content: feed (correspondence & author notes) */}
        <div className="max-w-xl mx-auto py-8">
          {sortedFeed.map((item) => (
            <FeedItem user={user} key={item.id} entry={item as PostEntry} />
          ))}
        </div>
      </div>
    </div>
  );

  // small helper to convert center coords into an object for generating tracks when needed
  function centerToLatLng(c: [number, number]) {
    return { lat: c[0], lng: c[1] };
  }
}
