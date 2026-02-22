"use client";
import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";
import { Calendar } from "primereact/calendar";
import { Message } from "primereact/message";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "../context/UserContext";

const APPSYNC_ENDPOINT =
  "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

interface RegisteredDevice {
  imei: string;
  name?: string | null;
  make?: string | null;
}

const routeOptions = [
  { label: "Select a route...", value: "" },
  { label: "Coastal 50k", value: "coastal-50k" },
  { label: "Mountain Loop", value: "mountain-loop" },
  { label: "Custom (upload later)", value: "custom" },
];

type CreateTrackerModalProps = {
  visible: boolean;
  onHide: () => void;
};

export default function CreateTrackerModal({ visible, onHide }: CreateTrackerModalProps) {
  const router = useRouter();
  const { user } = useUser();

  const [registeredDevices, setRegisteredDevices] = useState<RegisteredDevice[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  const [device, setDevice] = useState<string | undefined>(undefined);
  const [route, setRoute] = useState<string | undefined>(routeOptions[0].value);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [startNow, setStartNow] = useState<boolean>(true);
  const [startTime, setStartTime] = useState<Date | null>(new Date());

  useEffect(() => {
    if (visible) {
      setRoute(routeOptions[0].value);
      setName("");
      setIsPublic(true);
      setStartNow(true);
      setStartTime(new Date());
      if (user?.preferred_username) {
        fetchDevices();
      }
    }
  // fetchDevices is defined below and stable within the component lifecycle
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, user?.preferred_username]);

  const fetchDevices = async () => {
    setLoadingDevices(true);
    try {
      const query = `
        query GetUserDevices($username: String!) {
          getUserByUserName(username: $username) {
            devices {
              imei
              name
              make
            }
          }
        }
      `;
      const response = await fetch(APPSYNC_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": APPSYNC_API_KEY },
        body: JSON.stringify({ query, variables: { username: user?.preferred_username } }),
      });
      const result = await response.json();
      const devices: RegisteredDevice[] =
        result?.data?.getUserByUserName?.devices || [];
      setRegisteredDevices(devices);
      if (devices.length > 0) {
        setDevice(devices[0].imei);
      } else {
        setDevice(undefined);
      }
    } catch {
      setRegisteredDevices([]);
      setDevice(undefined);
    } finally {
      setLoadingDevices(false);
    }
  };

  const deviceOptions = registeredDevices.map((d) => ({
    label: `${d.name ?? "Device"}${d.make ? ` (${d.make})` : ""} – ${d.imei}`,
    value: d.imei,
  }));

  const submit = () => {
    const chosenStart = startNow ? new Date() : startTime ?? new Date();
    const params = new URLSearchParams({
      device: device ?? "",
      route: route ?? "",
      name: name ?? "",
      public: isPublic ? "1" : "0",
      start: chosenStart.toISOString(),
    });

    onHide();
    router.push(`/track/new?${params.toString()}`);
  };

  const hasNoDevices = !loadingDevices && registeredDevices.length === 0;

  const footer = (
    <div className="flex justify-between items-center gap-2">
      <div />
      <div className="flex gap-2">
        <Button label="Cancel" className="p-button-text" onClick={onHide} />
        <Button
          label="Start Tracker"
          onClick={submit}
          disabled={!name.trim() || !device || hasNoDevices}
          className="p-button-primary"
        />
      </div>
    </div>
  );

  return (
    <Dialog header="Start a new tracker" visible={visible} onHide={onHide} modal dismissableMask footer={footer} className="max-w-lg w-full">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Device</label>
          {loadingDevices ? (
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <i className="pi pi-spin pi-spinner" /> Loading devices…
            </div>
          ) : hasNoDevices ? (
            <div className="space-y-2">
              <Message
                severity="warn"
                text="You have no registered devices. Register a device before starting a tracker."
                className="w-full"
              />
              <Link href="/devices/register" onClick={onHide}>
                <Button
                  label="Register a device"
                  icon="pi pi-plus"
                  size="small"
                  type="button"
                />
              </Link>
            </div>
          ) : (
            <Dropdown
              value={device}
              options={deviceOptions}
              onChange={(e) => setDevice(e.value)}
              className="w-full"
              placeholder="Select registered device"
            />
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Route</label>
          <Dropdown
            value={route}
            options={routeOptions}
            onChange={(e) => setRoute(e.value)}
            className="w-full"
            placeholder="Select route"
          />
          <div className="text-xs text-gray-400 mt-1">If route is custom, upload/attach a GPX after creation.</div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Tracker Name</label>
          <InputText
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="New Tracker"
            className="w-full"
            required
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Public</label>
            <InputSwitch checked={isPublic} onChange={(e) => setIsPublic(e.value)} />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Start Now</label>
            <InputSwitch checked={startNow} onChange={(e) => setStartNow(e.value)} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Start Time</label>
          <div className="text-xs text-gray-400 mb-1">If "Start Now" is on, this value will be ignored.</div>
          <Calendar
            value={startTime}
            onChange={(e) => setStartTime(e.value as Date)}
            showTime
            hourFormat="24"
            disabled={startNow}
            className="w-full"
            dateFormat="yy-mm-dd"
          />
        </div>
      </form>
    </Dialog>
  );
}