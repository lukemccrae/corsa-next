"use client";
import React, { useEffect, useRef, useState } from "react";
import { Avatar } from "primereact/avatar";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { SelectButton } from "primereact/selectbutton";
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
  const [refreshingUsers, setRefreshingUsers] = useState<Set<string>>(
    new Set(),
  );
  const [sexFilter, setSexFilter] = useState<string>("OVERALL");

  const filterOptions = [
    { label: "Overall", value: "OVERALL" },
    { label: "Male", value: "M" },
    { label: "Female", value: "F" },
  ];

  const userInLeaderboard = user?.userId
    ? efforts.some((effort) => effort.userId === user["cognito:username"])
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

    if (userIntegration) {
      setJoining(true);
      await handleJoinLeaderboard();
    } else {
      setShowJoinModal(true);
    }
  };

  const callJoinLeaderboardMutation = async (userId: string) => {
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
          userId,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to join leaderboard");
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(
        result.errors[0]?.message || "Failed to join leaderboard",
      );
    }

    return result;
  };

  const callRefreshLeaderboardEntryMutation = async (userId: string) => {
    const mutation = `
      mutation RefreshLeaderboardEntry($segmentId: ID!, $userId: ID!) {
        refreshLeaderboardEntry(input: { segmentId: $segmentId, userId: $userId }) {
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
          userId,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh entry");
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || "Failed to refresh entry");
    }

    return result;
  };

  const handleJoinLeaderboard = async () => {
    if (!user?.["cognito:username"]) return;
    try {
      await callJoinLeaderboardMutation(user["cognito:username"]);

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

  const handleRefreshEntry = async (userId: string) => {
    setRefreshingUsers((prev) => new Set(prev).add(userId));

    try {
      await callRefreshLeaderboardEntryMutation(userId);

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Entry refreshed successfully",
        life: 3000,
      });

      const leaderboardResult = await fetchSegmentLeaderboard({ segmentId });
      const leaderboardData =
        leaderboardResult?.data?.getSegmentLeaderboard || [];
      setEfforts(leaderboardData);
    } catch (err: any) {
      console.error("Failed to refresh entry:", err);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err.message || "Failed to refresh entry",
        life: 5000,
      });
    } finally {
      setRefreshingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
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
        label: "Join Leaderboard",
        icon: "pi pi-sync",
        disabled: false,
      };

    return { label: "Join Leaderboard", icon: "", disabled: !canJoin };
  };

  return (
    <div className="relative">
      <Toast ref={toast} />

      {(joining || oauthLoading) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className={`${cardBg} p-8 max-w-md text-center`}>
            <ProgressSpinner className="mb-4" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {oauthLoading
                  ? "Connecting to Strava..."
                  : "Joining Leaderboard... "}
              </h3>
              <p className="text-sm opacity-80">
                {oauthLoading
                  ? "Please wait while we sync your Strava account"
                  : "Adding you to the competition"}
              </p>
            </div>
            <p className="text-xs opacity-60 mt-4">
              <i className="pi pi-info-circle mr-1" />
              This may take awhile, please be patient.
            </p>
          </Card>
        </div>
      )}

      <Card className={`${cardBg} border`}>
        <div className="flex items-center justify-between mb-6">
          <a
            href="/burritoleague"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <i className="pi pi-arrow-left" />
            Back 
          </a>
          {!userInLeaderboard && (
            <Button {...getJoinButtonProps()} onClick={handleJoinClick} />
          )}
        </div>
        <h1 className="text-3xl font-bold mb-2">{segmentName} Leaderboard</h1>
        <div className="mb-4">
          <img
            src="/api_logo_pwrdBy_strava_horiz_white.svg"
            alt="Powered by Strava"
            className="h-8"
          />
        </div>

        {userInLeaderboard && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4 flex items-center gap-2">
            <i className="pi pi-check-circle text-green-400" />
            You're on this leaderboard!
          </div>
        )}

        <div className="mb-4">
          {!loading && (
            <SelectButton
              value={sexFilter}
              onChange={(e) => setSexFilter(e.value)}
              options={filterOptions}
              className="text-sm"
            />
          )}
        </div>

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
                {user?.preferred_username === "lukemccrae" && (
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8">
                    <div className="flex flex-col items-center gap-3">
                      <ProgressSpinner />
                      <p className="text-sm opacity-60">Loading... </p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8">
                    <div className="flex flex-col items-center gap-2 text-red-400">
                      <i className="pi pi-exclamation-triangle text-2xl" />
                      <p className="text-sm">{error}</p>
                    </div>
                  </td>
                </tr>
              ) : efforts.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm opacity-60"
                  >
                    No entries yet. Be the first to join!
                  </td>
                </tr>
              ) : (
                efforts
                  .sort((a, b) => b.attemptCount - a.attemptCount)
                  .filter((entry) => {
                    if (sexFilter !== "OVERALL" && entry.sex !== sexFilter) {
                      return false;
                    }
                    return true;
                  })
                  .map((entry, index) => {
                    const isCurrentUser = user?.userId === entry.userId;
                    return (
                      <tr
                        key={entry.userId}
                        ref={isCurrentUser ? selectedRowRef : null}
                        className={`border-b ${border} ${hoverBg} transition-colors ${isCurrentUser ? "bg-blue-500/10" : ""}`}
                      >
                        <td className="px-4 py-3">
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
                              <span className="text-sm font-medium opacity-60">
                                {index + 1}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              image={entry.profilePicture ?? undefined}
                              shape="circle"
                              size="normal"
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {entry.firstName} {entry.lastName}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs opacity-60">
                                    (You)
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold">
                            {entry.attemptCount}
                          </span>
                        </td>
                        {user?.preferred_username === "lukemccrae" && (
                          <td className="px-4 py-3">
                            <Button
                              icon={
                                refreshingUsers.has(entry.userId)
                                  ? "pi pi-spin pi-spinner"
                                  : "pi pi-refresh"
                              }
                              onClick={() => handleRefreshEntry(entry.userId)}
                              disabled={refreshingUsers.has(entry.userId)}
                              className="p-button-sm p-button-text"
                              tooltip="Refresh entry"
                              tooltipOptions={{ position: "top" }}
                            />
                          </td>
                        )}
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
          window.location.reload();
        }}
        userIntegration={userIntegration}
      />
    </div>
  );
}
