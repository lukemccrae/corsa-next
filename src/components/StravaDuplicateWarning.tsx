"use client";
import React from "react";
import { Message } from "primereact/message";
import { Button } from "primereact/button";

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

export default function StravaDuplicateWarning({ visible, onDismiss }: Props) {
  if (!visible) return null;

  return (
    <div className="mb-4">
      <Message
        severity="error"
        className="w-full"
        content={
          <div className="flex flex-col gap-3">
            <div>
              <strong className="block mb-2">
                This Strava Account is Already Connected
              </strong>
              <p className="text-sm">
                The Strava account you're trying to connect is already linked to another CORSA account. 
                Each Strava account can only be connected to one CORSA account for leaderboard integrity.
              </p>
            </div>
            
            <div className="text-sm space-y-2">
              <p className="font-semibold">What you can do:</p>
              <ul className="list-disc list-inside pl-2 space-y-1">
                <li>Use a different Strava account</li>
                <li>Log into the CORSA account that's already connected to this Strava account</li>
                <li>Contact support if you believe this is an error</li>
              </ul>
            </div>

            <div className="flex gap-2 mt-2">
              <Button
                label="Dismiss"
                size="small"
                severity="secondary"
                onClick={onDismiss}
              />
              <Button
                label="Contact Support"
                size="small"
                severity="help"
                outlined
                onClick={() => window.open("mailto:support@corsa.run", "_blank")}
              />
            </div>
          </div>
        }
      />
    </div>
  );
}