"use client";
import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useTheme } from "./ThemeProvider";

type StravaLimitDialogProps = {
  visible: boolean;
  onHide: () => void;
  context?: "join" | "refresh" | "connect";
};

export default function StravaLimitDialog({
  visible,
  onHide,
  context = "join",
}: StravaLimitDialogProps) {
  const { theme } = useTheme();

  const contextMessages: Record<string, string> = {
    join: "join the leaderboard",
    refresh: "refresh your leaderboard entry",
    connect: "connect your Strava account",
  };

  const actionMessage = contextMessages[context];

  const footer = (
    <div className="flex justify-end">
      <Button
        label="Got it"
        onClick={onHide}
        className="p-button-primary"
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="flex items-center gap-2">
          <i className="pi pi-exclamation-triangle text-yellow-500 text-xl" />
          <span>Strava API Limit Reached</span>
        </div>
      }
      footer={footer}
      modal
      className="max-w-lg w-full"
    >
      <div className="space-y-4">
        <div className="flex gap-3">
          <i className="pi pi-info-circle text-blue-500 text-xl flex-shrink-0 mt-1" />
          <div className="space-y-2">
            <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
              We've reached our daily limit for Strava API requests and cannot{" "}
              {actionMessage} at this time.
            </p>
            <p className={theme === "dark" ? "text-gray-300" : "text-gray-700"}>
              Please try again tomorrow!
            </p>
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              Strava limits how many times apps can connect to their service
              each day. This helps keep their platform stable for everyone.
            </p>
          </div>
        </div>

        <div
          className={`rounded-lg p-4 ${
            theme === "dark"
              ? "bg-gray-700 text-gray-300"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          <p className="text-sm">
            <strong>Pro tip:</strong> The limit resets at midnight (Strava's
            timezone). Check back tomorrow and you should be good to go!
          </p>
        </div>
      </div>
    </Dialog>
  );
}
