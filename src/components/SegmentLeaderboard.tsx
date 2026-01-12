"use client";
import React, { useEffect, useRef, useState } from "react";
import { Avatar } from "primereact/avatar";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { useTheme } from "./ThemeProvider";
import { useUser } from "../context/UserContext";
import { fetchSegmentLeaderboard } from "../services/segment.service";
import StravaJoinModal from "./StravaJoinModal";
import { exchangeStravaCode } from "../services/integration.service";
import { SegmentLeaderboardEntry } from "../generated/schema";

const APPSYNC_ENDPOINT =
  "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";
type SegmentEffortLeaderboardProps = {
  segmentId: string;
  segmentName?: string;
};

export default function SegmentEffortLeaderboard({
  segmentId,
  segmentName,
}: SegmentEffortLeaderboardProps) {
  const theme = "dark";
  const { user } = useUser();
  const toast = useRef<Toast>(null);
  const selectedRowRef = useRef<HTMLTableRowElement>(null);

  const [efforts, setEfforts] = useState<SegmentLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [userIntegration, setUserIntegration] = useState<any>(null);
  const [fetchingIntegration, setFetchingIntegration] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [oauthStatus, setOauthStatus] = useState("");

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
                athleteProfileMedium
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
    const cognito_username = user?.["cognito:username"];

    if (
      code &&
      state?.startsWith("burrito_league_") &&
      userId &&
      username &&
      cognito_username
    ) {
      setOauthLoading(true);
      setJoining(true);

      exchangeStravaCode({ code, userId, username, cognito_username })
        .then(() => {
          setOauthStatus("success");
          handleJoinLeaderboard();
        })
        .catch((error) => {
          console.error("Strava connection error:", error);

          // Check for duplicate athlete ID
          const isDuplicateAthlete =
            error.message?.includes("already connected") ||
            error.message?.includes("duplicate") ||
            error.message?.includes("athleteId") ||
            error.code === "ConditionalCheckFailedException";

          setOauthStatus("error");

          toast.current?.show({
            severity: "error",
            summary: isDuplicateAthlete
              ? "Strava Account Already In Use"
              : "Connection Failed",
            detail: isDuplicateAthlete
              ? "This Strava account is already connected to another CORSA account.  Please use a different Strava account or contact support."
              : "Failed to connect your Strava account. Please try again.",
            life: isDuplicateAthlete ? 10000 : 5000,
          });

          setJoining(false);
        })
        .finally(() => setOauthLoading(false));

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
      setJoining(true);
      await handleJoinLeaderboard();
    } else {
      // No integration - show modal to connect
      setShowJoinModal(true);
    }
  };

  const handleJoinLeaderboard = async () => {
    console.log(user?.["cognito:username"], "<< user");
    if (!user?.["cognito:username"]) return;
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
            userId: user["cognito:username"],
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
        summary: "Success! ",
        detail: "You've joined the leaderboard.  Refreshing.. .",
        life: 2000,
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      console.error("Failed to join leaderboard:", err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err.message || "Failed to join leaderboard",
        life: 5000,
      });
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

  const canJoin = !userInLeaderboard && !joining && !fetchingIntegration;

  const getJoinButtonProps = () => {
    if (fetchingIntegration)
      return { label: "Syncing...", icon: "pi pi-sync", disabled: true };

    if (joining)
      return {
        label: "Joining...",
        icon: "pi pi-spin pi-spinner",
        disabled: true,
      };

    if (!userIntegration)
      return {
        label: "Sync Strava to Join",
        icon: "pi pi-sync",
        disabled: false,
      };

    return { label: "Join Leaderboard", icon: "", disabled: canJoin };
  };

  return (
    <div className="relative min-h-screen p-4 md:p-8">
      <Toast ref={toast} />

      {/* Loading Overlay */}
      {(joining || oauthLoading) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-2xl flex flex-col items-center gap-6 max-w-sm mx-4">
            <ProgressSpinner
              style={{ width: "80px", height: "80px" }}
              strokeWidth="4"
              animationDuration="1s"
            />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                {oauthLoading
                  ? "Connecting to Strava..."
                  : "Joining Leaderboard... "}
              </h3>
              <p className="text-gray-400 text-sm">
                {oauthLoading
                  ? "Please wait while we sync your Strava account"
                  : "Adding you to the competition 🌯"}
              </p>
            </div>
            <div className="flex gap-2 items-center text-gray-400 text-xs">
              <i className="pi pi-info-circle" />
              <span>This may take a few seconds</span>
            </div>
          </div>
        </div>
      )}

      <div className={`${cardBg} rounded-lg shadow-lg p-6 md: p-8 border`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <a
            href="/burritoleague"
            className="flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors"
          >
            <i className="pi pi-arrow-left" />
            Back 🌯
          </a>
          {!userInLeaderboard && (
            <Button
              {...getJoinButtonProps()}
              onClick={handleJoinClick}
              className="w-full md:w-auto"
              severity={userIntegration ? "success" : "info"}
            />
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {segmentName} Leaderboard
        </h1>
        <p className="text-gray-400 mb-6">
          Track your efforts and compete with other runners
        </p>
        {userInLeaderboard && (
          <div className="flex items-center gap-2 text-green-500 mb-6 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <i className="pi pi-check-circle" />
            You're on this leaderboard!
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${headerBg} border-b ${border}`}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  User
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Attempts
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <ProgressSpinner
                        style={{ width: "50px", height: "50px" }}
                      />
                      <p className="text-gray-400">Loading...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <i className="pi pi-exclamation-triangle text-red-500 text-3xl" />
                      <p className="text-red-400">{error}</p>
                    </div>
                  </td>
                </tr>
              ) : efforts.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-gray-400"
                  >
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
                          isCurrentUser ? "bg-blue-500/10" : ""
                        }`}
                      >
                        <td className="px-4 py-4">
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
                              <span className="text-gray-400 font-semibold">
                                {index + 1}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              image={entry.profilePicture ?? undefined}
                              shape="circle"
                              size="normal"
                            />
                            <div>
                              <div className="font-medium">
                                {entry.firstName} {entry.lastName}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs text-blue-400 font-normal">
                                    (You)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-lg">
                            {entry.attemptCount}
                          </span>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
