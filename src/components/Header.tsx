"use client";

import React, { useRef } from "react";
import { Menubar } from "primereact/menubar";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";
import { useUser } from "../context/UserContext";
import { Avatar } from "primereact/avatar";
import AvatarPanel from "./AvatarPanel";

export default function TemplateDemo() {
  const menuRef = useRef<Menu>(null);

  const start = (
    <img
      alt="logo"
      src="https://primefaces.org/cdn/primereact/images/logo.png"
      height="40"
      className="mr-2"
    />
  );

  const end = (
    <div className="flex align-items-center gap-2">
      <AvatarPanel></AvatarPanel>
    </div>
  );

  return (
    <div className="card">
      <Menubar start={start} end={end} />
    </div>
  );
}
