// src/app/account/[username]/layout.tsx
"use client";

import React from "react";
import { PanelMenu } from "primereact/panelmenu";
import Link from "next/link";
import { Divider } from "primereact/divider";
import { Footer } from "../../components/Footer";
import { useUser } from "../../context/UserContext";

// Sidebar navigation model — ensure user context is loaded in layout!
function SidebarNav() {
  const { user } = useUser();
  const sidebarItems = [
    {
      label: "Account",
      template: () => (
        <Link
          href={`/settings/account`}
          className="flex items-center gap-2 p-2 no-underline text-inherit"
        >
          <span>Account</span>
        </Link>
      ),
    },
    {
      label: "Devices",
      template: () => (
        <Link
          href={`/settings/devices`}
          className="flex items-center gap-2 p-2 no-underline text-inherit"
        >
          <span>Devices</span>
        </Link>
      ),
    },
    {
      label: "Preferences",
      template: () => (
        <Link
          href={`/settings/preferences`}
          className="flex items-center gap-2 p-2 no-underline text-inherit"
        >
          <span>Preferences</span>
        </Link>
      ),
    },
    {
      label: "Privacy",
      template: () => (
        <Link
          href={`/settings/privacy`}
          className="flex items-center gap-2 p-2 no-underline text-inherit"
        >
          <span>Privacy</span>
        </Link>
      ),
    },
        {
      label: "Routes",
      template: () => (
        <Link
          href={`/settings/routes`}
          className="flex items-center gap-2 p-2 no-underline text-inherit"
        >
          <span>Routes</span>
        </Link>
      ),
    }
  ];
  return (
    <aside className="flex-none w-52">
      <PanelMenu
        model={sidebarItems}
        className="bg-transparent border-none text-surface-700 dark:text-surface-200"
      />
    </aside>
  );
}

export default function AccountSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-surface-950">
      <div className="rounded-t-3xl bg-surface-0 dark:bg-surface-900 py-8 px-8 lg:px-20 max-w-5xl mx-auto w-full shadow">
        <div className="flex flex-row gap-10 mt-6">
          <SidebarNav />
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
