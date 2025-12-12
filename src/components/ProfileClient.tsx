"use client";
import React, { useMemo } from "react";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { useTheme } from "./ThemeProvider";
import LiveButton from "./LiveButton";
import type { User as GQLUser, User } from "../generated/graphql";
import type { PostEntry } from "../types";

/**
 * Client wrapper for the profile page UI.
 *
 * - Receives server-fetched `user` and `live` objects as props.
 * - Keeps markup and styling consistent with the previous implementation but
 *   runs as a client component so it can use client hooks (theme, navigation, modals).
 *
 * This component intentionally avoids local data fetching — server props should
 * already contain the necessary snapshot for rendering.
 */

type Props = {
  user: User; // shape coming from server GraphQL; kept flexible to avoid heavy typing coupling
  username: string;
};

import dynamic from "next/dynamic";
import { useUser } from "../context/UserContext";
import PostInputBar from "./PostInputBar";
import CoverMap from "./CoverMap";
const FeedItem = dynamic(() => import("./FeedItem"), { ssr: false });

export default function ProfileClient({ user, username }: Props) {
  const { theme } = useTheme();
  const { user: currentUser } = useUser();
  const isOwnProfile = currentUser?.preferred_username === username;
  console.log(user, "<< user");

  const sortedFeed = useMemo(() => {
    const posts: any[] = user?.posts ?? [];
    return [...posts]
      .filter((p) => p != null)
      .sort((a, b) => {
        const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Profile header */}
      <div className="relative">
        {user.live ? (
          <CoverMap></CoverMap>
        ) : (
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
        )}

        <div className="absolute inset-x-0 -bottom-15 flex items-end justify-between px-6 pointer-events-none">
          <div className="pointer-events-auto">
            <Avatar
              image={user.profilePicture ?? undefined}
              label={
                !user?.profilePicture
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

      {/* Name / handle / bio / meta */}
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
                <div className="font-semibold">151</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Followers
                </div>
                <div className="font-semibold">2264</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content: feed */}
        <div className="max-w-xl mx-auto py-8">
          {isOwnProfile && (
            <div className="mb-4">
              <PostInputBar />
            </div>
          )}
          {sortedFeed.map((item: PostEntry) => (
            <div key={item.id} className="mb-4">
              <FeedItem
                key={item.id}
                user={user as User}
                entry={item as PostEntry}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
