import React from "react";
import Sidebar from "../../components/Sidebar";

// Layout applied to all pages under app/(with-sidebar)/...
export default function WithSidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 min-h-0 flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-h-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}