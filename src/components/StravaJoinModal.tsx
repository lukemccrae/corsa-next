"use client";
import React, { useEffect, useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { exchangeStravaCode } from "../services/integration.service";
import { useUser } from "../context/UserContext";
import { StravaIntegration } from "../generated/schema";

const APPSYNC_ENDPOINT =
  "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

type StravaJoinModalProps = {
  visible: boolean;
  onHide: () => void;
  segmentId: string;
  onSuccess?: () => void;
  userIntegration: StravaIntegration | null;
};

export default function StravaJoinModal({
  visible,
  onHide,
  segmentId,
  onSuccess,
  userIntegration,
}: StravaJoinModalProps) {
  const { user } = useUser();
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"connect" | "joining">("connect");

  // Auto-join if user already has Strava integration
  useEffect(() => {
    if (!visible || !user?.userId) return;

    // If user has integration when modal opens, join immediately
    if (userIntegration) {
      handleJoinLeaderboard();
    }
  }, [visible, userIntegration, user?.userId]);

  const handleStravaConnect = () => {
    if (!user) {
      toast.current?.show({
        severity: "warn",
        summary: "Login Required",
        detail: "Please log in first",
        life: 3000,
      });
      return;
    }

    setLoading(true);

    const STRAVA_CLIENT_ID = "69281";
    const REDIRECT_URI = `${window.location.origin}/burritoleague/${segmentId}`;
    const url = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=code&scope=activity:read,profile:read_all&state=burrito_league_${segmentId}`;

    window.location.href = url;
  };

  const handleJoinLeaderboard = async () => {
    console.log("hi");
    console.log(user?.["cognito:username"], "<< user cognito username");
    if (!user?.["cognito:username"]) return;

    setLoading(true);
    setStep("joining");

    try {
      const mutation = `
        mutation MyMutation {
          joinLeaderboard(
            input:  {segmentId: "${segmentId}", userId: "${user["cognito:username"]}"}
          ) {
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
        body: JSON.stringify({ query: mutation }),
      });

      if (!response.ok) {
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
        life: 2000,
      });

      // Wait for toast to show, then close and refresh
      setTimeout(() => {
        onSuccess?.();
        onHide();
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
      setLoading(false);
      setStep("connect");
    }
  };

  // Check for OAuth callback
  useEffect(() => {
    if (!visible) return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (code && state?.startsWith("burrito_league_")) {
      handleOAuthCallback(code);
    }
  }, [visible]);

  const handleOAuthCallback = async (code: string) => {
    setLoading(true);

    try {
      await exchangeStravaCode({
        code,
        userId: user!.userId,
        username: user!.preferred_username,
        cognito_username: user!["cognito:username"],
      });

      // await fetchStravaIntegration(user!.preferred_username);

      toast.current?.show({
        severity: "success",
        summary: "Connected successfully",
        detail: "Your Strava account has been connected",
        life: 3000,
      });

      window.history.replaceState({}, "", "/settings/integrations");
    } catch (error: any) {
      console.error("OAuth callback error:", error);

      // Check for duplicate athlete ID error
      const isDuplicateAthlete =
        error.message?.includes("already connected") ||
        error.message?.includes("duplicate") ||
        error.message?.includes("athleteId") ||
        error.code === "ConditionalCheckFailedException";

      toast.current?.show({
        severity: "error",
        summary: isDuplicateAthlete
          ? "Account Already Connected"
          : "Connection failed",
        detail: isDuplicateAthlete
          ? "This Strava account is already connected to another CORSA account.  Each Strava account can only be linked to one CORSA account."
          : error.message || "Failed to connect account.  Please try again.",
        life: isDuplicateAthlete ? 8000 : 5000,
      });

      // Clean URL even on error
      window.history.replaceState({}, "", "/settings/integrations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        header="Join Burrito League 🌯"
        modal
        className="max-w-md w-full"
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              label="Cancel"
              severity="secondary"
              onClick={onHide}
              disabled={loading}
            />
            {step === "connect" && (
              <img
                      src="/btn_strava_connect_with_white.svg"
                      alt="Connect with Strava"
                      onClick={handleStravaConnect}
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
        }
      >
        <div className="space-y-4">
          {step === "connect" ? (
            <>
              <p className="text-gray-600 dark:text-gray-300">
                To join the Burrito League leaderboard, you need to connect your
                Strava account.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark: text-blue-200">
                  We use Strava to track your segment attempts automatically.
                  Your activities will sync and count towards the leaderboard.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center py-8">
                <i className="pi pi-spin pi-spinner text-4xl text-blue-500" />
              </div>
              <p className="text-center text-gray-600 dark:text-gray-300">
                {userIntegration
                  ? "Joining leaderboard..."
                  : "Connecting to Strava and joining leaderboard..."}
              </p>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
}
