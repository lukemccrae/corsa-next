"use client";
import React from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker } from "react-leaflet";
import { useTheme } from "./ThemeProvider";
import { useRouter } from "next/navigation";

type SmallPostProps = {
  post: any;
  points?: [number, number][];
  onClick?: (e?: React.MouseEvent) => void;
  href?: string; // pass this to expose a real <a href="..."> in the DOM
};

const timeAgo = (iso?: string) => {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
};

export default function SmallPost({ post, points = [], onClick, href }: SmallPostProps) {
  const { theme } = useTheme();
  const router = useRouter();

  const center: [number, number] =
    post?.currentLocation?.lat && post?.currentLocation?.lng
      ? [post.currentLocation.lat, post.currentLocation.lng]
      : points.length > 0
      ? points[Math.floor(points.length / 2)]
      : [45.5231, -122.6765];

  const mapHeight = 144;

  const containerBase =
    theme === "dark"
      ? "bg-gray-800 border border-white/6"
      : "bg-white border border-gray-200";

  const ArticleInner = (
    <article
      className={
        `rounded-lg overflow-hidden ${containerBase} shadow-sm group ` +
        "transition-colors transition-shadow duration-150 ease-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-400"
      }
      aria-label={`post-${post?.streamId ?? post?.startTime ?? "post"}`}
    >
      <div className="px-3 py-2 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{post?.streamId ?? post?.title ?? "untitled"}</div>
          <div className="text-xs mt-1 text-gray-400 dark:text-gray-400 truncate">
            {post?.title ? post.title : post?.mileMarker ? `${post.mileMarker} mi` : ""}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 ml-3 text-xs text-gray-400 dark:text-gray-400">
          <div>{timeAgo(post?.startTime ?? post?.createdAt ?? post?.lastSeen)}</div>
          <i
            className={
              "pi pi-chevron-right ml-2 text-xs text-gray-400 dark:text-gray-300 " +
              "opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            }
            aria-hidden
          />
        </div>
      </div>

      <div className="p-3">
        <div className="rounded-md overflow-hidden border" style={{ borderColor: theme === "dark" ? "rgba(255,255,255,0.04)" : undefined }}>
          <div className="w-full" style={{ height: `${mapHeight}px` }}>
            <MapContainer
              center={center}
              zoom={8}
              scrollWheelZoom={false}
              dragging={false}
              doubleClickZoom={false}
              zoomControl={false}
              style={{ height: "100%", width: "100%" }}
              attributionControl={false}
              // keep pointer-events-none so the map tiles don't swallow contextmenu events
              className="pointer-events-none filter group-hover:brightness-110 transition-filter duration-150"
            >
              <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" maxZoom={17} />
              {points && points.length > 0 && (
                <>
                  <Polyline positions={points.map((p) => [p[0], p[1]])} pathOptions={{ color: "#2b6cb0", weight: 3 }} />
                  <CircleMarker center={points[0]} radius={4} pathOptions={{ color: "#e34a4a", fillColor: "#e34a4a", fillOpacity: 1 }} />
                  <CircleMarker center={points[points.length - 1]} radius={4} pathOptions={{ color: "#1f9d55", fillColor: "#1f9d55", fillOpacity: 1 }} />
                </>
              )}
            </MapContainer>
          </div>
        </div>
      </div>
    </article>
  );

  // If href is provided, render a real anchor so right-click/copy link context menu is available.
  // Problem addressed: browsers will show page context menu if an element covering the card (e.g. leaflet tiles)
  // prevents the anchor from being the target. To guarantee link semantics and context-menu support we:
  // - render a real <a href="..."> (so "Copy link" appears)
  // - add a transparent, full-size overlay element inside the <a> that sits on top of the card to ensure
  //   right-click / middle-click / ctrl+click hit the anchor itself even if the map or other children have layered elements.
  if (href) {
    const isExternal = /^https?:\/\//i.test(href);

    const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // allow parent to intercept navigation and call e.preventDefault()
      if (onClick) {
        try {
          onClick(e);
        } catch (err) {
          console.error("SmallPost onClick error", err);
        }
        if (e.defaultPrevented) return;
      }

      // If user used meta/middle keys, allow default behaviour (open in new tab)
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      // For internal links, do SPA navigation to avoid full reload
      if (!isExternal) {
        e.preventDefault();
        try {
          router.push(href);
        } catch (err) {
          window.location.href = href;
        }
      }
    };

    return (
      <a
        href={href}
        onClick={handleAnchorClick}
        className="relative block no-underline" /* make anchor relative so overlay can position */
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        aria-label={`open-${post?.streamId ?? post?.title ?? "post"}`}
      >
        {/* Transparent overlay placed above all card content so the anchor is the actual target for pointer/context events.
            This guarantees browser context menu shows anchor actions (Copy link / Open in new tab). */}
        <span
          aria-hidden
          className="absolute inset-0 z-20"
          style={{ display: "block", background: "transparent" }}
        />
        {/* render the visual card under the overlay */}
        <div className="relative z-10 pointer-events-none">
          {/* pointer-events-none here keeps inner elements non-interactive because overlay handles clicks.
              If you need internal interactive controls inside SmallPost later (e.g., buttons),
              remove pointer-events-none and adjust overlay to exclude those areas. */}
          {ArticleInner}
        </div>
      </a>
    );
  }

  // Fallback behaviour: behave like a button if no href given
  const handleDivClick = (e?: React.MouseEvent) => {
    if (onClick) onClick(e);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleDivClick();
    }
  };

  return (
    <div role="button" tabIndex={0} onClick={handleDivClick} onKeyDown={handleKeyDown}>
      {ArticleInner}
    </div>
  );
}