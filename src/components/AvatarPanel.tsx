"use client";

import React, { useMemo, useRef } from "react";
import { Avatar } from "primereact/avatar";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import type { MenuItem } from "primereact/menuitem";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";
import { useModal } from "./ModalProvider";

export default function AvatarPanel() {
  const { user, logoutUser } = useUser();
  const { openLogin } = useModal();
  const router = useRouter();

  const userPanelRef = useRef<OverlayPanel>(null);
  const guestPanelRef = useRef<OverlayPanel>(null);

  const closeUserPanel = () => userPanelRef.current?.hide();
  const closeGuestPanel = () => guestPanelRef.current?.hide();

  const userMenuItems: MenuItem[] = useMemo(() => {
    if (!user?.preferred_username) return [];

    const go = (href: string) => {
      closeUserPanel();
      router.push(href);
    };

    return [
      { label: "Preferences", command: () => go("/preferences") },
      { label: "Routes", command: () => go("/routes") },
      { label: "Devices", command: () => go("/devices") },
      { label: "Account", command: () => go("/account") },
      { separator: true },
      {
        label: "My Profile",
        command: () => go(`/profile/${user.preferred_username}`),
      },
      { separator: true },
      {
        label: "Log out",
        command: () => {
          closeUserPanel();
          logoutUser?.();
        },
      },
    ];
  }, [router, logoutUser, user?.preferred_username]);

  const guestMenuItems: MenuItem[] = useMemo(() => {
    return [
      {
        label: "Sign in",
        command: () => {
          closeGuestPanel();
          openLogin();
        },
      },
    ];
  }, [openLogin]);

  return (
    <div className="flex items-center">
      {user ? (
        <>
          <Avatar
            image={user.picture}
            shape="circle"
            size="large"
            onClick={(e) => userPanelRef.current?.toggle(e)}
            className="cursor-pointer"
          />
          <OverlayPanel ref={userPanelRef}>
            <Menu model={userMenuItems} className="w-64" />
          </OverlayPanel>
        </>
      ) : (
        <>
          <Button
            onClick={(e) => guestPanelRef.current?.toggle(e)}
            icon="pi pi-user"
            text
            rounded
            aria-label="Account"
          />
          <OverlayPanel ref={guestPanelRef}>
            <Menu model={guestMenuItems} className="w-56" />
          </OverlayPanel>
        </>
      )}
    </div>
  );
}
