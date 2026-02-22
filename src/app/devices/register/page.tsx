"use client";

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Message } from "primereact/message";
import { Steps } from "primereact/steps";
import { Toast } from "primereact/toast";
import { useUser } from "../../../context/UserContext";
import {
  upsertDevice,
  fetchDeviceLocationFromShareUrl,
  type DeviceLocation,
} from "../../../services/device.service";

const TrackerMap = dynamic(() => import("../../../components/TrackerMap"), {
  ssr: false,
});

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

type FlowState = "form" | "verifying" | "locationConfirm" | "success" | "error";

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

function stepIndex(state: FlowState): number {
  if (state === "form") return 0;
  if (state === "verifying" || state === "locationConfirm") return 1;
  if (state === "success") return 2;
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

  // Location result from share URL verification
  const [deviceLocation, setDeviceLocation] = useState<DeviceLocation | null>(null);

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

    setFlowState("verifying");
    try {
      // Step 1 – immediately upsert device into the database
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

      // Step 2 – attempt to fetch current location from share URL
      let location: DeviceLocation | null = null;
      if (form.shareUrl) {
        location = await fetchDeviceLocationFromShareUrl(form.shareUrl);
      }
      setDeviceLocation(location);
      setFlowState("locationConfirm");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Failed to save device: ${msg}`);
      setFlowState("error");
    }
  };

  const handleReset = () => {
    setFlowState("form");
    setErrorMessage("");
    setDeviceLocation(null);
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const isBusy = flowState === "verifying";

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
        label={isBusy ? "Saving…" : "Next — Save & verify device"}
        icon={isBusy ? "pi pi-spin pi-spinner" : "pi pi-arrow-right"}
        iconPos="right"
        onClick={handleSubmit}
        disabled={isBusy || !form.imei || !form.name || !form.make || !user}
        loading={isBusy}
        className="w-full md:w-auto"
      />
    </div>
  );

  const renderVerifying = () => (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <i className="pi pi-spin pi-spinner text-4xl text-violet-500" />
      <p className="font-medium">Saving device and verifying location…</p>
    </div>
  );

  const renderLocationConfirm = () => (
    <div className="space-y-5">
      <Message
        severity="success"
        text={`Device "${form.name}" saved successfully.`}
        className="w-full"
      />

      {deviceLocation ? (
        <>
          <Message
            severity="info"
            text="Live location retrieved from your share URL."
            className="w-full"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Latitude</p>
              <p className="font-mono font-semibold">{deviceLocation.lat.toFixed(6)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Longitude</p>
              <p className="font-mono font-semibold">{deviceLocation.lng.toFixed(6)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last seen</p>
              <p className="text-sm font-semibold">
                {new Date(deviceLocation.timestamp).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <TrackerMap
              lat={deviceLocation.lat}
              lng={deviceLocation.lng}
              profilePicture=""
              isLive={false}
            />
          </div>
        </>
      ) : form.shareUrl ? (
        <Message
          severity="warn"
          text="Could not retrieve live location from the share URL. Ensure your device is transmitting and the URL is correct. Your device has been saved and you can update the share URL later."
          className="w-full"
        />
      ) : null}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          label="Done — Go to my devices"
          icon="pi pi-list"
          onClick={() => setFlowState("success")}
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

  const renderSuccess = () => (
    <div className="flex flex-col items-center gap-6 py-10 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <i className="pi pi-check text-3xl text-green-600 dark:text-green-400" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold">Device registered!</h3>
        <p className="text-gray-600 dark:text-gray-400">
          <strong>{form.name}</strong> has been successfully saved to your
          account.
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
          {flowState === "form" && renderForm()}
          {flowState === "verifying" && renderVerifying()}
          {flowState === "locationConfirm" && renderLocationConfirm()}
          {flowState === "success" && renderSuccess()}
          {flowState === "error" && renderError()}
        </Card>
      </div>
    </>
  );
}
