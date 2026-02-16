"use client";
import React from "react";
import { Skeleton } from "primereact/skeleton";
import { useTheme } from "./ThemeProvider";

/**
 * ProfileSkeleton
 * 
 * Loading skeleton for the profile page that matches the ProfileClient layout.
 * Shows placeholder elements while server-side data is being fetched.
 */
export default function ProfileSkeleton() {
  const { theme } = useTheme();

  const cardBg = theme === "dark" ? "bg-gray-800" : "bg-white";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Profile header skeleton */}
      <div className="relative">
        {/* Cover image skeleton */}
        <Skeleton
          height="15rem"
          className={`w-full rounded-lg ${theme === "dark" ? "dark:bg-gray-800" : ""}`}
        />

        {/* Avatar and button skeleton */}
        <div className="absolute inset-x-0 -bottom-[3.75rem] flex items-end justify-between px-6">
          <Skeleton
            shape="circle"
            size="7rem"
            className="ring-2 ring-white dark:ring-gray-900 shadow"
          />
          <Skeleton width="6rem" height="2.5rem" className="rounded-md" />
        </div>
      </div>

      {/* Profile info skeleton */}
      <div className="mt-[3.75rem]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="w-full">
            {/* Username skeleton */}
            <Skeleton width="12rem" height="2rem" className="mb-3" />
            
            {/* Bio skeleton */}
            <Skeleton width="100%" height="1rem" className="mb-2" />
            <Skeleton width="80%" height="1rem" className="mb-3" />

            {/* Meta info skeleton */}
            <div className="flex flex-wrap items-center gap-4 mb-2">
              <Skeleton width="10rem" height="1rem" />
              <Skeleton width="8rem" height="1rem" />
            </div>

            {/* Stats skeleton */}
            <div className="flex items-center gap-6">
              <div>
                <Skeleton width="5rem" height="0.875rem" className="mb-1" />
                <Skeleton width="3rem" height="1.5rem" />
              </div>
              <div>
                <Skeleton width="5rem" height="0.875rem" className="mb-1" />
                <Skeleton width="3rem" height="1.5rem" />
              </div>
            </div>
          </div>
        </div>

        {/* Feed items skeleton */}
        <div className="max-w-xl mx-auto py-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`${cardBg} border ${borderColor} rounded-lg p-4 shadow`}
            >
              {/* Feed item header */}
              <div className="flex items-start gap-3 mb-3">
                <Skeleton shape="circle" size="3rem" />
                <div className="flex-1">
                  <Skeleton width="8rem" height="1rem" className="mb-2" />
                  <Skeleton width="6rem" height="0.875rem" />
                </div>
              </div>
              
              {/* Feed item content */}
              <Skeleton width="100%" height="1rem" className="mb-2" />
              <Skeleton width="90%" height="1rem" className="mb-3" />
              
              {/* Feed item image */}
              <Skeleton width="100%" height="12rem" className="rounded-md mb-3" />
              
              {/* Feed item actions */}
              <div className="flex items-center gap-4">
                <Skeleton width="4rem" height="1.5rem" />
                <Skeleton width="4rem" height="1.5rem" />
                <Skeleton width="4rem" height="1.5rem" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
