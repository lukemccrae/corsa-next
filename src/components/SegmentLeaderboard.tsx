"use client";
import React, { useEffect, useRef, useState } from "react";
import { Avatar } from "primereact/avatar";
import { useTheme } from "./ThemeProvider";
import { fetchSegmentLeaderboard } from "../services/segment.service";

type SegmentEffort = {
  segmentId: string;
  userId: string;
  username: string;
  profilePicture?: string;
  attemptCount: number;
  lastEffortAt?: string | null;
};

type SegmentEffortLeaderboardProps = {
  segmentId: string;
  selectedUserId?: string | null;
  onUserSelect?: (userId: string) => void;
  className?: string;
};

export default function SegmentEffortLeaderboard({
  segmentId,
  selectedUserId,
  onUserSelect,
  className = "",
}: SegmentEffortLeaderboardProps) {
  const { theme } = useTheme();
  const selectedRowRef = useRef<HTMLTableRowElement>(null);

  const [efforts, setEfforts] = useState<SegmentEffort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard data when segmentId changes
  useEffect(() => {
    if (!segmentId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchSegmentLeaderboard({ segmentId });
        console.log(result);
        const leaderboardData = result?.data?.getSegmentLeaderboard || [];
        setEfforts(leaderboardData);
      } catch (err) {
        console.error("Failed to fetch segment leaderboard:", err);
        setError("Failed to load leaderboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [segmentId]);

  const bg =
    theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900";
  const headerBg = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const border = theme === "dark" ? "border-gray-700" : "border-gray-200";

  // Auto-scroll to selected row when selectedUserId changes
  useEffect(() => {
    if (selectedUserId && selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedUserId]);

  return (
    <div className={`${bg} rounded-lg border ${border} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={`${headerBg}`}>
            <tr className="border-b ${border}">
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                User
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Attempts
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                Last Effort
              </th>
            </tr>
          </thead>
          <tbody>
            {efforts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No entries yet
                </td>
              </tr>
            ) : (
              // sort efforts by attemptCount descending
              efforts.sort((a, b) => b.attemptCount - a.attemptCount).map((entry, index) => (
                <tr
                  key={entry.userId}
                  className={`border-b ${border} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
                >
                  <td className="px-4 py-3">
                    <span className="font-semibold text-lg">#{index + 1}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        image={entry.profilePicture}
                        label={entry.username?.charAt(0).toUpperCase()}
                        shape="circle"
                        size="normal"
                      />
                      {entry.username}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">
                      {entry.attemptCount}{" "}
                      {entry.attemptCount === 1 ? "attempt" : "attempts"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {entry.lastEffortAt}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
