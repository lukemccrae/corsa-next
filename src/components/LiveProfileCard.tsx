"use client";
import React, { useMemo, useEffect, useState } from "react";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { useTheme } from "./ThemeProvider";
import { LiveDot } from "./LiveDot";
import Link from "next/link";
import { ElapsedTime } from "./ElapsedTime";

type LiveProfileCardProps = {
  username: string;
  profilePicture?: string;
  streamTitle?: string;
  startTime?: Date;
  onFollowClick?: () => void;
};

export default function LiveProfileCard({
  username,
  profilePicture,
  streamTitle,
  startTime,
}: LiveProfileCardProps) {
  const { theme } = useTheme();
  console.log(startTime)

  const cardBg =
    theme === "dark"
      ? "bg-gray-900/95 border-gray-700"
      : "bg-white/95 border-gray-200";

  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const mutedColor = theme === "dark" ? "text-gray-400" : "text-gray-600";

  return (
    <div
      className={`${cardBg} border rounded-lg shadow-lg backdrop-blur-sm p-4`}
    >
      <div className="flex items-start gap-3">
        {/* Profile Picture with LIVE badge */}
        <Link
          href={`/profile/${username}`}
          className="relative flex-shrink-0 block"
        >
          {profilePicture ? (
            <img
              src={profilePicture}
              alt={username}
              className="w-16 h-16 rounded-full object-cover overflow-hidden ring-2 ring-white dark:ring-gray-800"
            />
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-300 dark:bg-gray-600 ring-2 ring-white dark:ring-gray-800 text-xl font-bold">
              {username?.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        {/* Stream Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Link href={`/profile/${username}`}>
                <h2
                  className={`text-lg font-bold ${textColor} truncate hover:underline cursor-pointer`}
                >
                  {username}
                </h2>
              </Link>
              <p className={`text-sm ${mutedColor} truncate`}>
                {streamTitle || "Live Stream"}
              </p>
            </div>

            {/* Follow Button */}
            <Button
              label="Follow"
              icon="pi pi-heart"
              className="p-button-rounded p-button-outlined flex-shrink-0"
              size="small"
              onClick={() => {}}
            />
          </div>

          {/* Stats row */}
          { startTime && 
            <div
              className={`flex items-center gap-4 mt-2 text-sm ${mutedColor}`}
            >
              <div className="flex items-center gap-1">
                <i className="pi pi-clock text-xs" />
                <ElapsedTime startTime={startTime} />
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
}
