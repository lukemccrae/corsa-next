"use client";
import React from "react";
import Sidebar from "../../components/Sidebar";

export default function WithSidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full min-h-0">
      <Sidebar />
      <div className="flex-1 min-h-0 overflow-auto">
        {children}
      </div>
    </div>
  );
}