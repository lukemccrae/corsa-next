"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import { useUser } from "../../../context/UserContext";
import { useTheme } from "../../../components/ThemeProvider";
import { domain } from "../../../context/domain.context";

const APPSYNC_ENDPOINT = domain.appsync;
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

interface Device {
  imei?: string | null;
  name?: string | null;
  make?: string | null;
  model?: string | null;
  shareUrl?: string | null;
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
  const { user } = useUser();
  const { theme } = useTheme();
  const toast = useRef<Toast>(null);

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const cardBg =
    theme === "dark"
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200";

  useEffect(() => {
    if (user?.preferred_username) fetchDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.preferred_username]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const query = `
        query GetUserDevices($username: String!) {
          getUserByUserName(username: $username) {
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
        body: JSON.stringify({ query, variables: { username: user?.preferred_username } }),
      });
      const result = await response.json();
      const fetched: Device[] =
        result?.data?.getUserByUserName?.devices || [];
      setDevices(fetched);
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

  return (
    <>
      <Toast ref={toast} />
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Devices</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your registered GPS trackers and satellite communicators.
            </p>
          </div>
          <Link href="/settings/devices/register">
            <Button
              label="Register device"
              icon="pi pi-plus"
              disabled={!user}
            />
          </Link>
        </div>

        {/* Device list */}
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <i className="pi pi-spin pi-spinner text-2xl" />
          </div>
        ) : devices.length === 0 ? (
          <Card className={`${cardBg} border`}>
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <i className="pi pi-mobile text-5xl text-gray-300 dark:text-gray-600" />
              <div className="space-y-1">
                <p className="font-medium">No devices registered yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Register your first GPS tracker to start sharing live
                  location data.
                </p>
              </div>
              <Link href="/settings/devices/register">
                <Button
                  label="Register your first device"
                  icon="pi pi-plus"
                  disabled={!user}
                />
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {devices.map((d, idx) => (
              <Card key={d.imei ?? idx} className={`${cardBg} border`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                    <i
                      className={`${deviceIcon(d.make)} text-violet-600 dark:text-violet-300`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {d.name ?? "Unnamed device"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {d.make ?? ""}
                      {d.model ? ` · ${d.model}` : ""}
                      {d.imei ? ` · ${d.imei}` : ""}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
