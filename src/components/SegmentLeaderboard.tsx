"use client";
import React, { useEffect, useRef, useState } from "react";
import { Avatar } from "primereact/avatar";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useTheme } from "./ThemeProvider";
import { useUser } from "../context/UserContext";
import { fetchSegmentLeaderboard } from "../services/segment.service";
import StravaJoinModal from "./StravaJoinModal";
import { exchangeStravaCode } from "../services/integration.service";

const APPSYNC_ENDPOINT =
  "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

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
  const { user } = useUser();
  const toast = useRef<Toast>(null);
  const selectedRowRef = useRef<HTMLTableRowElement>(null);

  const [efforts, setEfforts] = useState<SegmentEffort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [userIntegration, setUserIntegration] = useState<any>(null);
  const [fetchingIntegration, setFetchingIntegration] = useState(false);
    const [oauthLoading, setOauthLoading] = useState(false);
  const [oauthStatus, setOauthStatus] = useState('');

  const userInLeaderboard = user?.userId
    ? efforts.some((effort) => effort.userId === user.userId)
    : false;

  // Fetch user's Strava integration
  useEffect(() => {
    if (!user?.preferred_username) return;

    const fetchIntegration = async () => {
      setFetchingIntegration(true);
      try {
        const query = `
          query GetUserStravaIntegration {
            getUserByUserName(username: "${user.preferred_username}") {
              stravaIntegration {
                athleteFirstName
                athleteId
                athleteLastName
                athleteProfile
              }
            }
          }
        `;

        const response = await fetch(APPSYNC_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": APPSYNC_API_KEY,
          },
          body: JSON.stringify({ query }),
        });

        const { data } = await response.json();
        const integration = data?.getUserByUserName?.stravaIntegration;
        setUserIntegration(integration || null);
      } catch (err) {
        console.error("Failed to fetch Strava integration:", err);
      } finally {
        setFetchingIntegration(false);
      }
    };

    fetchIntegration();
  }, [user?.preferred_username]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchSegmentLeaderboard({ segmentId });
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

    useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const userId = user?.userId;
    const username = user?.preferred_username;
    console.log(code, state, userId, username, '<< stuff')
    if (code && state?.startsWith("burrito_league_") && userId && username) {
      setOauthLoading(true);
      exchangeStravaCode({ code, userId, username })
        .then(() => { 
          setOauthStatus('success');
          // trigger join logic
          setJoining(true)
          handleJoinLeaderboard();
        })
        .catch(() => { setOauthStatus('error'); })
        .finally(() => setOauthLoading(false));

      // Clean up URL (remove code param)
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [user]);

  const handleJoinClick = async () => {
    if (!user?.userId) {
      toast.current?.show({
        severity: "warn",
        summary: "Login Required",
        detail: "Please log in to join the leaderboard",
        life: 3000,
      });
      return;
    }

    // If user has Strava integration, join directly
    if (userIntegration) {
      await handleJoinLeaderboard();
      setJoining(true)
    } else {
      // No integration - show modal to connect
      setShowJoinModal(true);
    }
  };

  const handleJoinLeaderboard = async () => {
    if (!user?.userId) return;
    try {
      const mutation = `
        mutation JoinLeaderboard($segmentId: ID!, $userId: ID!) {
          joinLeaderboard(input: { segmentId: $segmentId, userId: $userId }) {
            message
            segmentId
            success
          }
        }
      `;

      const response = await fetch(APPSYNC_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": APPSYNC_API_KEY,
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            segmentId,
            userId: user.userId,
          },
        }),
      });

      if (!response.ok) {
        console.log(response, "<< res");
        throw new Error("Failed to join leaderboard");
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(
          result.errors[0]?.message || "Failed to join leaderboard"
        );
      }

      toast.current?.show({
        severity: "success",
        summary: "Success!",
        detail: "You've joined the leaderboard 🌯",
        life: 3000,
      });
      window.location.reload();
    } catch (err: any) {
      console.error("Failed to join leaderboard:", err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
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
  const hoverBg = theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Toast ref={toast} />

      <Card className={`${cardBg} border shadow-lg`}>
        <div
          className={`${headerBg} -m-6 mb-6 p-6 border-b ${border} rounded-t-lg mx-1`}
        >
          <div className="flex justify-between items-start mb-4">
            <a
              href="/burritoleague"
              className="text-blue-500 hover:text-blue-600 flex items-center gap-2"
            >
              <i className="pi pi-arrow-left" />
              Back to Burrito League 🌯
            </a>
            {!userInLeaderboard && (
              <Button
                label={
                  userIntegration
                    ? "Join Leaderboard"
                    : "Connect Strava to Join"
                }
                icon={userIntegration ? "pi pi-plus" : "pi pi-link"}
                onClick={handleJoinClick}
                loading={joining || fetchingIntegration}
                disabled={joining || fetchingIntegration}
                className="p-button-success"
              />
            )}
          </div>
          <h1 className="text-3xl font-bold">{segmentName} Leaderboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Track your efforts and compete with other runners
          </p>
          {userInLeaderboard && (
            <div className="mt-3 inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
              <i className="pi pi-check-circle" />
              You're on this leaderboard!
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`${headerBg} border-b ${border}`}>
                <th className="text-left p-3 font-semibold">Rank</th>
                <th className="text-left p-3 font-semibold">User</th>
                <th className="text-left p-3 font-semibold">Attempts</th>
                <th className="text-left p-3 font-semibold">Last Effort</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <i className="pi pi-spin pi-spinner text-2xl text-blue-500" />
                    <p className="mt-2 text-gray-500">Loading... </p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <i className="pi pi-exclamation-triangle text-2xl text-red-500" />
                    <p className="mt-2 text-red-500">{error}</p>
                  </td>
                </tr>
              ) : efforts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500">
                    No entries yet. Be the first to join!
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
                          <div className="flex items-center gap-2">
                            {index === 0 && (
                              <span className="text-2xl">🥇</span>
                            )}
                            {index === 1 && (
                              <span className="text-2xl">🥈</span>
                            )}
                            {index === 2 && (
                              <span className="text-2xl">🥉</span>
                            )}
                            {index > 2 && (
                              <span className="text-gray-500 font-semibold">
                                {index + 1}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              image={entry.profilePicture}
                              label={
                                !entry.profilePicture
                                  ? entry.username.charAt(0).toUpperCase()
                                  : undefined
                              }
                              shape="circle"
                              size="normal"
                            />
                            <span className="font-medium">
                              {entry.username}
                              {isCurrentUser && (
                                <span className="text-blue-500 ml-2">
                                  (You)
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold">
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

      <StravaJoinModal
        visible={showJoinModal}
        onHide={() => setShowJoinModal(false)}
        segmentId={segmentId}
        onSuccess={() => {
          setShowJoinModal(false);
          // Refresh to show updated integration status
          window.location.reload();
        }}
        userIntegration={userIntegration}
      />
    </div>
  );
}
