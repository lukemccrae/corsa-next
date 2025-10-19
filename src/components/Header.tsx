'use client';

import React, { useRef } from "react";
import { Menubar } from "primereact/menubar";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";
import { useModal } from "./ModalProvider";

export default function TemplateDemo() {
  const menuRef = useRef<Menu>(null);
  const { openLogin } = useModal();

//   const items = [
//     { label: "Home", icon: "pi pi-home", command: () => (window.location.pathname = "/") },
//     { label: "Features", icon: "pi pi-star" },
//     { label: "Login", icon: "pi pi-sign-in", command: () => openLogin() },
//   ];

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
    { label: "Sign In", icon: "pi pi-sign-in", command: () => openLogin() },
    { label: "Register", icon: "pi pi-user-plus", command: () => console.log("Register clicked") },
  ];

  const end = (
    <div className="flex align-items-center gap-2">
      <Menu model={profileItems} popup ref={menuRef} />
      <Button
        className="p-button-rounded p-button-text p-button-plain"
        onClick={(e) => menuRef.current?.toggle(e)}
        icon="pi pi-user"
      >
      </Button>
    </div>
  );

  return (
    <div className="card">
      <Menubar start={start} end={end} />
    </div>
  );
}