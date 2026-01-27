"use client";
import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useTheme } from "./ThemeProvider";

type RateLimitDialogProps = {
  visible: boolean;
  onHide: () => void;
  resetTime?: string;
};

export default function RateLimitDialog({
  visible,
  onHide,
  resetTime,
}: RateLimitDialogProps) {
  const { theme } = useTheme();

  const cardBg =
    theme === "dark"
      ? "bg-gray-800 border-gray-700 text-gray-100"
      : "bg-white border-gray-200 text-gray-900";

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header="Rate Limit Reached"
      modal
      dismissableMask
      className="w-full max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button label="OK" onClick={onHide} />
        </div>
      }
    >
      <div className={`p-4 ${cardBg} rounded-lg`}>
        <div className="flex gap-3 items-start">
          <i className="pi pi-info-circle text-3xl text-orange-500" />
          <div className="flex-1">
            <h3 className="font-semibold mb-2">We've hit our rate limit</h3>
            <p className="text-sm mb-3">
              We've reached Strava's API rate limit so your data might be inaccurate. This
              is a temporary limitation from Strava. 
              You can still create an account but joining a leaderboard will not work.
              Thank you for your patience! 
            </p>
            {resetTime && (
              <p className="text-sm">
                <strong>We'll be able to refresh your data at</strong> {resetTime}
              </p>
            )}
            <p className="text-sm mt-3 text-gray-500 dark:text-gray-400">
              Thank you for your patience!
            </p>
          </div>
        </div>
      </div>
    </Dialog>
  );
}