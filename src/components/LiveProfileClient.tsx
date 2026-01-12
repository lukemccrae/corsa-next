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
  stream: LiveStream;
};

import dynamic from "next/dynamic";
import { useUser } from "../context/UserContext";
import PostInputBar from "./PostInputBar";
import CoverMap from "./CoverMap";
import ProfileLiveChat from "./ProfileLiveChat";
import { ChatMessage, LiveStream, User, Waypoint } from "../generated/schema";
import LiveProfileCard from "./LiveProfileCard";
import ActivityHeatmap from "./ActivityChart";
const FeedItem = dynamic(() => import("./FeedItem"), { ssr: false });

export default function LiveProfileClient({ user, stream }: Props) {
  console.log(stream)
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
  const isOwnProfile = currentUser?.preferred_username === user.username;

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
          username={user.username}
          profilePicture={user.profilePicture}
          streamTitle={user.liveStreams?.[0]?.title}
          startTime={startTime}
        />
      )}

      {/* Map */}
      {stream.waypoints && (
        <CoverMap
          profilePicture={user.profilePicture}
          waypoints={stream.waypoints.filter((w): w is Waypoint => w != null)}
          username={user.username}
        />
      )}

      {/* Chat */}
      <ProfileLiveChat
        profileUsername={user.username}
        initialMessages={chatMessgaes as unknown as ChatMessage[]}
      />


      {/* Activity Heatmap */}
      {stream &&
        stream.waypoints &&
        stream.waypoints.length > 0 &&
        stream.unitOfMeasure &&
        stream.timezone && (
          <ActivityHeatmap
            timezone={stream.timezone}
            points={stream.waypoints.filter((w): w is Waypoint => w != null)}
            unitOfMeasure={stream.unitOfMeasure}
            selectedCell={null}
            setSelectedCell={() => {}}
            startTime={stream.startTime}
          />
        )}


      {isOwnProfile && false && <PostInputBar />}
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
