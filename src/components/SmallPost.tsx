"use client";
import React, { useMemo } from "react";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useTheme } from "./ThemeProvider";
import SmallTrackMap from "./SmallTrackMap";
import { FeedPost } from "../types";

/**
 * SmallPost
 *
 * Single compact feed item that can render multiple post types:
 * - track: small location tracker summary + mini map
 * - comment: other user comments (text)
 * - text: user text post (with optional title)
 *
 * Props:
 * - post: FeedPost (see src/types/feed.ts)
 * - points?: array of [lat, lng] for map preview (optional for track posts)
 * - href?: string navigate target if clicking the post
 *
 * Uses PrimeReact base components and Tailwind for layout/styling.
 */

type SmallPostProps = {
  post: FeedPost;
  points?: [number, number][];
  href?: string;
  onClick?: (post: FeedPost) => void;
};

const timeAgo = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso).getTime();
  const now = Date.now();
  const s = Math.max(1, Math.round((now - d) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

export default function SmallPost({ post, points, href, onClick }: SmallPostProps) {
  const { theme } = useTheme();

  const cardBg =
    theme === "dark"
      ? "bg-gray-800 border border-white/6 text-gray-100"
      : "bg-white border border-gray-100 text-gray-900";

  const header = useMemo(() => {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <Avatar
            image={post.profilePicture ?? undefined}
            label={!post.profilePicture && post.username ? post.username.charAt(0).toUpperCase() : undefined}
            shape="circle"
            size="large"
            className="!w-9 !h-9"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium truncate">{post.username ?? "unknown"}</div>
            <div className="text-xs text-gray-400 truncate">{timeAgo(post.createdAt)}</div>
          </div>
          {/* subtitle / meta */}
          {post.type === "track" && (post as any).title && (
            <div className="text-xs text-gray-400 truncate">{(post as any).title}</div>
          )}
        </div>
      </div>
    );
  }, [post]);

  const renderBody = () => {
    if (post.type === "track") {
      const p = post as FeedPost & { startTime?: string; finishTime?: string; mileMarker?: number | string; cumulativeVert?: number | string };
      const duration = p.startTime && p.finishTime ? (() => {
        const s = new Date(p.startTime).getTime();
        const f = new Date(p.finishTime).getTime();
        if (!isNaN(s) && !isNaN(f) && f > s) {
          const mins = Math.round((f - s) / 60000);
          if (mins >= 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
          return `${mins}m`;
        }
        return undefined;
      })() : undefined;

      return (
        <div className="space-y-3">
          {/* title / description */}
          {(p.title || p.text) && <div className="text-sm text-gray-700 dark:text-gray-300">{p.title ?? p.text}</div>}

          {/* small map preview if points provided or currentLocation */}
          <div className="h-32 rounded overflow-hidden border border-gray-100">
            {points && points.length > 0 ? (
              <SmallTrackMap points={points} className="h-32 w-full" />
            ) : p.currentLocation ? (
              // SmallTrackMap should accept center fallback as single point
              <SmallTrackMap points={[[p.currentLocation.lat, p.currentLocation.lng]]} center={[p.currentLocation.lat, p.currentLocation.lng]} className="h-32 w-full" />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-gray-400">
                No preview available
              </div>
            )}
          </div>

          {/* stats row */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div>
              <div className="text-xxs text-gray-400">Distance</div>
              <div className="font-semibold">{p.mileMarker != null ? Number(p.mileMarker).toFixed(2) + " mi" : "—"}</div>
            </div>
            <div>
              <div className="text-xxs text-gray-400">Elapsed</div>
              <div className="font-semibold">{duration ?? "—"}</div>
            </div>
            <div>
              <div className="text-xxs text-gray-400">Elevation</div>
              <div className="font-semibold">{p.cumulativeVert != null ? `${Math.round(Number(p.cumulativeVert))} ft` : "—"}</div>
            </div>
          </div>
        </div>
      );
    }

    if (post.type === "comment") {
      const c = post as FeedPost & { text: string };
      return (
        <div className="text-sm text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">
          {c.text}
        </div>
      );
    }

    // text post (fallback)
    if (post.type === "text") {
      const t = post as FeedPost & { title?: string; text: string };
      return (
        <div className="space-y-2">
          {t.title && <div className="text-sm font-semibold">{t.title}</div>}
          <div className="text-sm text-gray-700 dark:text-gray-300 break-words whitespace-pre-wrap">{t.text}</div>
        </div>
      );
    }

    if(post.type === "tracker"){

      const tr = post as FeedPost & { trackerName?: string; status?: string; location?: string };
      return (
        <div className="space-y-1">
          {post.text}
        </div>
      );
    }

    // unknown shape
    return <div className="text-sm text-gray-700 dark:text-gray-300">Unsupported post</div>;
  };

  const actions = (
    <div className="flex items-center justify-between mt-3">
      <div className="flex items-center gap-2">
        <Button icon="pi pi-comment" className="p-button-text p-button-sm" onClick={() => onClick?.(post)} aria-label="Comment" />
        <Button icon="pi pi-heart" className="p-button-text p-button-sm" onClick={() => console.log("like", post)} aria-label="Like" />
        <Button icon="pi pi-share-alt" className="p-button-text p-button-sm" onClick={() => console.log("share", post)} aria-label="Share" />
      </div>
      {post.type === "track" && (post as any).routeGpxUrl && (
        <div>
          <Button icon="pi pi-download" className="p-button-sm p-button-text" onClick={() => {
            // small convenience: open gpx in new tab (download handled elsewhere)
            const g = (post as any).routeGpxUrl;
            if (g) window.open(g, "_blank");
          }} />
        </div>
      )}
    </div>
  );

  const rootOnClick = (e: React.MouseEvent) => {
    // navigate only if href passed
    if (href) {
      // allow default anchor-like behavior
      window.location.href = href;
      return;
    }
    // fallback notify parent
    onClick?.(post);
  };

  return (
    <article className={`p-3 rounded-lg shadow-sm ${cardBg}`}>
      <div className="cursor-pointer" onClick={rootOnClick}>
        {header}
        <div className="mt-3">{renderBody()}</div>
      </div>

      {actions}
    </article>
  );
}