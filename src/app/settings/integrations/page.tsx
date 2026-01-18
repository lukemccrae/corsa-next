"use client";
import React, { useRef, useState, useEffect, Suspense } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Footer } from "../../../components/Footer";
import { useTheme } from "../../../components/ThemeProvider";
import { useUser } from "../../../context/UserContext";
import { useSearchParams } from "next/navigation";
import { exchangeStravaCode } from "@/src/services/integration.service";

const APPSYNC_ENDPOINT =
  "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

type StravaIntegration = {
  athleteFirstName: string;
  athleteId: string;
  athleteLastName: string;
  athleteProfile: string;
};

function IntegrationsContent() {
  const toast = useRef<Toast>(null);
  const { theme } = useTheme();
  const { user } = useUser();
  const searchParams = useSearchParams();

  const [stravaIntegration, setStravaIntegration] =
    useState<StravaIntegration | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingIntegration, setFetchingIntegration] = useState(true);
  const [disconnectDialog, setDisconnectDialog] = useState(false);

  // Fetch user's Strava integration on mount
  useEffect(() => {
    if (!user?.preferred_username) return;
    fetchStravaIntegration(user.preferred_username);
  }, [user?.preferred_username]);

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams?.get("code");
    const state = searchParams?.get("state");
    const error = searchParams?.get("error");

    if (error) {
      toast.current?.show({
        severity: "error",
        summary: "Connection failed",
        detail: error,
        life: 5000,
      });
      window.history.replaceState({}, "", "/settings/integrations");
      return;
    }

    if (code && state === "strava" && user) {
      handleOAuthCallback(code);
    }
  }, [searchParams, user]);

  const fetchStravaIntegration = async (username: string) => {
    setFetchingIntegration(true);
    try {
      const query = `
        query GetUserStravaIntegration {
          getUserByUserName(username: "${username}") {
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
      setStravaIntegration(integration || null);
    } catch (error) {
      console.error("Failed to fetch Strava integration:", error);
      toast.current?.show({
        severity: "error",
        summary: "Failed to load integration",
        detail: "Could not fetch Strava connection status",
        life: 5000,
      });
    } finally {
      setFetchingIntegration(false);
    }
  };

  const handleOAuthCallback = async (code: string) => {
    setLoading(true);

    try {
      await exchangeStravaCode({
        code,
        userId: user!.userId,
        username: user!.preferred_username,
        cognito_username: user!["cognito:username"],
      });

      // Refetch to get updated integration
      await fetchStravaIntegration(user!.preferred_username);

      toast.current?.show({
        severity: "success",
        summary: "Connected successfully",
        detail: "Your Strava account has been connected",
        life: 3000,
      });

      // Clean URL
      window.history.replaceState({}, "", "/settings/integrations");
    } catch (error: any) {
      console.error("OAuth callback error:", error);
      toast.current?.show({
        severity: "error",
        summary: "Connection failed",
        detail:
          error.message || "Failed to connect account.  Please try again.",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    if (!user) {
      toast.current?.show({
        severity: "warn",
        summary: "Login required",
        detail: "Please log in to connect Strava",
        life: 3000,
      });
      return;
    }

    setLoading(true);

    const STRAVA_CLIENT_ID = "69281";
    const REDIRECT_URI = `${window.location.origin}/settings/integrations`;
    const url = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code&scope=activity:read,profile:read_all&state=strava`;

    // Redirect to OAuth flow
    window.location.href = url;
  };

  const handleDisconnectConfirm = async () => {
    if (!user?.["cognito:username"]) return;

    setLoading(true);

    try {
      const mutation = `
        mutation MyMutation {
          disconnectStravaIntegration(input: {userId: "${user["cognito:username"]}", provider: "STRAVA"}) {
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
            userId: user["cognito:username"],
            provider: "STRAVA",
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || "Failed to disconnect");
      }

      setStravaIntegration(null);

      toast.current?.show({
        severity: "info",
        summary: "Disconnected",
        detail: "Strava has been disconnected",
        life: 3000,
      });
    } catch (error: any) {
      console.error("Disconnect error:", error);
      toast.current?.show({
        severity: "error",
        summary: "Disconnect failed",
        detail:
          error.message || "Failed to disconnect account.  Please try again.",
        life: 5000,
      });
    } finally {
      setLoading(false);
      setDisconnectDialog(false);
    }
  };

  const cardBg =
    theme === "dark"
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200";

  const isConnected = !!stravaIntegration;

  return (
    <>
      <Toast ref={toast} />
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Strava Integration</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Connect your Strava account to sync activities, routes, and training
            data.
          </p>
        </div>

        {fetchingIntegration ? (
          <div className="flex items-center justify-center p-8">
            <i className="pi pi-spin pi-spinner text-2xl" />
          </div>
        ) : (
          <div className="space-y-4">
            <Card className={`${cardBg} border`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Icon & Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-16 h-16 flex items-center justify-center rounded-lg flex-shrink-0">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Strava_Logo.svg"
                      alt="Strava"
                      className="w-12 h-12"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-semibold">Strava</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sync your activities, routes, and segments from Strava
                    </p>

                    {isConnected && (
                      <div className="flex items-center gap-3">
                        {stravaIntegration.athleteProfile && (
                          <img
                            src={stravaIntegration.athleteProfile}
                            alt={`${stravaIntegration.athleteFirstName} ${stravaIntegration.athleteLastName}`}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <i className="pi pi-check-circle text-green-500" />
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              Connected
                            </span>
                          </div>
                          {stravaIntegration.athleteFirstName && (
                            <p className="text-xs text-gray-500 dark: text-gray-400">
                              as {stravaIntegration.athleteFirstName}{" "}
                              {stravaIntegration.athleteLastName}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="w-full md:w-auto">
                  {isConnected ? (
                    <Button
                      label="Disconnect"
                      icon="pi pi-times"
                      severity="danger"
                      outlined
                      onClick={() => setDisconnectDialog(true)}
                      disabled={loading}
                      loading={loading}
                      className="w-full md:w-auto"
                    />
                  ) : (
                    <img
                      src="/btn_strava_connect_with_white.svg"
                      alt="Connect with Strava"
                      onClick={handleConnect}
                      className="
                        h-12
                        cursor-pointer
                        select-none
                        hover:opacity-90
                        active:scale-[0.98]
                        transition
                        disabled:opacity-50
                      "
                    />
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Info Section */}
        <Card className={`${cardBg} border`}>
          <div className="flex gap-3">
            <i className="pi pi-info-circle text-blue-500 flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h4 className="font-semibold">Privacy & Data Security</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We only access data you explicitly grant permission for. You can
                disconnect your Strava account at any time, and we'll
                immediately stop syncing your data.
              </p>
            </div>
          </div>
        </Card>

      </div>

      {/* Disconnect Confirmation Dialog */}
      <Dialog
        visible={disconnectDialog}
        onHide={() => setDisconnectDialog(false)}
        header="Disconnect Strava"
        modal
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              label="Cancel"
              severity="secondary"
              outlined
              onClick={() => setDisconnectDialog(false)}
              disabled={loading}
            />
            <Button
              label="Disconnect"
              severity="danger"
              onClick={handleDisconnectConfirm}
              loading={loading}
              disabled={loading}
            />
          </div>
        }
      >
        <div className="flex gap-3">
          <i className="pi pi-exclamation-triangle text-orange-500 text-xl flex-shrink-0" />
          <div className="space-y-3">
            <p>
              Are you sure you want to disconnect <strong>Strava</strong>?
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This will stop syncing your activities and data. It will also
              delete any synced data from our servers, including leaderboard
              data. You can reconnect at any time.
            </p>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default function IntegrationsSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <i className="pi pi-spin pi-spinner text-2xl" />
        </div>
      }
    >
      <IntegrationsContent />
    </Suspense>
  );
}
