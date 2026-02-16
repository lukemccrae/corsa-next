"use client";
import React from "react";
import { Skeleton } from "primereact/skeleton";
import { useTheme } from "./ThemeProvider";

/**
 * LiveProfileSkeleton
 * 
 * Loading skeleton for the live profile page that matches the LiveProfileClient layout.
 * Shows placeholder elements while server-side data is being fetched.
 */
export default function LiveProfileSkeleton() {
  const { theme } = useTheme();

  const cardBg = theme === "dark" ? "bg-gray-900/95" : "bg-white/95";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* LiveProfileCard skeleton */}
      <div
        className={`${cardBg} border ${borderColor} rounded-lg shadow-lg backdrop-blur-sm p-4`}
      >
        <div className="flex items-start gap-3">
          {/* Profile picture skeleton */}
          <Skeleton
            shape="circle"
            size="4rem"
            className="ring-2 ring-white dark:ring-gray-800 flex-shrink-0"
          />

          {/* Stream info skeleton */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <Skeleton width="10rem" height="1.5rem" className="mb-2" />
                <Skeleton width="8rem" height="1rem" />
              </div>
              <Skeleton width="5rem" height="2rem" className="rounded-full" />
            </div>
            
            {/* Stats row skeleton */}
            <div className="flex items-center gap-4 mt-2">
              <Skeleton width="6rem" height="1rem" />
            </div>
          </div>
        </div>
      </div>

      {/* Map skeleton */}
      <div
        className={`${cardBg} border ${borderColor} rounded-lg shadow-lg overflow-hidden`}
      >
        <Skeleton width="100%" height="24rem" />
      </div>

      {/* Chat section skeleton */}
      <div
        className={`${cardBg} border ${borderColor} rounded-lg shadow-lg p-4`}
      >
        <div className="flex items-center gap-2 mb-4">
          <Skeleton shape="circle" size="1.5rem" />
          <Skeleton width="8rem" height="1.25rem" />
        </div>
        
        {/* Chat messages skeleton */}
        <div className="space-y-3 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-2">
              <Skeleton shape="circle" size="2rem" />
              <div className="flex-1">
                <Skeleton width="6rem" height="0.875rem" className="mb-1" />
                <Skeleton width="100%" height="1rem" />
              </div>
            </div>
          ))}
        </div>

        {/* Chat input skeleton */}
        <Skeleton width="100%" height="2.5rem" className="rounded-md" />
      </div>

      {/* Activity heatmap skeleton */}
      <div
        className={`${cardBg} border ${borderColor} rounded-lg shadow-lg p-4`}
      >
        <Skeleton width="10rem" height="1.5rem" className="mb-4" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton width="4rem" height="1rem" />
              <Skeleton width="100%" height="2rem" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
