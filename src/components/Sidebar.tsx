"use client";
import React, { useState } from "react";
import Link from "next/link";
import { LiveDot } from "./LiveDot";

/**
 * Sidebar (client)
 *
 * - Accepts livestreams from parent as a prop and renders them all.
 * - Provides a collapse/expand affordance (keeps the component a client component).
 * - Uses plain markup and Tailwind classes (no PrimeReact, no useTheme).
 */

export type Channel = {
  id: string;
  name: string;
  subtitle?: string | null;
  avatar?: string | null;
  live?: boolean;
  viewers?: number | null;
};

export default function Sidebar({
  livestreams,
  className = "",
}: {
  livestreams?: Channel[] | null;
  className?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const formatViewers = (n?: number | null) => {
    if (n == null) return "";
    if (n >= 1000) return `${Math.round(n / 100) / 10}K`;
    return `${n}`;
  };

  const item = (channel: Channel) => {
    console.log(channel)
    const initials = channel.name ? channel.name.charAt(0).toUpperCase() : "?";
    return (
      <li
        key={channel.id}
        className="flex items-center justify-between px-2 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <Link
          href={`/profile/${encodeURIComponent(channel.name)}`}
          className="flex items-center gap-3 min-w-0"
        >
          <div className="flex-shrink-0">
            {channel.avatar ? (
              <img
                src={channel.avatar}
                alt={channel.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-800 dark:text-gray-100">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
              {channel.name}
            </div>
            {channel.subtitle && (
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {channel.subtitle}
              </div>
            )}
          </div>
        </Link>

        <div className="flex flex-col items-end ml-3">
          {channel.live ? (
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

  // Collapsed thin sidebar used on medium+ screens
  if (collapsed) {
    return (
      <aside
        className={`hidden md:flex flex-col items-center justify-start w-14 ${className} bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-r border-gray-100 dark:border-white/6 shadow-lg`}
        aria-hidden={false}
      >
        <div className="w-full flex flex-col items-center">
          <button
            onClick={() => setCollapsed(false)}
            className="mt-3 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            {/* chevron right */}
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

          <nav className="mt-4 flex flex-col gap-3 items-center px-1">
            {Array.isArray(livestreams) && livestreams.length > 0 ? (
              // show a compact avatar strip (limit to first 6)
              livestreams.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  href={`/profile/${encodeURIComponent(c.name)}`}
                  className="w-10 h-10 rounded-full overflow-hidden"
                >
                  {c.avatar ? (
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-10 h-10 object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-800 dark:text-gray-100">
                      {c.name ? c.name.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                </Link>
              ))
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
      className={`hidden md:flex flex-col w-72 max-w-[18rem] h-full ${className} bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-r border-gray-100 dark:border-white/6 shadow-lg`}
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
            {/* chevron left */}
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
        <section aria-labelledby="live-streams">
          <h4
            id="live-streams"
            className="text-xs font-semibold text-gray-400 px-1 mb-2"
          >
            All streams
          </h4>
          <ul className="flex flex-col gap-1">
            {Array.isArray(livestreams) && livestreams.length > 0 ? (
              livestreams.map((c) => item(c))
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
