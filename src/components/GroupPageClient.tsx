"use client";
import React, { useMemo, useState } from "react";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useTheme } from "./ThemeProvider";
import { useUser } from "../context/UserContext";
import dynamic from "next/dynamic";
import type { TrackerGroup } from "../generated/schema";
import PostInputBar from "./PostInputBar";
import GroupLiveMap from "./GroupLiveMap";
import ProfileLiveChat from "./ProfileLiveChat";
import GroupRunnersList from "./GroupRunnerList";

const CoverMap = dynamic(() => import("./CoverMap"), { ssr: false });

type Props = {
  group: any; // TrackerGroup with nested user liveStreams data
  username: string;
  groupId: string;
};

export default function GroupPageClient({ group, username, groupId }: Props) {
  const { theme } = useTheme();
  const { user:  currentUser } = useUser();
  const isOwner = currentUser?.preferred_username === username;

  // Aggregate all chat messages from all runners
  const allChatMessages = useMemo(() => {
    if (!group?. user?.liveStreams) return [];
    const messages: any[] = [];
    group.user.liveStreams. forEach((stream:  any) => {
      if (stream?. chatMessages) {
        messages.push(...stream.chatMessages);
      }
    });
    // Sort by timestamp
    return messages. sort((a, b) => {
      const ta = a?. createdAt ?  new Date(a.createdAt).getTime() : 0;
      const tb = b?.createdAt ? new Date(b. createdAt).getTime() : 0;
      return ta - tb;
    });
  }, [group]);

  // Aggregate all waypoints for map display
  const allRunners = useMemo(() => {
    if (!group?.user?. liveStreams) return [];
    return group.user.liveStreams.map((stream: any) => ({
      username: group.user.username,
      profilePicture: group.user.profilePicture,
      streamId: stream.streamId,
      title: stream.title,
      startTime: stream.startTime,
      finishTime: stream.finishTime,
      mileMarker: stream.mileMarker,
      live: stream.live,
      unitOfMeasure: stream.unitOfMeasure,
      waypoints:  stream.waypoints || [],
    }));
  }, [group]);

  const bg = theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900";

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Group header */}
      <div className="relative w-full h-48 md:h-64 overflow-hidden">
        {group?. currentLocation ?  (
          <CoverMap
            lat={group.currentLocation.lat}
            lng={group.currentLocation.lng}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600">
            <img
              src="https://i.imgur.com/h5fqzGG.png"
              alt={`${group?. name} cover`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="absolute bottom-4 left-4 flex items-end gap-4">
          <Avatar
            image={group?. user?.profilePicture || undefined}
            label={! group?.user?.profilePicture ?  group?.name?. charAt(0).toUpperCase() : undefined}
            size="xlarge"
            shape="circle"
            className="border-4 border-white dark:border-gray-800"
            style={{ width: "6rem", height: "6rem" }}
          />

          <div className="text-white drop-shadow-lg mb-2">
            <h1 className="text-2xl md:text-4xl font-bold">{group?. name || "Group Tracker"}</h1>
            <p className="text-sm md:text-base opacity-90">
              {allRunners.length} {allRunners.length === 1 ? "participant" : "participants"}
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column:  Map + Runners list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          <Card className={bg}>
            <GroupLiveMap runners={allRunners} />
          </Card>

          {/* Runners list */}
          <Card className={bg}>
            <h2 className="text-xl font-bold mb-4">Participants</h2>
            <GroupRunnersList runners={allRunners} />
          </Card>
        </div>

        {/* Right column: Chat */}
        <div className="lg:col-span-1">
          <Card className={`${bg} sticky top-4`}>
            <h2 className="text-xl font-bold mb-4">Group Chat</h2>
            <div className="h-96 overflow-y-auto mb-4 space-y-3">
              {allChatMessages.length > 0 ? (
                allChatMessages.map((msg, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Avatar
                      image={msg.profilePicture || undefined}
                      label={! msg.profilePicture ? msg.username?.charAt(0).toUpperCase() : undefined}
                      size="normal"
                      shape="circle"
                    />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm">{msg.username}</span>
                        <span className="text-xs opacity-60">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{msg.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No messages yet</p>
              )}
            </div>

            {isOwner ?  (
              <PostInputBar
                placeholder="Send a message to the group..."
                onPost={(value) => {
                  console.log("Post to group chat:", value);
                  // TODO: implement group chat posting
                }}
              />
            ) : (
              <div className="text-center text-sm text-gray-500 py-4">
                Log in to post comments and interact with the group. 
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}