"use client";
import React, { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { useUser } from "../../../context/UserContext";
import { useTheme } from "../../../components/ThemeProvider";
import { Device } from "@/src/generated/schema";

const APPSYNC_ENDPOINT =
  "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

type DeviceMake = "garmin" | "spot" | "bivy" | "zoleo";

const deviceMakes = [
  { label: "Garmin", value: "GARMIN" },
  { label: "Spot", value: "SPOT" },
  { label: "Bivy", value: "BIVY" },
  { label: "Zoleo", value: "ZOLEO" },
];

// Move DeviceRow outside the parent component
function DeviceRow({
  device,
  editing,
  editForm,
  setEditForm,
  saveDevice,
  cancelEdit,
  startEditing,
  deleteDevice,
}: {
  device: Device;
  editing: boolean;
  editForm: Device | null;
  setEditForm: React.Dispatch<React.SetStateAction<Device | null>>;
  saveDevice: (d: Device) => void;
  cancelEdit: () => void;
  startEditing: (device: Device) => void;
  deleteDevice: (id: string) => void;
}) {
  if (editing) {
    return (
      <tr className="border-b border-gray-700">
        <td className="p-3">
          <InputText
            value={editForm?.imei || ""}
            onChange={(e) => {
              if (editForm) {
                setEditForm({ ...editForm, imei: e.target.value });
              }
            }}
            placeholder="IMEI"
            className="w-full"
          />
        </td>
        <td className="p-3">
          <InputText
            value={editForm?.name || ""}
            onChange={(e) => {
              if (editForm) {
                setEditForm({ ...editForm, name: e.target.value });
              }
            }}
            placeholder="Device Name"
            className="w-full"
          />
        </td>
        <td className="p-3">
          <Dropdown
            value={editForm?.make}
            options={deviceMakes}
            onChange={(e) => {
              if (editForm) {
                setEditForm({ ...editForm, make: e.value });
              }
            }}
            placeholder="Make"
            className="w-full"
          />
        </td>
        <td className="p-3">
          <InputText
            value={editForm?.shareUrl || ""}
            onChange={(e) => {
              if (editForm) {
                setEditForm({ ...editForm, shareUrl: e.target.value });
              }
            }}
            placeholder="shareUrl"
            className="w-full"
          />
        </td>
        <td className="p-3">
          <InputText
            value={editForm?.model || ""}
            onChange={(e) => {
              if (editForm) {
                setEditForm({ ...editForm, model: e.target.value });
              }
            }}
            placeholder="Model"
            className="w-full"
          />
        </td>
        <td className="p-3">
          <div className="flex gap-2">
            <Button
              label="Save"
              icon="pi pi-check"
              size="small"
              onClick={() => editForm && saveDevice(editForm)}
              disabled={!editForm?.imei || !editForm?.name || !editForm?.make}
            />
            <Button
              label="Cancel"
              icon="pi pi-times"
              size="small"
              severity="secondary"
              onClick={cancelEdit}
            />
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-gray-700 hover:bg-gray-700/50">
      <td className="p-3">{device.imei}</td>
      <td className="p-3">{device.name}</td>
      <td className="p-3">
        {deviceMakes.find((m) => m.value === device.make)?.label}
      </td>
      <td className="p-3">{device.shareUrl}</td>
      <td className="p-3">{device.model}</td>
      <td className="p-3">
        <div className="flex gap-2">
          <Button
            icon="pi pi-pencil"
            size="small"
            severity="info"
            onClick={() => startEditing(device)}
          />
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            // onClick={() => deleteDevice(device.imei)}
          />
        </div>
      </td>
    </tr>
  );
}

export default function DevicesSettingsPage() {
  const toast = useRef<Toast>(null);
  const { user } = useUser();
  const { theme } = useTheme();

  const [devices, setDevices] = useState<Device[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.preferred_username) return;

    const fetchDevices = async () => {
      setLoading(true);
      try {
        const query = `
          query GetUserDevices {
            getUserByUserName(username: "${user.preferred_username}") {
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

        if (!response.ok) {
          throw new Error("Failed to fetch devices");
        }

        const result = await response.json();
        console.log("Fetched devices:", result);
        const userDevices = result?.data?.getUserByUserName?.devices || [];

        const mappedDevices = userDevices.map((d: any) => ({
          id: d.imei,
          imei: d.imei,
          name: d.name,
          make: d.make,
          model: d.model,
          shareUrl: d.shareUrl,
        }));

        setDevices(mappedDevices);
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

    fetchDevices();
  }, [user?.preferred_username]);

  function startEditing(device?: Device) {
    if (device) {
      setEditingId(device.imei ?? null);
      setEditForm({ ...device });
    } else {
      setDevices((ds) => [
        { imei: "", name: "", make: "garmin", model: "" },
        ...ds,
      ]);
      setEditingId(null);
      setEditForm({ imei: "", name: "", make: "garmin", model: "" });
    }
  }

  async function saveDevice(d: Device) {
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

      setDevices((ds) =>
        ds.map((dev) => (dev.imei === d.imei ? { ...d, imei: d.imei } : dev)),
      );
      setEditingId(null);
      setEditForm(null);

      toast.current?.show({
        severity: "success",
        summary: "Device saved",
        life: 1300,
      });
    } catch (error: any) {
      console.error("Error saving device:", error);
      toast.current?.show({
        severity: "error",
        summary: "Failed to save device",
        detail: error.message || "Please try again.",
        life: 5000,
      });
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    if (editingId && editingId.startsWith("new-")) {
      setDevices((ds) => ds.filter((d) => d.imei !== editingId));
    }
    setEditingId(null);
    setEditForm(null);
  }

  async function deleteDevice(id: string) {
    if (!user?.["cognito:username"]) {
      toast.current?.show({
        severity: "error",
        summary: "User not authenticated",
        life: 1500,
      });
      return;
    }

    const device = devices.find((d) => d.imei === id);
    if (!device) return;

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
              imei: device.imei,
            },
          },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || "Failed to delete device");
      }

      setDevices((ds) => ds.filter((d) => d.imei !== id));
      toast.current?.show({
        severity: "info",
        summary: "Device deleted",
        life: 1300,
      });
    } catch (error: any) {
      console.error("Error deleting device:", error);
      toast.current?.show({
        severity: "error",
        summary: "Failed to delete device",
        detail: error.message || "Please try again.",
        life: 5000,
      });
    }
  }

  return (
    <>
      <Toast ref={toast} />
      <div className="flex flex-col flex-auto min-h-screen bg-surface-950">
        <div className="rounded-t-3xl bg-surface-0 dark:bg-surface-900 py-4 px-4 lg:px-8 max-w-5xl mx-auto w-full shadow">
          <div className="flex flex-col gap-1 mb-4">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-0">
              Device Settings
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mt-4">
            <main className="flex-1">
              <div className="rounded-xl border border-gray-200 dark:border-white/6 bg-white dark:bg-gray-950 p-2 max-w-2xl">
                <div className="flex items-center justify-between mb-2 px-2">
                  <div className="text-xs text-gray-400 font-semibold">
                    Tracker Devices
                  </div>
                  <Button
                    icon="pi pi-plus"
                    label="Add"
                    className="p-button-primary p-button-sm text-xs px-3 py-1.5"
                    onClick={() => startEditing()}
                    disabled={!!editingId || saving}
                  />
                </div>

                {loading ? (
                  <div className="flex justify-center items-center p-6">
                    <ProgressSpinner
                      style={{ width: "50px", height: "50px" }}
                      strokeWidth="4"
                    />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-[680px] w-full table-auto">
                      <thead>
                        <tr className="text-xs font-semibold text-gray-400 text-left">
                          <th className="p-2">IMEI</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Make</th>
                          <th className="p-2">Share URL</th>
                          <th className="p-2">Model</th>
                          <th className="p-2 text-right">&nbsp;</th>
                        </tr>
                      </thead>
                      <tbody>
                        {devices.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="p-6 text-sm text-gray-400 text-center"
                            >
                              No devices added yet.
                            </td>
                          </tr>
                        ) : (
                          devices.map((d) => (
                            <DeviceRow
                              key={d.imei}
                              device={d}
                              editing={editingId === d.imei}
                              editForm={editForm}
                              setEditForm={setEditForm}
                              saveDevice={saveDevice}
                              cancelEdit={cancelEdit}
                              startEditing={startEditing}
                              deleteDevice={deleteDevice}
                            />
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
