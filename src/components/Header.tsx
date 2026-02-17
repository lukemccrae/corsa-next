"use client";

import React, { useRef } from "react";
import { Menubar } from "primereact/menubar";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";
import { useUser } from "../context/UserContext";
import { Avatar } from "primereact/avatar";
import AvatarPanel from "./AvatarPanel";
import ThemeToggleButton from "./ThemeToggleButton"; // Import the ThemeToggleButton component
import { CreateButton } from "./CreateButton";

export default function TemplateDemo() {
  const start = (
    <div className="flex items-center gap-2 px-4 md:px-6 lg:px-8">
      <a
        href="/"
        className="cursor-pointer transition-all duration-300 hover:scale-110"
        aria-label="Home"
      >
        <img
          src="/logo2.png"
          alt="Logo"
          className="w-12 h-12 animate-hue-rotate"
        />
      </a>
    </div>
  );

  const end = (
    <div className="flex align-items-centerm-2 px-4 md:px-6 lg:px-8">
      {/* <CreateButton></CreateButton> */}
      <AvatarPanel></AvatarPanel>
    </div>
  );

  return (
    <div className="card">
      <Menubar start={start} end={end} />
    </div>
  );
}
