"use client";
import React from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Divider } from "primereact/divider";
import { useUser } from "@/src/context/UserContext";
import { Footer } from "@/src/components/Footer";

const mockDevices = [
  { id: "garmin-123", name: "Garmin 945", status: "Connected", lastSync: "2025-10-14 10:30" },
  { id: "bivy-456", name: "Bivy Stick", status: "Disconnected", lastSync: "2025-09-01 13:00" },
];

export default function DevicesPage() {
  const { user } = useUser();

  return (
    <>
      <div className="flex flex-col flex-auto min-h-screen bg-surface-950">
        <div className="rounded-t-3xl bg-surface-0 dark:bg-surface-900 py-8 px-8 lg:px-20 max-w-4xl mx-auto w-full shadow">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-0">
              Device Management
            </h2>
            <p className="text-surface-500 dark:text-surface-300">
              View and manage your linked devices.
            </p>
          </div>
          <Divider />
          <Card className="mb-8 shadow-none border-none">
            <DataTable value={mockDevices} paginator rows={5} stripedRows size="small">
              <Column field="name" header="Device" />
              <Column field="status" header="Status" />
              <Column field="lastSync" header="Last Sync" />
              <Column
                body={(row) => (
                  <Button
                    label={row.status === "Connected" ? "Disconnect" : "Connect"}
                    size="small"
                    className="p-button-text"
                  />
                )}
              />
            </DataTable>
          </Card>
          <Button
            label="Add Device"
            icon="pi pi-plus"
            className="p-button-outlined"
            onClick={() => alert("Add new device")}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}