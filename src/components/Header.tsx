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
    <div className="flex align-items-center gap-2">
      <Button
        className="p-button-text"
        style={{ fontSize: "1.25rem !important" }}
        onClick={() => {
          window.location.href = `/`;
        }}
        aria-label="Home"
      >
        {" "}
        {/* <img
          src="/burrito.png"
          alt="Burrito"
          style={{ width: "36px", height: "36px" }}
        /> */}
      </Button>
    </div>
  );

  const end = (
    <div className="flex align-items-centerm-2">
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
