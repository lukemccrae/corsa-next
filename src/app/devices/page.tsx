"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { useRouter } from "next/navigation";
import { useUser } from "@/src/context/UserContext";
import { Device } from "@/src/generated/schema";

const APPSYNC_ENDPOINT =
  "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

const deviceMakes = [
  { label: "Garmin", value: "GARMIN" },
  { label: "Spot", value: "SPOT" },
  { label: "Bivy", value: "BIVY" },
  { label: "Zoleo", value: "ZOLEO" },
];

function makeMakeLabel(make?: string | null) {
  return (
    deviceMakes.find((m) => m.value === make?.toUpperCase())?.label ??
    make ??
    "—"
  );
}

function deviceIcon(make?: string | null) {
  switch (make?.toUpperCase()) {
    case "GARMIN":
      return "pi pi-map-marker";
    case "SPOT":
      return "pi pi-wifi";
    case "BIVY":
      return "pi pi-globe";
    default:
      return "pi pi-mobile";
  }
}

export default function DevicesSettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const toast = useRef<Toast>(null);

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Device | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  useEffect(() => {
    if (user?.preferred_username) fetchDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.preferred_username]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const query = `
        query GetUserDevices {
          getUserByUserName(username: "${user?.preferred_username}") {
            devices {
              imei
              name
              make
              model
              shareUrl
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
      const result = await response.json();
      const fetched: Device[] = (
        result?.data?.getUserByUserName?.devices || []
      ).map((d: Device) => ({
        imei: d.imei,
        name: d.name,
        make: d.make,
        model: d.model,
        shareUrl: d.shareUrl,
        userId: user?.["cognito:username"] || "",
      }));
      setDevices(fetched);
      setSelectedDevice((prev) =>
        prev ?? (fetched.length > 0 ? fetched[0] : null)
      );
    } catch (error) {
      console.error("Error fetching devices:", error);
      toast.current?.show({
        severity: "error",
        summary: "Failed to load devices",
        detail: "Could not fetch your devices. Please try again.",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = () => {
    const blank: Device = {
      imei: "",
      name: "",
      make: "GARMIN",
      model: "",
      shareUrl: "",
      userId: user?.["cognito:username"] || "",
    };
    setSelectedDevice(blank);
    setEditForm({ ...blank });
    setIsEditing(true);
    setIsNew(true);
  };

  const handleSelectDevice = (device: Device) => {
    setSelectedDevice(device);
    setIsEditing(false);
    setEditForm(null);
    setIsNew(false);
  };

  const handleEditDevice = () => {
    if (!selectedDevice) return;
    setEditForm({ ...selectedDevice });
    setIsEditing(true);
    setIsNew(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setIsNew(false);
    setEditForm(null);
    if (isNew) {
      setSelectedDevice(null);
    }
  };

  const saveDevice = async (d: Device) => {
    if (!d.imei || !d.name || !d.make) {
      toast.current?.show({
        severity: "error",
        summary: "IMEI, Name and Make are required",
        life: 1500,
      });
      return;
    }
    if (!user?.["cognito:username"]) {
      toast.current?.show({
        severity: "error",
        summary: "User not authenticated",
        life: 1500,
      });
      return;
    }
    setSaving(true);
    try {
      const mutation = `
        mutation UpsertDevice($input: DeviceInput!) {
          upsertDevice(input: $input) {
            imei
            name
            make
            model
          }
        }
      `;
      const response = await fetch(APPSYNC_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: user.idToken,
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            input: {
              userId: user["cognito:username"],
              IMEI: d.imei,
              name: d.name,
              make: d.make.toUpperCase(),
              model: d.model || "",
              shareUrl: d.shareUrl,
            },
          },
        }),
      });
      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0]?.message || "Failed to save device");
      }
      if (isNew) {
        setDevices((ds) => [...ds, { ...d }]);
      } else {
        setDevices((ds) =>
          ds.map((dev) => (dev.imei === d.imei ? { ...d } : dev))
        );
      }
      setSelectedDevice({ ...d });
      setIsEditing(false);
      setIsNew(false);
      setEditForm(null);
      toast.current?.show({
        severity: "success",
        summary: "Device saved",
        life: 1300,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Please try again.";
      toast.current?.show({
        severity: "error",
        summary: "Failed to save device",
        detail: msg,
        life: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteDevice = async () => {
    if (!selectedDevice?.imei || !user?.["cognito:username"]) return;
    try {
      const mutation = `
        mutation DeleteDevice($input: DeleteDeviceInput!) {
          deleteDevice(input: $input) {
            success
          }
        }
      `;
      const response = await fetch(APPSYNC_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: user.idToken,
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            input: {
              userId: user["cognito:username"],
              imei: selectedDevice.imei,
            },
          },
        }),
      });
      const result = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0]?.message || "Failed to delete device");
      }
      setDevices((ds) => ds.filter((d) => d.imei !== selectedDevice.imei));
      setSelectedDevice(null);
      setDeleteDialogVisible(false);
      toast.current?.show({
        severity: "info",
        summary: "Device deleted",
        life: 1300,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Please try again.";
      toast.current?.show({
        severity: "error",
        summary: "Failed to delete device",
        detail: msg,
        life: 5000,
      });
      setDeleteDialogVisible(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />

      <Dialog
        visible={deleteDialogVisible}
        onHide={() => setDeleteDialogVisible(false)}
        header="Delete Device"
        modal
        footer={
          <div className="flex gap-2 justify-end">
            <Button
              label="Cancel"
              severity="secondary"
              outlined
              size="small"
              onClick={() => setDeleteDialogVisible(false)}
            />
            <Button
              label="Delete"
              severity="danger"
              size="small"
              onClick={deleteDevice}
            />
          </div>
        }
      >
        <div className="flex gap-3">
          <i className="pi pi-exclamation-triangle text-orange-500 text-xl flex-shrink-0" />
          <p>
            Are you sure you want to delete{" "}
            <strong>{selectedDevice?.name}</strong>? This action cannot be
            undone.
          </p>
        </div>
      </Dialog>

      {/* IMPORTANT: prevent page scrolling; manage overflow within panels */}
      <div className="h-[calc(100vh-13rem)] min-h-[400px] overflow-hidden flex flex-col md:flex-row">
        {/* Left panel: device list */}
        <div
          className={`w-full md:w-[300px] md:border-r border-gray-200 dark:border-gray-800 flex flex-col min-h-0 ${
            selectedDevice ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 md:px-4 md:py-3 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-sm md:text-base font-semibold">My Devices</h2>
            <Button
              icon="pi pi-plus"
              onClick={() => router.push("/devices/register")}
              disabled={!user}
              tooltip="Register device"
              tooltipOptions={{ position: "left" }}
              size="small"
            />
          </div>

          {/* Device list body */}
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 md:px-4 md:py-4">
            {loading ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <i className="pi pi-spin pi-spinner mr-2" />
                Loading…
              </div>
            ) : devices.length === 0 ? (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <i className="pi pi-mobile mr-2" />
                <p className="mt-1">No devices yet.</p>
                <p>Add your first tracker!</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {devices.map((d) => (
                  <li key={d.imei}>
                    <button
                      className={`w-full text-left rounded-md px-2 py-2 transition-colors ${
                        selectedDevice?.imei === d.imei
                          ? "bg-violet-50 dark:bg-violet-900/30"
                          : "hover:bg-gray-50 dark:hover:bg-white/5"
                      }`}
                      onClick={() => handleSelectDevice(d)}
                      aria-label={`View device ${d.name}`}
                    >
                      <div className="flex items-center gap-2">
                        <i
                          className={`${deviceIcon(d.make)} text-gray-400 text-xs`}
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">
                            {d.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-x-2">
                            <span>{makeMakeLabel(d.make)}</span>
                            {d.model && <span>{d.model}</span>}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right panel: device detail */}
        <div
          className={`flex-1 min-h-0 flex flex-col ${
            !selectedDevice ? "hidden md:flex" : "flex"
          }`}
        >
          {!selectedDevice ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
                <i className="pi pi-mobile mr-2" />
                Select a device to view details
              </div>
            </div>
          ) : (
            <div className="h-full overflow-hidden flex flex-col">
              {/* Detail header */}
              <div className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 border-b border-gray-200 dark:border-gray-800">
                {/* Mobile: back button */}
                <button
                  className="md:hidden text-sm font-semibold"
                  onClick={() => {
                    setSelectedDevice(null);
                    setIsEditing(false);
                    setIsNew(false);
                  }}
                  aria-label="Back to device list"
                >
                  <i className="pi pi-chevron-left mr-2" />
                  Devices
                </button>

                {/* Desktop: device name */}
                <span className="hidden md:block text-sm font-semibold flex-1 truncate">
                  {isNew ? "New Device" : selectedDevice.name || "Device"}
                </span>

                {/* Edit / Delete actions (view mode only) */}
                {!isEditing && (
                  <div className="flex gap-2 ml-auto">
                    <Button
                      icon="pi pi-pencil"
                      size="small"
                      severity="info"
                      onClick={handleEditDevice}
                      tooltip="Edit device"
                      tooltipOptions={{ position: "left" }}
                    />
                    <Button
                      icon="pi pi-trash"
                      size="small"
                      severity="danger"
                      onClick={() => setDeleteDialogVisible(true)}
                      tooltip="Delete device"
                      tooltipOptions={{ position: "left" }}
                    />
                  </div>
                )}
              </div>

              {/* Detail body */}
              <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
                {isEditing ? (
                  /* Edit form */
                  <div className="space-y-4 max-w-sm">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                        IMEI <span className="text-red-500">*</span>
                      </label>
                      <InputText
                        value={editForm?.imei || ""}
                        onChange={(e) =>
                          setEditForm((f) =>
                            f ? { ...f, imei: e.target.value } : f
                          )
                        }
                        placeholder="IMEI"
                        className="w-full"
                        disabled={!isNew}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <InputText
                        value={editForm?.name || ""}
                        onChange={(e) =>
                          setEditForm((f) =>
                            f ? { ...f, name: e.target.value } : f
                          )
                        }
                        placeholder="Device Name"
                        className="w-full"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                        Make <span className="text-red-500">*</span>
                      </label>
                      <Dropdown
                        value={editForm?.make}
                        options={deviceMakes}
                        onChange={(e) =>
                          setEditForm((f) =>
                            f ? { ...f, make: e.value } : f
                          )
                        }
                        placeholder="Select Make"
                        className="w-full"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                        Model
                      </label>
                      <InputText
                        value={editForm?.model || ""}
                        onChange={(e) =>
                          setEditForm((f) =>
                            f ? { ...f, model: e.target.value } : f
                          )
                        }
                        placeholder="Model"
                        className="w-full"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                        Share URL
                      </label>
                      <InputText
                        value={editForm?.shareUrl || ""}
                        onChange={(e) =>
                          setEditForm((f) =>
                            f ? { ...f, shareUrl: e.target.value } : f
                          )
                        }
                        placeholder="https://share.garmin.com/…"
                        className="w-full"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        label="Save"
                        icon="pi pi-check"
                        size="small"
                        onClick={() => editForm && saveDevice(editForm)}
                        disabled={
                          saving ||
                          !editForm?.imei ||
                          !editForm?.name ||
                          !editForm?.make
                        }
                        loading={saving}
                      />
                      <Button
                        label="Cancel"
                        icon="pi pi-times"
                        size="small"
                        severity="secondary"
                        onClick={cancelEdit}
                        disabled={saving}
                      />
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="space-y-4 max-w-sm">
                    {/* Device avatar + name */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                        <i
                          className={`${deviceIcon(selectedDevice.make)} text-violet-600 dark:text-violet-300 text-xl`}
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold truncate">
                          {selectedDevice.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {makeMakeLabel(selectedDevice.make)}
                          {selectedDevice.model
                            ? ` · ${selectedDevice.model}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    {/* Info cards */}
                    <div className="grid grid-cols-1 gap-3">
                      <div className="rounded-md border border-gray-200 dark:border-gray-800 p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          IMEI
                        </div>
                        <div className="font-semibold font-mono text-sm mt-0.5">
                          {selectedDevice.imei}
                        </div>
                      </div>

                      <div className="rounded-md border border-gray-200 dark:border-gray-800 p-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Make
                        </div>
                        <div className="font-semibold text-sm mt-0.5">
                          {makeMakeLabel(selectedDevice.make)}
                        </div>
                      </div>

                      {selectedDevice.model && (
                        <div className="rounded-md border border-gray-200 dark:border-gray-800 p-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Model
                          </div>
                          <div className="font-semibold text-sm mt-0.5">
                            {selectedDevice.model}
                          </div>
                        </div>
                      )}

                      {selectedDevice.shareUrl && (
                        <div className="rounded-md border border-gray-200 dark:border-gray-800 p-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Share URL
                          </div>
                          <div className="font-semibold text-sm mt-0.5 break-all">
                            <a
                              href={selectedDevice.shareUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-violet-600 dark:text-violet-300 hover:underline"
                            >
                              {selectedDevice.shareUrl}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
