"use client";
import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";

type CookiePreferences = {
  essential: boolean;
  analytics: boolean;
  preferences: boolean;
  timestamp: number;
};

const STORAGE_KEY = "cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    preferences: false,
    timestamp: Date.now(),
  });

  // Check if user has already made a choice
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      // Show dialog if no consent decision has been made
      setVisible(true);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    const prefsWithTimestamp = {
      ...prefs,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefsWithTimestamp));
    setVisible(false);
  };

  const handleAcceptAll = () => {
    savePreferences({
      essential: true,
      analytics: true,
      preferences: true,
      timestamp: 0, // Will be set by savePreferences
    });
  };

  const handleRejectAll = () => {
    savePreferences({
      essential: true,
      analytics: false,
      preferences: false,
      timestamp: 0, // Will be set by savePreferences
    });
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === "essential") return; // Essential cookies cannot be disabled
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Dialog
      visible={visible}
      onHide={() => {}} // Don't allow closing without making a choice
      dismissableMask={false}
      closable={false}
      position="bottom"
      className="w-full max-w-2xl"
      contentClassName="pb-0"
      pt={{
        root: { className: "m-2 md:m-4" },
        content: { className: "rounded-lg" },
      }}
    >
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start gap-2">
          <i className="pi pi-cookie text-lg text-blue-500" aria-hidden="true" />
          <div className="flex-1">
            <h2 className="text-base font-semibold m-0 mb-1">Cookie Notice</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 m-0">
              We use cookies for essential site functionality and analytics.
            </p>
          </div>
        </div>

        {/* Cookie Categories - Expandable */}
        {showPreferences && (
          <div className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
            {/* Essential Cookies */}
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="essential"
                checked={preferences.essential}
                disabled
                aria-label="Essential cookies (always enabled)"
              />
              <label htmlFor="essential" className="text-xs cursor-not-allowed">
                Essential (Required)
              </label>
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="analytics"
                checked={preferences.analytics}
                onChange={() => togglePreference("analytics")}
                aria-label="Analytics cookies"
              />
              <label htmlFor="analytics" className="text-xs cursor-pointer">
                Analytics
              </label>
            </div>

            {/* Preference Cookies */}
            <div className="flex items-center gap-2">
              <Checkbox
                inputId="preferences"
                checked={preferences.preferences}
                onChange={() => togglePreference("preferences")}
                aria-label="Preference cookies"
              />
              <label htmlFor="preferences" className="text-xs cursor-pointer">
                Preferences
              </label>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2">
            {!showPreferences ? (
              <Button
                label="Customize"
                severity="secondary"
                text
                onClick={() => setShowPreferences(true)}
                className="text-xs p-2"
                aria-label="Manage cookie preferences"
              />
            ) : (
              <Button
                label="Save"
                severity="success"
                onClick={handleSavePreferences}
                className="text-xs p-2"
                aria-label="Save cookie preferences"
              />
            )}
            <a
              href="/privacy"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline p-2"
              aria-label="View privacy policy"
            >
              Privacy
            </a>
          </div>

          {!showPreferences && (
            <div className="flex gap-2">
              <Button
                label="Reject"
                severity="secondary"
                outlined
                onClick={handleRejectAll}
                className="text-xs p-2"
                aria-label="Reject all optional cookies"
              />
              <Button
                label="Accept"
                severity="primary"
                onClick={handleAcceptAll}
                className="text-xs p-2"
                aria-label="Accept all cookies"
              />
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
