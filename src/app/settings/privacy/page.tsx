"use client";
import React, { useState } from "react";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";
import { Footer } from "@/src/components/Footer";

export default function PrivacyPage() {
  // Example state hooks for toggles; replace with real values/integration as needed
  const [publicProfile, setPublicProfile] = useState(true);
  const [activityTracking, setActivityTracking] = useState(true);

  function handleExportData() {
    // Wire this up to a real backend/export action in production.
    alert("We'll email you a link to download your data.");
  }

  return (
    <>
      <div className="flex flex-col flex-auto min-h-screen bg-surface-950">
        <div className="rounded-t-3xl bg-surface-0 dark:bg-surface-900 py-8 px-8 lg:px-20 max-w-4xl mx-auto w-full shadow">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-0">
              Privacy & Data
            </h2>
          </div>
          <Divider />

          <Card className="mb-8 shadow-none border-none">
            <div className="flex flex-col gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-2">Privacy Controls</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Control what information about you is shared and how your activity is tracked.
                </p>
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Show my profile publicly</span>
                    <InputSwitch checked={publicProfile} onChange={e => setPublicProfile(e.value)} />
                  </div>
                </div>
              </div>

              <Divider />

              <div>
                <h3 className="font-semibold text-lg mb-2">Download My Data</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Download a copy of your stored data.
                </p>
                <Button
                  label="Request Data Export"
                  icon="pi pi-download"
                  className="p-button-secondary"
                  onClick={handleExportData}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}