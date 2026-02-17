"use client";
import React, { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { useUser } from "../../../context/UserContext";
import { useTheme } from "../../../components/ThemeProvider";

const APPSYNC_ENDPOINT = "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

type DeviceMake = "garmin" | "spot" | "bivy" | "zoleo";
type Device = {
  id: string;
  imei: string;
  name: string;
  make: DeviceMake;
  model: string;
};

const deviceMakes = [
  { label: "Garmin", value: "garmin" },
  { label: "Spot", value: "spot" },
  { label: "Bivy", value: "bivy" },
  { label: "Zoleo", value: "zoleo" },
];

export default function DevicesSettingsPage() {
  const toast = useRef<Toast>(null);
  const { user } = useUser();
  const { theme } = useTheme();

  const [devices, setDevices] = useState<Device[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch devices from GraphQL API
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
        console.log(user.preferred_username, "<< fetched devices", result);
        const userDevices = result?.data?.getUserByUserName?.devices || [];
        
        // Map deviceId to id for UI compatibility
        const mappedDevices = userDevices.map((d: any) => ({
          id: d.deviceId,
          imei: d.imei,
          name: d.name,
          make: d.make,
          model: d.model,
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

  // Start editing a device
  function startEditing(device?: Device) {
    if (device) {
      setEditingId(device.id);
      setEditForm({ ...device });
    } else {
      const newId = "new-" + Date.now();
      setDevices((ds) => [
        { id: newId, imei: "", name: "", make: "garmin", model: "" },
        ...ds,
      ]);
      setEditingId(newId);
      setEditForm({ id: newId, imei: "", name: "", make: "garmin", model: "" });
    }
  }

  function saveDevice(d: Device) {
    if (!d.imei || !d.name || !d.make) {
      toast.current?.show({ severity: "error", summary: "IMEI, Name and Make are required", life: 1500 });
      return;
    }
    setDevices((ds) => ds.map(dev => dev.id === d.id ? d : dev));
      setEditingId(null);
      setEditForm(null);
    toast.current?.show({ severity: "success", summary: "Device saved", life: 1300 });
  }

  function cancelEdit() {
    // If it's a new device, remove row
    if (editingId && editingId.startsWith("new-")) {
      setDevices((ds) => ds.filter(d=>d.id !== editingId));
    }
    setEditingId(null);
    setEditForm(null);
  }

  // Device table row
  function DeviceRow({ device, editing }: { device: Device; editing: boolean }) {
    if (editing) {
      return (
        <tr>
          <td className="p-2">
            <InputText
              value={editForm?.imei ?? ""}
              onChange={(e) => setEditForm(f => f ? { ...f, imei: e.target.value } : f)}
              placeholder="IMEI"
              className="w-full"
            />
          </td>
          <td className="p-2">
            <InputText
              value={editForm?.name ?? ""}
              onChange={(e) => setEditForm(f => f ? { ...f, name: e.target.value } : f)}
              placeholder="Device Name"
              className="w-full"
            />
          </td>
          <td className="p-2">
            <Dropdown
              options={deviceMakes}
              value={editForm?.make}
              onChange={(e) => setEditForm(f => f ? { ...f, make: e.value } : f)}
              placeholder="Make"
              className="w-full"
            />
          </td>
          <td className="p-2">
            <InputText
              value={editForm?.model ?? ""}
              onChange={(e) => setEditForm(f => f ? { ...f, model: e.target.value } : f)}
              placeholder="Model"
              className="w-full"
            />
          </td>
          <td className="p-2 text-right">
            <div className="flex gap-1 justify-end">
              <Button
                icon="pi pi-check"
                className="p-button-sm p-button-success text-xs px-2 py-1"
                onClick={() => editForm && saveDevice(editForm)}
                disabled={!editForm?.imei || !editForm?.name || !editForm?.make}
              />
              <Button
                icon="pi pi-times"
                className="p-button-text p-button-sm text-xs px-2 py-1"
                onClick={cancelEdit}
              />
            </div>
          </td>
        </tr>
      );
    }

    // Display row
    return (
      <tr>
        <td className="p-2 text-xs">{device.imei}</td>
        <td className="p-2 text-sm font-medium">{device.name}</td>
        <td className="p-2 text-xs">{deviceMakes.find(m=>m.value===device.make)?.label}</td>
        <td className="p-2 text-xs">{device.model}</td>
        <td className="p-2 text-right">
          <div className="flex gap-1 justify-start">
            <Button
              icon="pi pi-pencil"
              className="p-button-text p-button-sm text-xs px-2 py-1"
              onClick={() => startEditing(device)}
            />
            <Button
              icon="pi pi-trash"
              className="p-button-text p-button-danger p-button-sm text-xs px-2 py-1"
              // onClick={() => deleteDevice(device.id)}
            />
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      <div className="flex flex-col flex-auto min-h-screen bg-surface-950">
        <div className="rounded-t-3xl bg-surface-0 dark:bg-surface-900 py-4 px-4 lg:px-8 max-w-5xl mx-auto w-full shadow">
          <div className="flex flex-col gap-1 mb-4">
            <h2 className="text-xl font-semibold text-surface-900 dark:text-surface-0">
              Device Settings
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mt-4">
            <main className="flex-1">
              <Toast ref={toast} />
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
                    disabled={!!editingId}
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
                              key={d.id}
                              device={d}
                              editing={editingId === d.id}
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