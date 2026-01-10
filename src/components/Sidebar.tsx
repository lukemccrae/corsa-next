"use client";
import React, { useState } from "react";
import Link from "next/link";
import { LiveDot } from "./LiveDot";
import { LiveStream, TrackerGroup } from "../generated/schema";

/**
 * Sidebar (client)
 *
 * - Accepts livestreams and groups from parent as props and renders them all.
 * - Provides a collapse/expand affordance (keeps the component a client component).
 * - Uses plain markup and Tailwind classes (no PrimeReact, no useTheme).
 */

export default function Sidebar({
  livestreams,
  groups,
  className = "",
}: {
  livestreams: LiveStream[];
  groups: TrackerGroup[];
  className?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const formatViewers = (n?: number | null) => {
    if (n == null) return "";
    if (n >= 1000) return `${Math.round(n / 100) / 10}K`;
    return `${n}`;
  };

  const eventItem = (event: any) => {
    return (
      <li
        key={event.streamId}
        className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <Link
          href={`/${encodeURIComponent(event.link ?? "")}`}
          className="flex items-center gap-3 min-w-0 flex-1"
        >
          <div className="flex-shrink-0">
            <img
              src={event.profilePicture}
              alt={event.title}
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
              {event.title}
            </div>
          </div>
        </Link>
      </li>
    );
  };

  const streamItem = (stream: LiveStream) => {
    const initials = stream.title ? stream.title.charAt(0).toUpperCase() : "?";
    const profilePic = stream.profilePicture;
    const username = stream.username;

    return (
      <li
        key={stream.streamId}
        className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <Link
          href={`/profile/${encodeURIComponent(
            username ?? ""
          )}/${encodeURIComponent(stream.streamId)}`}
          className="flex items-center gap-3 min-w-0 flex-1"
        >
          <div className="flex-shrink-0">
            {profilePic ? (
              <img
                src={profilePic}
                alt={stream.title ?? username ?? "Stream"}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-800 dark:text-gray-100">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
              {username}
            </div>
            {username && (
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {stream.title ?? "Untitled Stream"}
              </div>
            )}
          </div>
        </Link>

        <div className="flex flex-col items-end ml-3">
          {stream.live ? (
            <div className="flex items-center gap-2">
              <LiveDot />
            </div>
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Offline
            </span>
          )}
        </div>
      </li>
    );
  };

  const groupItem = (group: TrackerGroup) => {
    const initials = group.name ? group.name.charAt(0).toUpperCase() : "?";
    const profilePic = group.user?.profilePicture;
    const username = group.user?.username;

    return (
      <li
        key={group.groupId}
        className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <Link
          href={`/group/${encodeURIComponent(group.groupId)}`}
          className="flex items-center gap-3 min-w-0 flex-1"
        >
          <div className="flex-shrink-0">
            {profilePic ? (
              <img
                src={profilePic}
                alt={group.name ?? "Group"}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-800 dark:text-gray-100">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
              {group.name ?? "Untitled Group"}
            </div>
            {username && (
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                @{username}
              </div>
            )}
          </div>
        </Link>

        <div className="flex flex-col items-end ml-3">
          {group.user?.live ? (
            <div className="flex items-center gap-2">
              <LiveDot />
            </div>
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Offline
            </span>
          )}
        </div>
      </li>
    );
  };

  // Collapsed thin sidebar
  if (collapsed) {
    return (
      <aside
        className={`flex flex-col items-center justify-start w-14 ${className} bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-r border-gray-100 dark:border-white/6 shadow-lg`}
        aria-hidden={false}
      >
        <div className="w-full flex flex-col items-center">
          <button
            onClick={() => setCollapsed(false)}
            className="mt-3 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <nav>
            {<Link
                    href={`/burritoleague`}
                    className="w-10 h-10 rounded-full overflow-hidden relative"
                  >
                    <img
                        src={profilePic}
                        alt={c.name ?? c.user?.username ?? "Stream"}
                        className="w-10 h-10 object-cover rounded-full"
                      />
                  </Link>}
          </nav>
          <nav className="mt-4 flex flex-col gap-3 items-center px-1">
            {Array.isArray(groups) && groups.length > 0 ? (
              groups.slice(0, 6).map((c) => {
                const profilePic = c.user?.profilePicture;
                return (
                  <Link
                    key={c.groupId}
                    href={`/group/${encodeURIComponent(c.groupId)}`}
                    className="w-10 h-10 rounded-full overflow-hidden relative"
                  >
                    {profilePic ? (
                      <img
                        src={profilePic}
                        alt={c.name ?? c.user?.username ?? "Stream"}
                        className="w-10 h-10 object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-800 dark:text-gray-100">
                        {c.name ? c.name.charAt(0).toUpperCase() : "?"}
                      </div>
                    )}
                    {c.user?.live && (
                      <div className="absolute bottom-0 right-0">
                        <LiveDot size={6} />
                      </div>
                    )}
                  </Link>
                );
              })
            ) : (
              <div className="text-xs text-gray-500 dark:text-gray-400 px-2 text-center">
                No streams
              </div>
            )}
          </nav>
          <nav className="mt-4 flex flex-col gap-3 items-center px-1">
            {Array.isArray(livestreams) && livestreams.length > 0 ? (
              livestreams.slice(0, 6).map((c) => {
                const profilePic = c.profilePicture;
                const username = c.username;
                const initials = c.title
                  ? c.title.charAt(0).toUpperCase()
                  : "?";

                return (
                  <Link
                    key={c.streamId}
                    href={`/profile/${encodeURIComponent(
                      username ?? ""
                    )}/${encodeURIComponent(c.streamId)}`}
                    className="w-10 h-10 rounded-full overflow-hidden relative"
                    title={c.title ?? username ?? "Stream"}
                  >
                    {profilePic ? (
                      <img
                        src={profilePic}
                        alt={c.title ?? username ?? "Stream"}
                        className="w-10 h-10 object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-800 dark:text-gray-100">
                        {initials}
                      </div>
                    )}
                    {c.live && (
                      <div className="absolute bottom-0 right-0">
                        <LiveDot size={6} />
                      </div>
                    )}
                  </Link>
                );
              })
            ) : (
              <div className="text-xs text-gray-500 dark:text-gray-400 px-2 text-center">
                No streams
              </div>
            )}
          </nav>
        </div>
      </aside>
    );
  }

  // Full sidebar
  return (
    <aside
      className={`flex flex-col w-72 max-w-[18rem] h-full ${className} bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-r border-gray-100 dark:border-white/6 shadow-lg`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/6">
        <div>
          <h3 className="text-lg font-semibold">Discover</h3>
          <p className="text-xs text-gray-400">Live activity</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-gray-300"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-3 py-3 overflow-auto space-y-4">
        {/* <section aria-labelledby="tracker-groups">
          <h4
            id="tracker-groups"
            className="text-xs font-semibold text-gray-400 px-1 mb-2"
          >
            Races & Groups
          </h4>
          <ul className="flex flex-col gap-1">
            {Array.isArray(groups) && groups.length > 0 ? (
              groups.map((group) => groupItem(group))
            ) : (
              <li className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                No groups available
              </li>
            )}
          </ul>
        </section> */}
        <section aria-labelledby="live-streams">
          <h4
            id="live-streams"
            className="text-xs font-semibold text-gray-400 px-1 mb-2"
          >
            Events
          </h4>
          <ul className="flex flex-col gap-1">
            <li className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
              {eventItem({
                title: "Burrito League",
                profilePicture: "https://i.imgur.com/ykHGzEc.png",
                link: "burritoleague",
              })}
            </li>
          </ul>
        </section>
        <section aria-labelledby="live-streams">
          <h4
            id="live-streams"
            className="text-xs font-semibold text-gray-400 px-1 mb-2"
          >
            Individuals
          </h4>
          <ul className="flex flex-col gap-1">
            {Array.isArray(livestreams) && livestreams.length > 0 ? (
              livestreams.map((stream) => streamItem(stream))
            ) : (
              <li className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400">
                No streams available
              </li>
            )}
          </ul>
        </section>
      </div>
    </aside>
  );
}
