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

// Types
type Integration = {
  id: string;
  provider: "strava" | "garmin" | "polar" | "coros" | "suunto";
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  connectedAt?:  string;
  athleteId?: string;
  athleteName?: string;
  athleteAvatar?: string;
  scopes?: string[];
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
    // {
    //   id:  "garmin",
    //   provider:  "garmin",
    //   name:  "Garmin Connect",
    //   description: "Import workouts and track data from Garmin devices",
    //   icon: "pi pi-wifi",
    //   connected:  false,
    // },
    // {
    //   id: "polar",
    //   provider: "polar",
    //   name: "Polar Flow",
    //   description: "Connect your Polar watch and training data",
    //   icon: "pi pi-heart",
    //   connected: false,
    // },
    // {
    //   id: "coros",
    //   provider: "coros",
    //   name: "COROS",
    //   description: "Sync activities from your COROS GPS watch",
    //   icon: "pi pi-compass",
    //   connected: false,
    // },
    // {
    //   id: "suunto",
    //   provider: "suunto",
    //   name: "Suunto",
    //   description: "Import training data from Suunto devices",
    //   icon: "pi pi-map-marker",
    //   connected: false,
    // },
  ]);

  const [disconnectDialog, setDisconnectDialog] = useState<{
    visible: boolean;
    integration: Integration | null;
  }>({ visible: false, integration: null });

  const [loading, setLoading] = useState<string | null>(null);

  // Check for OAuth callback
  useEffect(() => {
    const code = searchParams?. get("code");
    const state = searchParams?.get("state");
    const error = searchParams?.get("error");

    if (error) {
      toast.current?. show({
        severity: "error",
        summary: "Connection failed",
        detail: error,
        life: 5000,
      });
      // Clean URL
      window.history.replaceState({}, "", "/settings/integrations");
      return;
    }

    if (code && state) {
      handleOAuthCallback(code, state);
    }
  }, [searchParams]);

  const handleOAuthCallback = async (code: string, state: string) => {
    setLoading(state);

    try {
      // Simulate API call to exchange code for token
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock athlete data
      const mockAthleteData = {
        athleteId: "12345678",
        athleteName: `${user?.preferred_username || "Demo"} User`,
        athleteAvatar: user?.picture || `https://i.pravatar.cc/150? img=${Math.floor(Math.random() * 70)}`,
        scopes: ["activity:read", "profile:read_all"],
      };

      setIntegrations((prev) =>
        prev.map((int) =>
          int.id === state
            ? {
                ...int,
                connected: true,
                connectedAt: new Date().toISOString(),
                ... mockAthleteData,
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
    } catch (error) {
      console.error("OAuth callback error:", error);
      toast.current?.show({
        severity: "error",
        summary: "Connection failed",
        detail: "Failed to connect account.  Please try again.",
        life: 5000,
      });
    } finally {
      setLoading(null);
    }
  };

  const handleConnect = (integration: Integration) => {
    setLoading(integration.id);

    // OAuth URLs for each provider
    const oauthUrls:  Record<string, string> = {
      strava: `https://www.strava.com/oauth/authorize?client_id=69281&redirect_uri=https://corsa-next-735i.vercel.app/demo-segment&response_type=code&scope=activity:read`,
      garmin: "#", // Placeholder
      polar: "#", // Placeholder
      coros: "#", // Placeholder
      suunto: "#", // Placeholder
    };

    const url = oauthUrls[integration.id];

    if (url === "#") {
      // For providers without OAuth setup yet
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
      // Simulate API call to revoke token
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIntegrations((prev) =>
        prev.map((int) =>
          int.id === integration. id
            ? {
                ... int,
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
        summary: "Disconnect failed",
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
      <div className="flex flex-col flex-auto min-h-screen bg-surface-950">
        <div className="rounded-t-3xl bg-surface-0 dark:bg-surface-900 py-8 px-8 lg:px-20 max-w-5xl mx-auto w-full shadow">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-0">
              Integrations
            </h2>
            <p className="text-gray-400 text-sm max-w-2xl mt-2">
              Connect your fitness tracking accounts to sync activities,
              routes, and training data.
            </p>
          </div>

          <Toast ref={toast} />

          <div className="grid grid-cols-1 md: grid-cols-2 gap-4 mt-6">
            {integrations.map((integration) => (
              <Card
                key={integration.id}
                className={`${cardBg} border shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Icon & Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                      {integration.icon. startsWith("http") ? (
                        <img
                          src={integration.icon}
                          alt={integration. name}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <i
                          className={`${integration.icon} text-2xl text-gray-600 dark:text-gray-300`}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-surface-900 dark:text-surface-0">
                        {integration.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {integration.description}
                      </p>

                      {integration.connected && (
                        <div className="mt-3 flex items-center gap-2">
                          {integration.athleteAvatar && (
                            <img
                              src={integration.athleteAvatar}
                              alt={integration.athleteName}
                              className="w-6 h-6 rounded-full"
                            />
                          )}
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <i className="pi pi-check-circle text-green-500" />
                              <span>
                                Connected{" "}
                                {integration.connectedAt &&
                                  `on ${formatDate(integration.connectedAt)}`}
                              </span>
                            </div>
                            {integration.athleteName && (
                              <div className="mt-1">
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
                        className="p-button-outlined p-button-danger p-button-sm"
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
                        className="p-button-sm"
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
          <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark: border-blue-800">
            <div className="flex items-start gap-3">
              <i className="pi pi-info-circle text-blue-600 dark: text-blue-400 mt-1" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <h4 className="font-semibold mb-1">
                  Privacy &amp; Data Security
                </h4>
                <p className="text-blue-800 dark:text-blue-200">
                  We only access data you explicitly grant permission for. You
                  can disconnect any integration at any time, and we'll
                  immediately stop syncing your data.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* Disconnect Confirmation Dialog */}
      <Dialog
        header="Disconnect Integration"
        visible={disconnectDialog.visible}
        style={{ width: "450px" }}
        onHide={() =>
          setDisconnectDialog({ visible: false, integration: null })
        }
        footer={
          <div className="flex justify-end gap-2">
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
              icon="pi pi-trash"
              className="p-button-danger"
              onClick={handleDisconnectConfirm}
              loading={!! loading}
              disabled={!! loading}
            />
          </div>
        }
      >
        <div className="flex items-start gap-3">
          <i className="pi pi-exclamation-triangle text-orange-500 text-2xl mt-1" />
          <div>
            <p className="mb-2">
              Are you sure you want to disconnect{" "}
              <strong>{disconnectDialog.integration?.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 dark: text-gray-400">
              This will stop syncing your activities and data.  You can reconnect
              at any time. 
            </p>
          </div>
        </div>
      </Dialog>
    </>
  );
}