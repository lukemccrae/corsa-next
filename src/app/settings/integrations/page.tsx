"use client";
import React, { useRef, useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Footer } from "../../../components/Footer";
import { useTheme } from "../../../components/ThemeProvider";
import { useUser } from "../../../context/UserContext";
import { useSearchParams } from "next/navigation";
import { exchangeStravaCode } from "../../../services/integration.service";

// Types
type Integration = {
  id: string;
  provider: "strava" | "garmin" | "polar" | "coros" | "suunto";
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  connectedAt?:  string;
  athleteId?:  string;
  athleteName?: string;
  athleteAvatar?:  string;
  scopes?:  string[];
};

export default function IntegrationsSettingsPage() {
  const toast = useRef<Toast>(null);
  const { theme } = useTheme();
  const { user } = useUser();
  const searchParams = useSearchParams();

  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "strava",
      provider: "strava",
      name: "Strava",
      description: "Sync your activities, routes, and segments from Strava",
      icon:  "https://upload.wikimedia.org/wikipedia/commons/c/cb/Strava_Logo.svg",
      connected: false,
    },
  ]);

  const [disconnectDialog, setDisconnectDialog] = useState<{
    visible: boolean;
    integration: Integration | null;
  }>({ visible: false, integration: null });

  const [loading, setLoading] = useState<string | null>(null);

  // Check for OAuth callback
  useEffect(() => {
    const code = searchParams?.get("code");
    const state = searchParams?.get("state");
    const error = searchParams?.get("error");

    if (error) {
      toast.current?.show({
        severity: "error",
        summary:  "Connection failed",
        detail: error,
        life: 5000,
      });
      window.history.replaceState({}, "", "/settings/integrations");
      return;
    }

    if (code && state && user) {
      handleOAuthCallback(code, state);
    }
  }, [searchParams, user]);

  const handleOAuthCallback = async (code:  string, state: string) => {
    setLoading(state);

    try {
      // Call backend to exchange code for tokens
      const result = await exchangeStravaCode({
        code,
        userId: user! .userId,
        username: user!. preferred_username,
      });

      setIntegrations((prev) =>
        prev.map((int) =>
          int.id === state
            ? {
                ...int,
                connected: true,
                connectedAt: result.connectedAt,
                athleteId: result.athleteId,
                athleteName: result.athleteName,
                athleteAvatar: result.athleteAvatar,
                scopes: ["activity:read", "profile:read_all"],
              }
            : int
        )
      );

      toast.current?.show({
        severity: "success",
        summary: "Connected successfully",
        detail: `Your ${state} account has been connected`,
        life: 3000,
      });

      // Clean URL
      window.history.replaceState({}, "", "/settings/integrations");
    } catch (error:  any) {
      console.error("OAuth callback error:", error);
      toast.current?.show({
        severity: "error",
        summary:  "Connection failed",
        detail:  error.message || "Failed to connect account.  Please try again.",
        life: 5000,
      });
    } finally {
      setLoading(null);
    }
  };

  const handleConnect = (integration: Integration) => {
    if (! user) {
      toast.current?.show({
        severity: "warn",
        summary: "Login required",
        detail: "Please log in to connect integrations",
        life: 3000,
      });
      return;
    }

    setLoading(integration.id);

    // OAuth URLs for each provider
    const STRAVA_CLIENT_ID = "69281";
    const REDIRECT_URI = `${window.location.origin}/settings/integrations`;

    const oauthUrls:  Record<string, string> = {
      strava: `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=activity:read,profile:read_all&state=strava`,
      garmin: "#",
      polar: "#",
      coros: "#",
      suunto: "#",
    };

    const url = oauthUrls[integration.id];

    if (url === "#") {
      toast.current?.show({
        severity: "info",
        summary: "Coming soon",
        detail: `${integration.name} integration is coming soon! `,
        life: 3000,
      });
      setLoading(null);
      return;
    }

    // Redirect to OAuth flow
    window.location.href = url;
  };

  const handleDisconnectConfirm = async () => {
    if (!disconnectDialog.integration) return;

    const integration = disconnectDialog.integration;
    setLoading(integration.id);

    try {
      // TODO: Call backend to revoke tokens
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIntegrations((prev) =>
        prev.map((int) =>
          int.id === integration.id
            ? {
                ...int,
                connected: false,
                connectedAt: undefined,
                athleteId: undefined,
                athleteName: undefined,
                athleteAvatar: undefined,
                scopes: undefined,
              }
            : int
        )
      );

      toast.current?.show({
        severity: "info",
        summary: "Disconnected",
        detail: `${integration.name} has been disconnected`,
        life: 3000,
      });
    } catch (error) {
      console.error("Disconnect error:", error);
      toast.current?.show({
        severity: "error",
        summary:  "Disconnect failed",
        detail: "Failed to disconnect account. Please try again.",
        life: 5000,
      });
    } finally {
      setLoading(null);
      setDisconnectDialog({ visible:  false, integration: null });
    }
  };

  const formatDate = (iso?:  string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString();
  };

  const cardBg =
    theme === "dark"
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200";

  return (
    <>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Integrations</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your fitness tracking accounts to sync activities,
              routes, and training data. 
            </p>
          </div>

          <div className="space-y-4">
            {integrations.map((integration) => (
              <Card key={integration.id} className={`${cardBg} border`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Icon & Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                      {integration.icon.startsWith("http") ? (
                        <img
                          src={integration.icon}
                          alt={integration.name}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <i className={`${integration.icon} text-3xl`} />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">
                        {integration.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark: text-gray-400 mb-2">
                        {integration.description}
                      </p>

                      {integration.connected && (
                        <div className="flex items-center gap-3 mt-2">
                          {integration.athleteAvatar && (
                            <img
                              src={integration.athleteAvatar}
                              alt={integration.athleteName}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <i className="pi pi-check-circle" />
                              <span>
                                Connected{" "}
                                {integration.connectedAt &&
                                  `on ${formatDate(integration.connectedAt)}`}
                              </span>
                            </div>
                            {integration.athleteName && (
                              <div className="text-gray-600 dark:text-gray-400">
                                as {integration.athleteName}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    {integration.connected ? (
                      <Button
                        label="Disconnect"
                        icon="pi pi-times"
                        className="p-button-danger p-button-outlined"
                        onClick={() =>
                          setDisconnectDialog({
                            visible: true,
                            integration,
                          })
                        }
                        disabled={loading === integration.id}
                        loading={loading === integration.id}
                      />
                    ) : (
                      <Button
                        label="Connect"
                        icon="pi pi-link"
                        onClick={() => handleConnect(integration)}
                        disabled={!! loading}
                        loading={loading === integration.id}
                      />
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Info Section */}
          <Card className={`${cardBg} border mt-6`}>
            <div className="flex gap-3">
              <i className="pi pi-info-circle text-blue-500 text-xl flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-2">Privacy & Data Security</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  We only access data you explicitly grant permission for. You
                  can disconnect any integration at any time, and we'll
                  immediately stop syncing your data.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Footer />
      </div>

      {/* Disconnect Confirmation Dialog */}
      <Dialog
        header="Disconnect Integration"
        visible={disconnectDialog.visible}
        style={{ width: "90vw", maxWidth: "450px" }}
        onHide={() =>
          setDisconnectDialog({ visible: false, integration: null })
        }
        footer={
          <div>
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() =>
                setDisconnectDialog({ visible: false, integration: null })
              }
              disabled={!! loading}
            />
            <Button
              label="Disconnect"
              icon="pi pi-check"
              className="p-button-danger"
              onClick={handleDisconnectConfirm}
              loading={!! loading}
            />
          </div>
        }
      >
        <div className="flex gap-3">
          <i className="pi pi-exclamation-triangle text-orange-500 text-2xl flex-shrink-0" />
          <div>
            <p className="mb-3">
              Are you sure you want to disconnect{" "}
              <strong>{disconnectDialog.integration?.name}</strong>? 
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This will stop syncing your activities and data. You can reconnect
              at any time.
            </p>
          </div>
        </div>
      </Dialog>

      <Toast ref={toast} />
    </>
  );
}