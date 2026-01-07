"use client";
import React, { useMemo } from "react";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { useTheme } from "./ThemeProvider";
import LiveButton from "./LiveButton";
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
  streamId: string;
  waypoints: Waypoint[];
  profilePicture: string;
};

import dynamic from "next/dynamic";
import { useUser } from "../context/UserContext";
import PostInputBar from "./PostInputBar";
import CoverMap from "./CoverMap";
import ProfileLiveChat from "./ProfileLiveChat";
import { ChatMessage, User, Waypoint } from "../generated/schema";
import LiveProfileCard from "./LiveProfileCard";
const FeedItem = dynamic(() => import("./FeedItem"), { ssr: false });

export default function LiveProfileClient({
  user,
  username,
  streamId,
  waypoints,
  profilePicture,
}: Props) {
  const chatMessgaes = user.liveStreams?.[0]?.chatMessages ?? [];
  if (
    !user.liveStreams ||
    user.liveStreams.length === 0 ||
    !user.liveStreams[0]
  ) {
    return null;
  }
  const startTime = new Date(user.liveStreams[0].startTime);
  const { theme } = useTheme();
  const { user: currentUser } = useUser();
  const isOwnProfile = currentUser?.preferred_username === username;

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
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Card */}
      {startTime && (
        <LiveProfileCard
          username={username}
          profilePicture={profilePicture}
          streamTitle={user.liveStreams?.[0]?.title}
          startTime={startTime}
        />
      )}

      {/* Map */}
      {waypoints && (
        <CoverMap
          profilePicture={profilePicture}
          waypoints={waypoints}
          username={username}
        />
      )}

      {/* Chat */}
      <ProfileLiveChat
        profileUsername={username}
        initialMessages={chatMessgaes as unknown as ChatMessage[]}
      />

      {isOwnProfile && <PostInputBar />}
      {sortedFeed.map((item: PostEntry) => (
        <FeedItem
          key={item.createdAt}
          user={user as User}
          entry={item as PostEntry}
        />
      ))}
    </div>
  );
}