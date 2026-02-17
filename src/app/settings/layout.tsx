// src/app/settings/layout.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { Avatar } from "primereact/avatar";
import { usePathname } from "next/navigation";
import { useUser } from "../../context/UserContext";
import { useTheme } from "../../components/ThemeProvider";

/**
 * Responsive settings layout for /settings/*
 *
 * - desktop (md+): left sticky navigation column + content
 * - mobile: top header with menu button that opens a PrimeReact Sidebar (drawer)
 *
 * Notes:
 * - Footer remains handled by pages that render it (consistent with existing pages).
 * - Uses Tailwind for styling and PrimeReact base components (Sidebar, Button, Avatar).
 */

const MENU = [
  { key: "account", label: "Account", href: "/settings/account", icon: "pi pi-user" },
  { key: "devices", label: "Devices", href: "/settings/devices", icon: "pi pi-mobile" },
  { key: "preferences", label: "Preferences", href: "/settings/preferences", icon: "pi pi-cog" },
  // { key: "privacy", label: "Privacy", href: "/settings/privacy", icon: "pi pi-lock" },
  { key: "routes", label: "Routes", href: "/settings/routes", icon: "pi pi-map" },
  // { key: "integrations", label: "Integrations", href: "/settings/integrations", icon: "pi pi-file-import" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const { theme } = useTheme();

  const navBg = theme === "dark" ? "bg-gray-800" : "bg-gray-50";
  const contentBg = theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900";

  const isActive = (href: string) => pathname?.startsWith(href);

  const NavList = ({ onItemClick }: { onItemClick?: () => void }) => (
    <nav aria-label="Settings navigation" className="flex flex-col min-h-[200px]">
      <div className="px-3 py-2 border-b border-gray-100 dark:border-white/6">
        <div className="text-xs font-semibold text-gray-400">Settings</div>
      </div>

      <ul className="p-2 flex flex-col gap-1">
        {MENU.map((m) => (
          <li key={m.key}>
            {/* Use Link without nested <a> to satisfy Next 13+ rules */}
            <Link
              href={m.href}
              onClick={onItemClick}
              className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md transition-colors text-sm ${
                isActive(m.href)
                  ? "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-200"
                  : "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200"
              }`}
              aria-current={isActive(m.href) ? "page" : undefined}
            >
              {m.icon && <i className={`${m.icon} text-xs`} aria-hidden />}
              <span className="truncate text-sm">{m.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* optional user info at bottom of nav */}
      <div className="mt-auto px-2.5 py-2 border-t border-gray-100 dark:border-white/6">
        {user ? (
          <div className="flex items-center gap-2">
            <Avatar
              image={user.picture ?? undefined}
              label={!user.picture ? user.preferred_username?.charAt(0).toUpperCase() : undefined}
              size="normal"
              shape="circle"
              className="!w-8 !h-8"
            />
            <div className="min-w-0">
              <div className="text-xs font-medium truncate">{user.preferred_username}</div>
              <div className="text-xs text-gray-400 truncate">{user.email}</div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500">Not signed in</div>
        )}
      </div>
    </nav>
  );

  return (
    <div className="flex flex-col bg-surface-950">
      <div className="rounded-t-3xl bg-surface-0 dark:bg-surface-900 py-3 px-3 lg:px-8 w-full shadow">
        {/* header */}
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 mb-3">


          {/* mobile menu toggle */}
          <div className="md:hidden">
            <Button
              icon="pi pi-bars"
              className="p-button-text text-sm"
              aria-label="Open settings menu"
              onClick={() => setOpen(true)}
            />
          </div>
        </div>

        {/* layout: desktop nav + content */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[14rem_1fr] gap-3">
          {/* desktop sidebar */}
          <aside
            className={`hidden md:flex flex-col rounded-lg overflow-hidden shadow ${navBg} border border-gray-100 dark:border-white/6`}
            aria-hidden={false}
          >
            <div className="flex-1">
              <NavList />
            </div>
          </aside>

          {/* mobile sidebar (PrimeReact Sidebar) */}
          <Sidebar
            visible={open}
            onHide={() => setOpen(false)}
            position="left"
            className="w-64"
            aria-label="Settings menu"
          >
            <div className="px-2 py-3">
              <NavList onItemClick={() => setOpen(false)} />
            </div>
          </Sidebar>

          {/* main content */}
          <main className={`min-w-0 ${contentBg} rounded-lg p-3 border border-gray-100 dark:border-white/6 shadow-sm`}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}