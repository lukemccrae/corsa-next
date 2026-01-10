"use client";
import React, { useEffect, useRef, useState } from "react";
import { Avatar } from "primereact/avatar";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useTheme } from "./ThemeProvider";
import { useUser } from "../context/UserContext";
import { fetchSegmentLeaderboard } from "../services/segment.service";

const APPSYNC_ENDPOINT = "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

type SegmentEffort = {
  segmentId:  string;
  userId: string;
  username: string;
  profilePicture?:  string;
  attemptCount: number;
  lastEffortAt?:  string | null;
};

type SegmentEffortLeaderboardProps = {
  segmentId: string;
  segmentName?:  string;
};

export default function SegmentEffortLeaderboard({
  segmentId,
  segmentName,
}: SegmentEffortLeaderboardProps) {
  const { theme } = useTheme();
  const { user } = useUser();
  const toast = useRef<Toast>(null);
  const selectedRowRef = useRef<HTMLTableRowElement>(null);

  const [efforts, setEfforts] = useState<SegmentEffort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  // Check if current user is already in the leaderboard
  const userInLeaderboard = user?.userId 
    ? efforts.some(effort => effort.userId === user.userId)
    : false;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchSegmentLeaderboard({ segmentId });
        const leaderboardData = result?. data?.getSegmentLeaderboard || [];
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

  const handleJoinLeaderboard = async () => {
    if (!user?.userId) {
      toast.current?.show({
        severity: "warn",
        summary: "Login Required",
        detail: "Please log in to join the leaderboard",
        life: 3000,
      });
      return;
    }

    setJoining(true);

    try {
      const mutation = `
        mutation MyMutation {
          joinLeaderboard(
            input: {segmentId: "${segmentId}", userId: "${user.userId}"}
          ) {
            message
            segmentId
            success
          }
        }
      `;

      const response = await fetch(APPSYNC_ENDPOINT, {
        method: "POST",
        headers:  {
          "Content-Type":  "application/json",
          "x-api-key": APPSYNC_API_KEY,
        },
        body: JSON. stringify({
          query: mutation,
          variables: {
            segmentId,
            userId: user.userId,
          },
        }),
      });

      if (!response. ok) {
        throw new Error("Failed to join leaderboard");
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || "Failed to join leaderboard");
      }

      toast.current?.show({
        severity: "success",
        summary: "Success! ",
        detail: "You've joined the leaderboard 🌯",
        life: 3000,
      });

      // Refresh leaderboard data
      const leaderboardResult = await fetchSegmentLeaderboard({ segmentId });
      const leaderboardData = leaderboardResult?.data?.getSegmentLeaderboard || [];
      setEfforts(leaderboardData);

    } catch (err:  any) {
      console.error("Failed to join leaderboard:", err);
      toast.current?.show({
        severity: "error",
        summary:  "Error",
        detail: err.message || "Failed to join leaderboard",
        life: 5000,
      });
    } finally {
      setJoining(false);
    }
  };

  const cardBg =
    theme === "dark"
      ? "bg-gray-800 border-gray-700 text-gray-100"
      : "bg-white border-gray-200 text-gray-900";
  const headerBg = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const border = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const hoverBg = theme === "dark" ? "hover:bg-gray-700" :  "hover:bg-gray-50";

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Toast ref={toast} />
      <Card className={`${cardBg} border shadow-lg`}>
        <div className={`${headerBg} -m-6 mb-6 p-6 border-b ${border}`}>
          <div className="flex items-center justify-between gap-4 mb-4">
            <a 
              href="/burritoleague"
              className="flex items-center gap-2 text-sm font-medium hover:underline"
            >
              <i className="pi pi-arrow-left" />
              Back to Burrito League 🌯
            </a>
            
            {! userInLeaderboard && (
              <Button
                label={joining ? "Joining..." : "Join Leaderboard"}
                icon="pi pi-plus"
                onClick={handleJoinLeaderboard}
                loading={joining}
                disabled={joining || ! user}
                className="p-button-success"
              />
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            {segmentName} Leaderboard
          </h1>
          
          {userInLeaderboard && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <i className="pi pi-check-circle" />
              <span className="text-sm font-medium">You're on this leaderboard!</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${border}`}>
                <th className="text-left p-3 font-semibold">
                  Rank
                </th>
                <th className="text-left p-3 font-semibold">
                  User
                </th>
                <th className="text-left p-3 font-semibold">
                  Attempts
                </th>
                <th className="text-left p-3 font-semibold">
                  Last Effort
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center">
                    <i className="pi pi-spin pi-spinner text-2xl" />
                    <p className="mt-2">Loading... </p>
                  </td>
                </tr>
              ) : error ?  (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-red-500">
                    <i className="pi pi-exclamation-triangle text-2xl" />
                    <p className="mt-2">{error}</p>
                  </td>
                </tr>
              ) : efforts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No entries yet.  Be the first to join!
                  </td>
                </tr>
              ) : (
                efforts
                  .sort((a, b) => b.attemptCount - a.attemptCount)
                  .map((entry, index) => {
                    const isCurrentUser = user?.userId === entry.userId;
                    return (
                      <tr
                        key={entry.userId}
                        ref={isCurrentUser ? selectedRowRef : null}
                        className={`border-b ${border} ${hoverBg} transition-colors ${
                          isCurrentUser ? "bg-blue-50 dark:bg-blue-900/20" : ""
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center justify-center w-10">
                            {index === 0 && <span className="text-2xl">🥇</span>}
                            {index === 1 && <span className="text-2xl">🥈</span>}
                            {index === 2 && <span className="text-2xl">🥉</span>}
                            {index > 2 && (
                              <span className="font-semibold text-gray-600 dark:text-gray-400">
                                {index + 1}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              image={entry.profilePicture}
                              label={entry.username?. charAt(0).toUpperCase()}
                              shape="circle"
                              size="normal"
                            />
                            <span className={`font-medium ${isCurrentUser ? "text-blue-600 dark:text-blue-400" : ""}`}>
                              {entry.username}
                              {isCurrentUser && " (You)"}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-lg">
                            {entry.attemptCount}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600 dark:text-gray-400">
                          {entry.lastEffortAt || "—"}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}