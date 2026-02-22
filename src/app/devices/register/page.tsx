"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Message } from "primereact/message";
import { Steps } from "primereact/steps";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { useUser } from "../../../context/UserContext";
import {
  validateDeviceShareUrl,
  startDeviceVerification,
  confirmDeviceVerification,
  upsertDevice,
  type DeviceVerificationSession,
} from "../../../services/device.service";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEVICE_MAKES = [
  { label: "Garmin", value: "GARMIN" },
  { label: "Spot", value: "SPOT" },
  { label: "Bivy", value: "BIVY" },
  { label: "Zoleo", value: "ZOLEO" },
];

const STEPS = [
  { label: "Device info" },
  { label: "Verification" },
  { label: "Done" },
];

// ---------------------------------------------------------------------------
// State machine types
// ---------------------------------------------------------------------------

type FlowState =
  | "form"
  | "validatingUrl"
  | "startingVerification"
  | "verificationPending"
  | "confirming"
  | "savingDevice"
  | "success"
  | "error";

interface FormData {
  name: string;
  make: string;
  model: string;
  imei: string;
  shareUrl: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function stepIndex(state: FlowState): number {
  if (["form", "validatingUrl", "startingVerification"].includes(state))
    return 0;
  if (["verificationPending", "confirming"].includes(state)) return 1;
  if (["savingDevice", "success"].includes(state)) return 2;
  return 0;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RegisterDevicePage() {
  const router = useRouter();
  const { user } = useUser();
  const toast = useRef<Toast>(null);

  // Form fields
  const [form, setForm] = useState<FormData>({
    name: "",
    make: "GARMIN",
    model: "",
    imei: "",
    shareUrl: "",
  });

  // State machine
  const [flowState, setFlowState] = useState<FlowState>("form");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Verification session
  const [session, setSession] = useState<DeviceVerificationSession | null>(
    null
  );
  const [waypointReceived, setWaypointReceived] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);

  // Countdown
  const [msLeft, setMsLeft] = useState<number>(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Polling ref (fallback for subscription)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---------------------------------------------------------------------------
  // Countdown ticker
  // ---------------------------------------------------------------------------

  const startCountdown = useCallback((expiresAt: string) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    const update = () => {
      const remaining = new Date(expiresAt).getTime() - Date.now();
      setMsLeft(Math.max(0, remaining));
    };
    update();
    countdownRef.current = setInterval(update, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Waypoint polling fallback
  // ---------------------------------------------------------------------------

  /**
   * Polls onNewWaypoint via a regular query (AppSync HTTP) as a fallback for
   * the WebSocket subscription, which requires Amplify subscription wiring not
   * currently configured in this project.  When a waypoint is returned the
   * confirm button is auto-enabled.
   */
  const startWaypointPolling = useCallback((streamId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);

    const APPSYNC_ENDPOINT =
      "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";

    const poll = async () => {
      try {
        // We query the most recent waypoint for this stream as a proxy for
        // the onNewWaypoint subscription.
        const query = `
          query PollWaypoint($streamId: ID!) {
            getLatestWaypoint(streamId: $streamId) {
              streamId
              timestamp
            }
          }
        `;
        const res = await fetch(APPSYNC_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "da2-5f7oqdwtvnfydbn226e6c2faga",
          },
          body: JSON.stringify({ query, variables: { streamId } }),
        });
        const json = await res.json();
        if (json?.data?.getLatestWaypoint?.timestamp) {
          setWaypointReceived(true);
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        // Polling errors are non-fatal; user can still manually confirm.
      }
    };

    pollRef.current = setInterval(poll, 5000);
  }, []);

  // ---------------------------------------------------------------------------
  // Flow actions
  // ---------------------------------------------------------------------------

  const handleSubmit = async () => {
    if (!user) {
      setErrorMessage("You must be signed in to register a device.");
      setFlowState("error");
      return;
    }
    if (!form.imei || !form.name || !form.make) {
      toast.current?.show({
        severity: "warn",
        summary: "Required fields missing",
        detail: "IMEI, Name, and Make are required.",
        life: 3000,
      });
      return;
    }

    // Step 1 – validate share URL
    setFlowState("validatingUrl");
    try {
      if (form.shareUrl) {
        const result = await validateDeviceShareUrl(
          form.shareUrl,
          user.idToken
        );
        if (!result.valid) {
          setErrorMessage(
            result.message ?? "Share URL is not valid. Please check it and try again."
          );
          setFlowState("error");
          return;
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Share URL validation failed: ${msg}`);
      setFlowState("error");
      return;
    }

    // Step 2 – start verification
    setFlowState("startingVerification");
    try {
      const sess = await startDeviceVerification(form.imei, user.idToken);
      setSession(sess);
      setWaypointReceived(false);
      startCountdown(sess.verificationExpiresAt);
      startWaypointPolling(sess.verificationStreamId);
      setFlowState("verificationPending");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Failed to start verification: ${msg}`);
      setFlowState("error");
    }
  };

  const handleConfirm = async () => {
    if (!session || !user) return;
    setFlowState("confirming");
    try {
      await confirmDeviceVerification(
        session.imei,
        session.verificationSessionId,
        user.idToken
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Verification confirmation failed: ${msg}`);
      setFlowState("error");
      return;
    }

    // Step 3 – upsert device (Approach B: verify first, then save)
    setFlowState("savingDevice");
    try {
      await upsertDevice(
        {
          IMEI: form.imei,
          name: form.name,
          make: form.make.toUpperCase(),
          model: form.model || undefined,
          shareUrl: form.shareUrl || undefined,
          userId: user["cognito:username"],
        },
        user.idToken
      );
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
      setFlowState("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Failed to save device: ${msg}`);
      setFlowState("error");
    }
  };

  const handleRestartVerification = async () => {
    if (!session || !user) return;
    setFlowState("startingVerification");
    try {
      const sess = await startDeviceVerification(form.imei, user.idToken);
      setSession(sess);
      setWaypointReceived(false);
      startCountdown(sess.verificationExpiresAt);
      startWaypointPolling(sess.verificationStreamId);
      setFlowState("verificationPending");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Failed to restart verification: ${msg}`);
      setFlowState("error");
    }
  };

  const handleReset = () => {
    setFlowState("form");
    setErrorMessage("");
    setSession(null);
    setWaypointReceived(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (pollRef.current) clearInterval(pollRef.current);
  };

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const isExpired = session
    ? Date.now() > new Date(session.verificationExpiresAt).getTime()
    : false;

  const isBusy = [
    "validatingUrl",
    "startingVerification",
    "confirming",
    "savingDevice",
  ].includes(flowState);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderForm = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Device name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">
            Device name <span className="text-red-500">*</span>
          </label>
          <InputText
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Trail Explorer"
            className="w-full"
            disabled={isBusy}
          />
        </div>

        {/* IMEI */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">
            IMEI <span className="text-red-500">*</span>
          </label>
          <InputText
            value={form.imei}
            onChange={(e) => setForm((f) => ({ ...f, imei: e.target.value }))}
            placeholder="15-digit IMEI"
            className="w-full"
            disabled={isBusy}
          />
        </div>

        {/* Make */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">
            Make <span className="text-red-500">*</span>
          </label>
          <Dropdown
            value={form.make}
            options={DEVICE_MAKES}
            onChange={(e) => setForm((f) => ({ ...f, make: e.value }))}
            placeholder="Select make"
            className="w-full"
            disabled={isBusy}
          />
        </div>

        {/* Model */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Model</label>
          <InputText
            value={form.model}
            onChange={(e) =>
              setForm((f) => ({ ...f, model: e.target.value }))
            }
            placeholder="e.g. inReach Mini 2"
            className="w-full"
            disabled={isBusy}
          />
        </div>

        {/* Share URL */}
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="text-sm font-medium">Share URL</label>
          <InputText
            value={form.shareUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, shareUrl: e.target.value }))
            }
            placeholder="https://share.garmin.com/…"
            className="w-full"
            disabled={isBusy}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Public tracking URL provided by your device portal.
          </span>
        </div>
      </div>

      <Button
        label={
          flowState === "validatingUrl"
            ? "Validating URL…"
            : flowState === "startingVerification"
              ? "Starting verification…"
              : "Next — Verify device"
        }
        icon={isBusy ? "pi pi-spin pi-spinner" : "pi pi-arrow-right"}
        iconPos="right"
        onClick={handleSubmit}
        disabled={isBusy || !form.imei || !form.name || !form.make || !user}
        loading={isBusy}
        className="w-full md:w-auto"
      />
    </div>
  );

  const renderVerificationPending = () => (
    <div className="space-y-5">
      <Message
        severity="info"
        text="Send a location update from your device now"
        className="w-full"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Time remaining
          </p>
          <p
            className={`text-3xl font-mono font-bold ${
              isExpired
                ? "text-red-500"
                : msLeft < 60_000
                  ? "text-orange-500"
                  : "text-gray-800 dark:text-gray-100"
            }`}
          >
            {isExpired ? "Expired" : formatCountdown(msLeft)}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Waypoint received
          </p>
          <p className="text-3xl">
            {waypointReceived ? (
              <span className="text-green-500">
                <i className="pi pi-check-circle" />
              </span>
            ) : (
              <span className="text-gray-400">
                <i className="pi pi-clock" />
              </span>
            )}
          </p>
          <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
            {waypointReceived ? "Location received!" : "Waiting…"}
          </p>
        </div>
      </div>

      {/* Debug details (collapsible) */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          onClick={() => setDebugOpen((o) => !o)}
          aria-expanded={debugOpen}
        >
          <span>Debug details</span>
          <i
            className={`pi ${debugOpen ? "pi-chevron-up" : "pi-chevron-down"} text-xs`}
          />
        </button>
        {debugOpen && session && (
          <div className="px-4 pb-4 space-y-2 text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30">
            <Divider className="!my-2" />
            <div>
              <span className="font-semibold">verificationSessionId:</span>{" "}
              {session.verificationSessionId}
            </div>
            <div>
              <span className="font-semibold">verificationStreamId:</span>{" "}
              {session.verificationStreamId}
            </div>
            <div>
              <span className="font-semibold">verificationExpiresAt:</span>{" "}
              {session.verificationExpiresAt}
            </div>
            <div>
              <span className="font-semibold">status:</span> {session.status}
            </div>
            <div>
              <span className="font-semibold">imei:</span> {session.imei}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {isExpired ? (
          <Button
            label="Restart verification"
            icon="pi pi-refresh"
            severity="warning"
            onClick={handleRestartVerification}
            disabled={flowState === "startingVerification"}
            loading={flowState === "startingVerification"}
          />
        ) : (
          <Button
            label={
              flowState === "confirming"
                ? "Confirming…"
                : waypointReceived
                  ? "Confirm verification"
                  : "I sent a ping — Confirm anyway"
            }
            icon={
              flowState === "confirming"
                ? "pi pi-spin pi-spinner"
                : "pi pi-check"
            }
            onClick={handleConfirm}
            disabled={flowState === "confirming"}
            loading={flowState === "confirming"}
          />
        )}
        <Button
          label="Back"
          icon="pi pi-arrow-left"
          severity="secondary"
          outlined
          onClick={handleReset}
          disabled={flowState === "confirming"}
        />
      </div>
    </div>
  );

  const renderSavingDevice = () => (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <i className="pi pi-spin pi-spinner text-4xl text-violet-500" />
      <p className="font-medium">Saving your device…</p>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center gap-6 py-10 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <i className="pi pi-check text-3xl text-green-600 dark:text-green-400" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold">Device registered!</h3>
        <p className="text-gray-600 dark:text-gray-400">
          <strong>{form.name}</strong> has been successfully verified and
          saved.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          label="Go to my devices"
          icon="pi pi-list"
          onClick={() => router.push("/devices")}
        />
        <Button
          label="Register another"
          icon="pi pi-plus"
          severity="secondary"
          outlined
          onClick={handleReset}
        />
      </div>
    </div>
  );

  const renderError = () => (
    <div className="space-y-4">
      <Message severity="error" text={errorMessage} className="w-full" />
      <div className="flex gap-3">
        <Button
          label="Try again"
          icon="pi pi-refresh"
          onClick={handleReset}
        />
        <Button
          label="Cancel"
          icon="pi pi-times"
          severity="secondary"
          outlined
          onClick={() => router.push("/devices")}
        />
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <>
      <Toast ref={toast} />
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        {/* Page title */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Register Device</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Connect a new GPS tracker or satellite communicator to your
            account.
          </p>
        </div>

        {/* Steps indicator */}
        <Steps
          model={STEPS}
          activeIndex={stepIndex(flowState)}
          className="!p-0"
        />

        <Card>
          {/* Form state */}
          {(flowState === "form" ||
            flowState === "validatingUrl" ||
            flowState === "startingVerification") &&
            renderForm()}

          {/* Verification pending */}
          {flowState === "verificationPending" && renderVerificationPending()}

          {/* Confirming */}
          {flowState === "confirming" && renderVerificationPending()}

          {/* Saving */}
          {flowState === "savingDevice" && renderSavingDevice()}

          {/* Success */}
          {flowState === "success" && renderSuccess()}

          {/* Error */}
          {flowState === "error" && renderError()}
        </Card>
      </div>
    </>
  );
}
