'use client';

import React, { useRef } from "react";
import { Avatar } from "primereact/avatar";
import { Menubar } from "primereact/menubar";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";

export default function TemplateDemo() {
  const menuRef = useRef<Menu>(null);

  const items = [
    { label: "Home", icon: "pi pi-home" },
    { label: "Features", icon: "pi pi-star" },
  ];

  const start = (
    <img
      alt="logo"
      src="https://primefaces.org/cdn/primereact/images/logo.png"
      height="40"
      className="mr-2"
    />
  );

  // Dropdown options
  const profileItems = [
    { label: "Sign In", icon: "pi pi-sign-in", command: () => console.log("Sign In clicked") },
    { label: "Register", icon: "pi pi-user-plus", command: () => console.log("Register clicked") },
  ];

  const end = (
    <div className="flex align-items-center gap-2">
      {/* Menu component for dropdown */}
      <Menu model={profileItems} popup ref={menuRef} />
      {/* Avatar wrapped in button */}
      <Button
        className="p-button-rounded p-button-text p-button-plain"
        onClick={(e) => menuRef.current?.toggle(e)}
      >
        <i className="pi pi-user" style={{ fontSize: '2.5rem' }}></i>
        {/* <Avatar
          image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
          shape="circle"
          size="large"
        /> */}
      </Button>
    </div>
  );

  return (
    <div className="card">
      <Menubar model={items} start={start} end={end} />
    </div>
  );
}
