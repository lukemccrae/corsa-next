"use client";
import React, { useState, useMemo } from "react";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Dropdown } from "primereact/dropdown";
import { useTheme } from "./ThemeProvider";

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  profilePicture?: string;
  time: number; // in seconds
  date: string; // ISO date
  gender?: "M" | "F";
  attemptCount?: number;
  lastEffort?: string; // ISO date of last attempt
};

export type SegmentLeaderboardProps = {
  segmentName: string;
  segmentDistance: number;
  segmentElevationGain?: number;
  unitOfMeasure?: "IMPERIAL" | "METRIC";
  entries: LeaderboardEntry[];
  currentUserId?: string;
  className?: string;
};

export default function SegmentLeaderboard({
  segmentName,
  segmentDistance,
  segmentElevationGain,
  unitOfMeasure = "IMPERIAL",
  entries,
  currentUserId,
  className = "",
}: SegmentLeaderboardProps) {
  const { theme } = useTheme();

  const [timeFilter, setTimeFilter] = useState<"all" | "year" | "month">("all");
  const [genderFilter, setGenderFilter] = useState<"all" | "M" | "F">("all");

  // Filter entries
  const filteredEntries = useMemo(() => {
    let filtered = [...entries].sort((a, b) => (b.attemptCount || 0) - (a.attemptCount || 0));;

    // Gender filter
    if (genderFilter !== "all") {
      filtered = filtered.filter((e) => e.gender === genderFilter);
    }

    // Time filter
    const now = new Date();
    if (timeFilter === "year") {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      filtered = filtered.filter((e) => new Date(e.date) >= yearStart);
    } else if (timeFilter === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter((e) => new Date(e.date) >= monthStart);
    }

    // Re-rank after filtering
    return filtered
      .sort((a, b) => a.time - b.time)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  }, [entries, timeFilter, genderFilter]);

  const userEntry = currentUserId
    ? filteredEntries.find((e) => e.userId === currentUserId)
    : null;
  const showUserRow = userEntry && userEntry.rank > 10;
  const top10 = filteredEntries.slice(0, 10);

  // Format time as MM:SS or HH:MM: SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
    }
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Format last effort as relative time
  const formatLastEffort = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso).getTime();
    const now = Date.now();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return new Date(iso).toLocaleDateString();
  };

  const bg =
    theme === "dark"
      ? "bg-gray-800 text-gray-100 border-gray-700"
      : "bg-white text-gray-900 border-gray-200";
  const headerBg = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const hoverBg = theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50";
  const userHighlight = theme === "dark" ? "bg-blue-900/30" : "bg-blue-50";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";

  const RankIcon = ({ rank }: { rank: number }) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return (
      <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
        #{rank}
      </span>
    );
  };
const LeaderboardRow = ({
  entry,
  isUser = false,
}: {
  entry: LeaderboardEntry;
  isUser?: boolean;
}) => (
  <div
    className={`flex items-center justify-between px-4 py-3 rounded-md transition-colors ${
      isUser ? "bg-blue-100 dark:bg-blue-900" : "hover:bg-gray-100 dark:hover:bg-gray-800"
    }`}
  >
    {/* Profile Picture + Username */}
    <div className="flex items-center gap-3 min-w-0">
      <Avatar
        image={entry.profilePicture}
        label={entry.username.charAt(0).toUpperCase()}
        shape="circle"
        size="normal"
        className="flex-shrink-0"
      />
      <a
        href={`/profile/${entry.username}`}
        className="font-semibold text-sm md:text-base truncate hover:underline"
      >
        {entry.username}
      </a>
    </div>

    {/* Efforts and Last Effort */}
    <div className="flex items-center gap-4 text-sm md:text-base text-gray-700 dark:text-gray-300">
      {entry.attemptCount && (
        <span>
          {entry.attemptCount} effort{entry.attemptCount !== 1 ? "s" : ""}
        </span>
      )}
      {entry.lastEffort && <span>Last: {formatLastEffort(entry.lastEffort)}</span>}
    </div>
  </div>
);


  return (
    <Card className={`${bg} border ${className}`}>
      {/* Header */}
      <div
        className={`${headerBg} px-3 md:px-4 py-3 border-b ${borderColor} rounded-t-lg`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold truncate">
              Leaderboard
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <i className="pi pi-map-marker text-[10px]" />
                {segmentDistance.toFixed(2)}{" "}
                {unitOfMeasure === "IMPERIAL" ? "mi" : "km"}
              </span>
              {segmentElevationGain !== undefined && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <i className="pi pi-chart-line text-[10px]" />
                    {Math.round(segmentElevationGain)}{" "}
                    {unitOfMeasure === "IMPERIAL" ? "ft" : "m"}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Entries */}
      <div className="max-h-[500px] md:max-h-[600px] overflow-y-auto">
        {top10.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            <i className="pi pi-trophy text-3xl md:text-4xl mb-2 block" />
            <p className="text-sm md:text-base">
              No entries yet. Be the first!
            </p>
          </div>
        ) : (
          <>
            {top10.map((entry) => (
              <LeaderboardRow
                key={`${entry.userId}-${entry.date}`}
                entry={entry}
                isUser={currentUserId === entry.userId}
              />
            ))}

            {/* User's rank if outside top 10 */}
            {showUserRow && userEntry && (
              <>
                <div
                  className={`px-4 py-2 text-center text-xs text-gray-500 dark:text-gray-400 ${
                    theme === "dark" ? "bg-gray-900" : "bg-gray-100"
                  }`}
                >
                  <i className="pi pi-ellipsis-h" />
                </div>
                <LeaderboardRow entry={userEntry} isUser={true} />
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
