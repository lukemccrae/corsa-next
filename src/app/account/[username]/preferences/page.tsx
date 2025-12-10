"use client";
import React, { useState } from "react";
import { Card } from "primereact/card";
import { InputSwitch } from "primereact/inputswitch";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { useUser } from "@/src/context/UserContext";
import { useTheme } from "@/src/components/ThemeProvider";
import { Footer } from "@/src/components/Footer";

export default function PreferencesPage() {
  const { user } = useUser();
  const { theme, toggle } = useTheme();
  const [emailNotify, setEmailNotify] = useState(true);

  return (
    <>
      <div className="flex flex-col flex-auto min-h-screen bg-surface-950">
        <div className="rounded-t-3xl bg-surface-0 dark:bg-surface-900 py-8 px-8 lg:px-20 max-w-4xl mx-auto w-full shadow">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-0">
              Preferences
            </h2>
            <p className="text-surface-500 dark:text-surface-300">
              Customize your experience.
            </p>
          </div>
          <Divider />

          <Card className="mb-8 shadow-none border-none">
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <span className="font-medium">Dark Theme</span>
                <InputSwitch checked={theme === "dark"} onChange={toggle} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Email Notifications</span>
                <InputSwitch checked={emailNotify} onChange={e => setEmailNotify(e.value)} />
              </div>
            </div>
          </Card>
          <Button
            label="Save Preferences"
            icon="pi pi-save"
            className="p-button-primary"
            onClick={() => alert("Preferences saved!")}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}