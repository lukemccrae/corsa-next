"use client";
import React, { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { useTheme } from "./ThemeProvider";

export default function DailyLimitMessage() {
  const { theme } = useTheme();
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setUTCHours(24, 0, 0, 0);

      const diff = midnight.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("00:00:00");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const formatted = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      setTimeRemaining(formatted);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, []);

  const cardBg =
    theme === "dark"
      ? "bg-amber-900/20 border-amber-700/50"
      : "bg-amber-50 border-amber-300";
  const textColor = theme === "dark" ? "text-amber-200" : "text-amber-900";
  const iconColor = theme === "dark" ? "text-amber-400" : "text-amber-600";

  return (
    <Card className={`${cardBg} border p-4 mb-4`}>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <i className={`pi pi-info-circle text-xl ${iconColor}`} />
          <h3 className={`text-lg font-semibold ${textColor}`}>
            Daily Signup Limit Reached
          </h3>
        </div>
        <p className={`text-sm text-center ${textColor}`}>
          The daily limit for new signups has been reached. Signups will reset
          at midnight UTC.
        </p>
        <div className="flex flex-col items-center gap-2 mt-2">
          <div className="flex items-center gap-2">
            <i className={`pi pi-clock text-2xl ${iconColor}`} />
            <span className={`text-3xl font-bold tabular-nums ${textColor}`}>
              {timeRemaining}
            </span>
          </div>
          <p className={`text-xs ${textColor} opacity-75`}>
            Time until signups reset
          </p>
        </div>
      </div>
    </Card>
  );
}
