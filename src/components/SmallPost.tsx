"use client";
import React from "react";
import { Avatar } from "primereact/avatar";
import { useRouter } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import SmallTrackMap from "./SmallTrackMap";

type PostLike = {
  streamId?: string;
  username?: string;
  profilePicture?: string;
  startTime?: string;
  routeGpxUrl?: string;
  currentLocation?: { lat: number; lng: number };
};

export default function SmallPost({
  post,
  points,
  className = "",
}: {
  post: PostLike;
  points: [number, number][];
  className?: string;
}) {
  const router = useRouter();
  const { theme } = useTheme();

  const timeAgo = (iso?: string) => {
    if (!iso) return "—";
    try {
      const then = new Date(iso).getTime();
      const diff = Date.now() - then;
      const sec = Math.floor(diff / 1000);
      if (sec < 60) return `${sec}s`;
      const min = Math.floor(sec / 60);
      if (min < 60) return `${min}m`;
      const hr = Math.floor(min / 60);
      if (hr < 24) return `${hr}h`;
      const days = Math.floor(hr / 24);
      return `${days}d`;
    } catch {
      return iso;
    }
  };

  const handleClick = () => {
    const q = post.streamId ? `?streamId=${encodeURIComponent(post.streamId)}` : "";
    router.push(`/live/${post.username ?? ""}${q}`);
  };

  const containerBg =
    theme === "dark" ? "bg-gray-800 border-white/6" : "bg-white border-gray-100";

  return (
    <div
      className={`flex items-start gap-3 p-2 rounded-lg border ${containerBg} ${className} cursor-pointer`}
      onClick={handleClick}
      role="button"
      aria-label={`Open post by ${post.username ?? "user"}`}
    >

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="truncate">
            <div className="text-sm font-medium truncate">{post.streamId ?? "Unknown"}</div>
            <div className="text-xs text-gray-400 truncate">{timeAgo(post.startTime)}</div>
          </div>
        </div>

        <div className="mt-2">
          {/* Increased map size for better preview while keeping the component compact */}
          <div className="w-48 h-28 rounded-md overflow-hidden border border-gray-100 dark:border-white/6">
            <SmallTrackMap
              points={points}
              className="w-full h-full"
              zoom={7}
              center={
                post.currentLocation
                  ? [post.currentLocation.lat, post.currentLocation.lng]
                  : [45.5231, -122.6765]
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}