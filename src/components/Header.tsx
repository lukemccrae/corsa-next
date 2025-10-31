"use client";

import React, { useRef } from "react";
import { Menubar } from "primereact/menubar";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";
import { useUser } from "../context/UserContext";
import { Avatar } from "primereact/avatar";
import AvatarPanel from "./AvatarPanel";
import ThemeToggleButton from "./ThemeToggleButton"; // Import the ThemeToggleButton component

export default function TemplateDemo() {

  const start = (
    <div className="flex align-items-center gap-2">
      {/* Back to Home Button */}
      <Button
        icon="pi pi-home"
        className="p-button-text p-button-lg"
        onClick={() => {
          window.location.href = `/`; // go to account page
        }}
        aria-label="Home"
      />
    </div>
  );

  const end = (
    <div className="flex align-items-center gap-2 m-2">
      <AvatarPanel></AvatarPanel>
      <ThemeToggleButton></ThemeToggleButton>
    </div>
  );

  return (
    <div className="card">
      <Menubar start={start} end={end} />
    </div>
  );
}
