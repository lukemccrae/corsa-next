"use client";
import React, { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Footer } from "../../../components/Footer";
import { useUser } from "../../../context/UserContext";
import { useTheme } from "../../../components/ThemeProvider";

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

  // All tracked devices
  const [devices, setDevices] = useState<Device[]>([]);
  // id of device currently being edited (can be new or existing)
  const [editingId, setEditingId] = useState<string | null>(null);
  // local scratch for editing (per device)
  const [editForm, setEditForm] = useState<Device | null>(null);

  useEffect(() => {
    setDevices([
      {
        id: "1",
        imei: "123456789012345",
        name: "Garmin InReach Mini",
        make: "garmin",
        model: "Mini"
      },
      {
        id: "2",
        imei: "987654321098765",
        name: "Spot Gen4",
        make: "spot",
        model: "Gen4"
      }
    ]);
  }, []);

  // Start editing a device
  function startEditing(device?: Device) {
    if (device) {
      setEditingId(device.id);
      setEditForm({ ...device });
    } else {
      // new row
      const newId = "new-" + Date.now();
      setDevices((ds) => [{ id: newId, imei: "", name: "", make: "garmin", model: "" }, ...ds]);
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

  function deleteDevice(id: string) {
    setDevices((ds) => ds.filter(dev => dev.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditForm(null);
    }
    toast.current?.show({ severity: "warn", summary: "Device deleted", life: 1000 });
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
            <div className="flex gap-2 justify-end">
              <Button
                icon="pi pi-check"
                className="p-button-sm p-button-success"
                onClick={() => editForm && saveDevice(editForm)}
                disabled={!editForm?.imei || !editForm?.name || !editForm?.make}
              />
              <Button
                icon="pi pi-times"
                className="p-button-text p-button-sm"
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
          <div className="flex gap-1 justify-end">
            <Button
              icon="pi pi-pencil"
              className="p-button-text p-button-sm"
              onClick={() => startEditing(device)}
            />
            <Button
              icon="pi pi-trash"
              className="p-button-text p-button-danger p-button-sm"
              onClick={() => deleteDevice(device.id)}
            />
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      <div className="flex flex-col flex-auto min-h-screen bg-surface-950">
        <div className="rounded-t-3xl bg-surface-0 dark:bg-surface-900 py-2 px-2 lg:px-20 max-w-5xl mx-auto w-full shadow">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-0">
              Device Settings
            </h2>
          </div>

          {/* Stack on small screens, side-by-side on md+ */}
          <div className="flex flex-col md:flex-row gap-10 mt-6">
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
                    className="p-button-primary p-button-sm"
                    onClick={() => startEditing()}
                    disabled={!!editingId}
                  />
                </div>

                {/* Make table horizontally scrollable on narrow screens */}
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
                          <td colSpan={5} className="p-6 text-sm text-gray-400 text-center">
                            No devices added yet.
                          </td>
                        </tr>
                      ) : (
                        devices.map((d) =>
                          <DeviceRow
                            key={d.id}
                            device={d}
                            editing={editingId === d.id}
                          />
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}