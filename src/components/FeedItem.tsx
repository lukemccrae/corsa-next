"use client";
import React from "react";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import dynamic from "next/dynamic";
import { PostEntry } from "../types";
import { userAgent } from "next/server";
import { useRouter } from "next/navigation";

import {
  LivestreamPost,
  PhotoPost,
  StatusPost,
  User,
} from "../generated/schema";

interface FeedItemsArgs {
  entry: PostEntry;
  user: User;
  key: string;
}

const TrackerMap = dynamic(() => import("./TrackerMap"), { ssr: false });

export default function FeedItem(args: FeedItemsArgs) {
  // Normalize type for robust runtime checks:
  // Some parts of the app use lowercase 'blog' / 'photo' etc.,
  // while generated GraphQL enums may be uppercase ('BLOG', 'PHOTO').
  // Using a normalized string keeps runtime behavior stable while
  // allowing us to type the entry properly.
  const entryType = String((args.entry as any)?.type ?? "");
  const router = useRouter();

  // Timestamp helper
  const timeAgo = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso).getTime();
    const now = Date.now();
    const s = Math.max(1, Math.round((now - d) / 1000));
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  switch (entryType) {
    case "BLOG": // be permissive
      return (
        <Card className="mb-6">
          <div className="flex gap-2 items-center mb-2">
            <Avatar
              image={args.user.profilePicture ?? undefined}
              size="normal"
              shape="circle"
              className=""
            />
            <a
              href={`/profile/${args.user.username}`}
              className="font-medium hover:underline transition-opacity"
            >
              {args.user.username}
            </a>
            <span className="text-xs text-gray-400">
              {timeAgo(args.entry.createdAt)}
            </span>
          </div>
          <a
            href={`/profile/${args.user.username}`}
            className="font-medium hover:underline transition-opacity"
          >
            <h2 className="font-semibold text-lg">
              {(args.entry as any).title}
            </h2>
          </a>{" "}
          <p className="mb-2">{(args.entry as any).text}</p>
          {(args.entry as any).imageUrl && (
            <a
              href={`/profile/${args.user.username}`}
              className="font-medium hover:underline transition-opacity"
            >
              <img
                src={(args.entry as any).imageUrl}
                alt={(args.entry as any).caption ?? ""}
                className="rounded w-64 mb-2"
              />
            </a>
          )}
        </Card>
      );
    case "LIVESTREAM":
      const stream = args.entry as LivestreamPost;
      const streamUrl = `/profile/${args.user.username}/${stream.stream.streamId}`;
      return (
        <Card className="mb-6">
          {/* Header */}
          <div className="flex gap-2 items-center mb-2">
            <Avatar
              image={args.user.profilePicture ?? undefined}
              size="normal"
              shape="circle"
            />
            <a
              href={`/profile/${args.user.username}`}
              className="font-medium hover:underline transition-opacity"
            >
              {args.user.username}
            </a>
            <span className="text-xs text-gray-400">
              {timeAgo(stream.createdAt)}
            </span>
          </div>

          {/* Title - now a link */}
          <a
            href={streamUrl}
            className="mb-1 flex items-center gap-2 hover:opacity-80 transition-opacity w-fit"
          >
            <i className="pi pi-map-marker text-red-500 text-sm" />
            <span className="font-semibold hover:underline">
              {stream.stream.title}
            </span>
          </a>

          {/* Stats */}
          <div className="text-xs mb-2">
            Distance:{" "}
            <span className="font-bold">{stream.stream.mileMarker} mi</span>
            {/* &nbsp;| Vert: <span className="font-bold">{stream.stream.cumu} ft</span> */}
          </div>

          {/* Timing */}
          <div className="text-xs text-gray-500 mb-2">
            Start:{" "}
            <span className="text-medium">
              {new Date(Number(stream.stream.startTime)).toLocaleString()}
            </span>
            <br />
            Finish:{" "}
            <span className="text-medium">
              {new Date(Number(stream.stream.finishTime)).toLocaleString()}
            </span>
          </div>

          {/* Map - now wrapped in a link */}
          {stream.stream.currentLocation?.lat != null &&
            stream.stream.currentLocation?.lng != null &&
            args.user.live && (
              <a
                href={streamUrl}
                className="block w-full mb-2 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
              >
                <TrackerMap
                  lat={stream.stream.currentLocation.lat}
                  lng={stream.stream.currentLocation.lng}
                  profilePicture={args.user.profilePicture}
                  isLive={args.user.live}
                />
              </a>
            )}
        </Card>
      );
    case "STATUS":
      const status = args.entry as StatusPost;
      return (
        <Card className="mb-6">
          <div className="flex gap-2 items-center mb-2">
            <Avatar
              image={args.user.profilePicture ?? undefined}
              size="normal"
              shape="circle"
              className=""
            />
            <span className="font-medium">{args.user.username}</span>
            <span className="text-xs text-gray-400">
              {timeAgo(status.createdAt)}
            </span>
          </div>
          <p>{status.text}</p>
        </Card>
      );
    case "PHOTO":
      const photo = args.entry as PhotoPost;
      console.log(photo);
      return (
        <Card className="mb-6">
          <div className="flex gap-2 items-center mb-2">
            <Avatar
              image={args.user.profilePicture ?? undefined}
              size="normal"
              shape="circle"
              className=""
            />
            <a
              href={`/profile/${args.user.username}`}
              className="font-medium hover:underline transition-opacity"
            >
              {args.user.username}
            </a>
            <span className="text-xs text-gray-400">
              {timeAgo(photo.createdAt)}
            </span>
          </div>
          {(args.entry as any).caption && (
            <div className="text-sm">{(args.entry as any).caption}</div>
          )}
          {(args.entry as any).imageUrl && (
            <img
              src={(args.entry as any).imageUrl}
              alt={(args.entry as any).caption ?? ""}
              className="rounded w-64 mb-2"
            />
          )}
        </Card>
      );
    default:
      return null;
  }
}
