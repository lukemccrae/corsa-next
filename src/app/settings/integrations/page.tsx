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
import { exchangeStravaCode } from "../../../services/integration.service";

const APPSYNC_ENDPOINT =
  "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

type StravaIntegration = {
  athleteFirstName: string;
  athleteId: string;
  athleteLastName: string;
  athleteProfile: string;
};

export default function IntegrationsSettingsPage() {
  const toast = useRef<Toast>(null);
  const { theme } = useTheme();
  const { user } = useUser();

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

  // Wrap searchParams in Suspense
  const SearchParamsWrapper = () => {
    const searchParams = useSearchParams();

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

    return null;
  };

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
      console.log(data)
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
      // Call backend to exchange code for tokens
      await exchangeStravaCode({
        code,
        userId: user!.userId,
        username: user!.preferred_username,
        cognito_username: user!["cognito:username"],
      });

      // Refetch to get updated integration
      await fetchStravaIntegration(user!.preferred_username);

      // toast.current?.show({
      //   severity: "success",
      //   summary: "Connected successfully",
      //   detail: "Your Strava account has been connected",
      //   life: 3000,
      // });

      // Clean URL
      window.history.replaceState({}, "", "/settings/integrations");
    } catch (error: any) {
      // console.error("OAuth callback error:", error);
      // toast.current?.show({
      //   severity: "error",
      //   summary: "Connection failed",
      //   detail: error.message || "Failed to connect account. Please try again.",
      //   life: 5000,
      // });
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
    setLoading(true);

    try {
      // TODO: Call backend to revoke tokens and remove integration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStravaIntegration(null);

      toast.current?.show({
        severity: "info",
        summary: "Disconnected",
        detail: "Strava has been disconnected",
        life: 3000,
      });
    } catch (error) {
      console.error("Disconnect error:", error);
      toast.current?.show({
        severity: "error",
        summary: "Disconnect failed",
        detail: "Failed to disconnect account. Please try again.",
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
      <Suspense>
        <SearchParamsWrapper />
      </Suspense>
      <div className="space-y-6">
        <Card className={`${cardBg} border`}>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Strava Integration</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your Strava account to sync activities, routes, and
              training data.
            </p>
          </div>

          {fetchingIntegration ? (
            <div className="flex items-center justify-center py-12">
              <i className="pi pi-spin pi-spinner text-3xl text-gray-400" />
            </div>
          ) : (
            <div className="mt-6">
              <Card className={`${cardBg} border`}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Icon & Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 flex items-center justify-center rounded-lg flex-shrink-0">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Strava_Logo.svg"
                        alt="Strava"
                        className="w-12 h-12"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Strava</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Sync your activities, routes, and segments from Strava
                      </p>

                      {isConnected && (
                        <div className="flex items-center gap-3 text-sm">
                          {stravaIntegration.athleteProfile && (
                            <img
                              src={stravaIntegration.athleteProfile}
                              alt={`${stravaIntegration.athleteFirstName} ${stravaIntegration.athleteLastName}`}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <i className="pi pi-check-circle text-green-500" />
                              <span className="font-medium text-green-600 dark:text-green-400">
                                Connected
                              </span>
                            </div>
                            {stravaIntegration.athleteFirstName && (
                              <p className="text-gray-600 dark:text-gray-400 mt-1">
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
                  <div className="w-full sm:w-auto flex justify-end">
                    {isConnected ? (
                      <Button
                        label="Disconnect"
                        icon="pi pi-times"
                        severity="danger"
                        outlined
                        onClick={() => setDisconnectDialog(true)}
                        disabled={loading}
                        loading={loading}
                      />
                    ) : (
                      <Button
                        label="Connect"
                        icon="pi pi-link"
                        onClick={handleConnect}
                        disabled={loading}
                        loading={loading}
                      />
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex gap-3">
              <i className="pi pi-info-circle text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <h4 className="font-semibold mb-1">Privacy & Data Security</h4>
                <p>
                  We only access data you explicitly grant permission for. You
                  can disconnect your Strava account at any time, and we'll
                  immediately stop syncing your data.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Footer />
      </div>

      {/* Disconnect Confirmation Dialog */}
      <Dialog
        visible={disconnectDialog}
        onHide={() => setDisconnectDialog(false)}
        header="Disconnect Strava"
        modal
        footer={
          <div className="flex gap-2">
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
            />
          </div>
        }
      >
        <div className="flex gap-3">
          <i className="pi pi-exclamation-triangle text-orange-500 text-2xl mt-1" />
          <div>
            <p className="mb-2">
              Are you sure you want to disconnect <strong>Strava</strong>?
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This will stop syncing your activities and data. You can reconnect
              at any time.
            </p>
          </div>
        </div>
      </Dialog>
    </>
  );
}
