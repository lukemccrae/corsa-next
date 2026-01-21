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
      className="w-full max-w-4xl"
      contentClassName="pb-0"
      pt={{
        root: { className: "m-4 md:m-8" },
        content: { className: "rounded-lg" },
      }}
    >
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <i className="pi pi-info-circle text-2xl text-blue-500" aria-hidden="true" />
          <div className="flex-1">
            <h2 className="text-xl font-bold m-0 mb-2">Cookie Consent</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 m-0">
              We use cookies to enhance your browsing experience, analyze site traffic, 
              and personalize content. By clicking "Accept All", you consent to our use of cookies.
            </p>
          </div>
        </div>

        {/* Cookie Categories - Expandable */}
        {showPreferences && (
          <div className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-base font-semibold m-0">Cookie Preferences</h3>
            
            {/* Essential Cookies */}
            <div className="flex items-start gap-3">
              <Checkbox
                inputId="essential"
                checked={preferences.essential}
                disabled
                className="mt-1"
                aria-label="Essential cookies (always enabled)"
              />
              <div className="flex-1">
                <label htmlFor="essential" className="font-medium text-sm cursor-not-allowed">
                  Essential Cookies (Required)
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 m-0 mt-1">
                  These cookies are necessary for the website to function and cannot be disabled.
                  They enable core functionality such as security, network management, and accessibility.
                </p>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start gap-3">
              <Checkbox
                inputId="analytics"
                checked={preferences.analytics}
                onChange={() => togglePreference("analytics")}
                className="mt-1"
                aria-label="Analytics cookies"
              />
              <div className="flex-1">
                <label htmlFor="analytics" className="font-medium text-sm cursor-pointer">
                  Analytics Cookies
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 m-0 mt-1">
                  These cookies help us understand how visitors interact with our website by collecting
                  and reporting information anonymously. This helps us improve our service.
                </p>
              </div>
            </div>

            {/* Preference Cookies */}
            <div className="flex items-start gap-3">
              <Checkbox
                inputId="preferences"
                checked={preferences.preferences}
                onChange={() => togglePreference("preferences")}
                className="mt-1"
                aria-label="Preference cookies"
              />
              <div className="flex-1">
                <label htmlFor="preferences" className="font-medium text-sm cursor-pointer">
                  Preference Cookies
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 m-0 mt-1">
                  These cookies enable the website to remember choices you make (such as your preferred
                  language or region) and provide enhanced, more personalized features.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-2">
            {!showPreferences ? (
              <Button
                label="Manage Preferences"
                icon="pi pi-cog"
                severity="secondary"
                outlined
                onClick={() => setShowPreferences(true)}
                className="text-sm"
                aria-label="Manage cookie preferences"
              />
            ) : (
              <Button
                label="Save Preferences"
                icon="pi pi-check"
                severity="success"
                onClick={handleSavePreferences}
                className="text-sm"
                aria-label="Save cookie preferences"
              />
            )}
            <a
              href="/privacy"
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline px-3 py-2"
              aria-label="View privacy policy"
            >
              <i className="pi pi-external-link" aria-hidden="true" />
              Privacy Policy
            </a>
          </div>

          {!showPreferences && (
            <div className="flex gap-2">
              <Button
                label="Reject All"
                severity="secondary"
                outlined
                onClick={handleRejectAll}
                className="text-sm"
                aria-label="Reject all optional cookies"
              />
              <Button
                label="Accept All"
                severity="primary"
                onClick={handleAcceptAll}
                className="text-sm"
                aria-label="Accept all cookies"
              />
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
