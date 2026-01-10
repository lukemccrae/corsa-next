"use client";
import React, { useEffect, useRef, useState } from "react";
import { Avatar } from "primereact/avatar";
import { Card } from "primereact/card";
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
  segmentName?: string;
};

export default function SegmentEffortLeaderboard({
  segmentId,
  segmentName,
}: SegmentEffortLeaderboardProps) {
  const { theme } = useTheme();
  const selectedRowRef = useRef<HTMLTableRowElement>(null);

  const [efforts, setEfforts] = useState<SegmentEffort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchSegmentLeaderboard({ segmentId });
        console.log(result, "M<< rs");
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

  const cardBg =
    theme === "dark"
      ? "bg-gray-800 border-gray-700 text-gray-100"
      : "bg-white border-gray-200 text-gray-900";
  const headerBg = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const border = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const hoverBg = theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className={cardBg}>
        <div className="overflow-x-auto">
          <div className="flex items-center justify-between mb-4 pb-3 border-b ${border}">
            <a
              href="/burritoleague"
              className={`flex items-center gap-2 transition-colors`}
            >
              <i className="pi pi-arrow-left"></i>
              Back to Burrito League 🌯
            </a>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">
            {segmentName} Leaderboard
          </h1>
          <table className="w-full">
            <thead className={headerBg}>
              <tr className={`border-b ${border}`}>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider">
                  User
                </th>
                <th className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider">
                  Attempts
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider">
                  Last Effort
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <i className="pi pi-spin pi-spinner mr-2"></i>
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-red-500"
                  >
                    <i className="pi pi-exclamation-triangle mr-2"></i>
                    {error}
                  </td>
                </tr>
              ) : efforts.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No entries yet
                  </td>
                </tr>
              ) : (
                efforts
                  .sort((a, b) => b.attemptCount - a.attemptCount)
                  .map((entry, index) => (
                    <tr
                      key={entry.userId}
                      ref={index === 0 ? selectedRowRef : null}
                      className={`border-b ${border} ${hoverBg} transition-colors cursor-pointer`}
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center w-8 h-8">
                          {index === 0 && <span className="text-2xl">🥇</span>}
                          {index === 1 && <span className="text-2xl">🥈</span>}
                          {index === 2 && <span className="text-2xl">🥉</span>}
                          {index > 2 && (
                            <span className="font-semibold text-sm text-gray-600 dark: text-gray-400">
                              {index + 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar
                            image={entry.profilePicture}
                            label={entry.username?.charAt(0).toUpperCase()}
                            shape="circle"
                            size="normal"
                            className="flex-shrink-0"
                          />
                          <span className="font-medium truncate">
                            {entry.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {entry.attemptCount}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right text-xs text-gray-600 dark:text-gray-400">
                        {entry.lastEffortAt || "—"}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
