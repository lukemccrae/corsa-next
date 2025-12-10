"use client";
import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";
import { Calendar } from "primereact/calendar";
import { useRouter } from "next/navigation";

type CreateTrackerModalProps = {
  visible: boolean;
  onHide: () => void;
};

export default function CreateTrackerModal({ visible, onHide }: CreateTrackerModalProps) {
  const router = useRouter();

  // Example device/route lists — replace with fetched data if you have APIs
  const deviceOptions = [
    { label: "Garmin", value: "garmin" },
    { label: "Bivy", value: "bivy" },
    { label: "Phone (GPS)", value: "phone" },
  ];

  const routeOptions = [
    { label: "Select a route...", value: "" },
    { label: "Coastal 50k", value: "coastal-50k" },
    { label: "Mountain Loop", value: "mountain-loop" },
    { label: "Custom (upload later)", value: "custom" },
  ];

  const [device, setDevice] = useState<string | undefined>(deviceOptions[0].value);
  const [route, setRoute] = useState<string | undefined>(routeOptions[0].value);
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [startNow, setStartNow] = useState<boolean>(true);
  const [startTime, setStartTime] = useState<Date | null>(new Date());

  useEffect(() => {
    // when opening modal, set defaults
    if (visible) {
      setDevice(deviceOptions[0].value);
      setRoute(routeOptions[0].value);
      setName("");
      setIsPublic(true);
      setStartNow(true);
      setStartTime(new Date());
    }
  }, [visible]);

  const submit = () => {
    const chosenStart = startNow ? new Date() : startTime ?? new Date();
    // For now redirect to /track/new with query params (server or page can pick these up)
    const params = new URLSearchParams({
      device: device ?? "",
      route: route ?? "",
      name: name ?? "",
      public: isPublic ? "1" : "0",
      start: chosenStart.toISOString(),
    });

    // Close modal first for nicer UX
    onHide();

    // Navigate to tracker creation page (implement server-side or page to accept these)
    router.push(`/track/new?${params.toString()}`);
  };

  const footer = (
    <div className="flex justify-between items-center gap-2">
      <div />
      <div className="flex gap-2">
        <Button label="Cancel" className="p-button-text" onClick={onHide} />
        <Button
          label="Start Tracker"
          onClick={submit}
          disabled={!name.trim()}
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
          <Dropdown
            value={device}
            options={deviceOptions}
            onChange={(e) => setDevice(e.value)}
            className="w-full"
            placeholder="Select device"
          />
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