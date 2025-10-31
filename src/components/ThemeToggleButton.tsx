"use client";
import React from "react";
import { useTheme } from "./ThemeProvider";
import { Button } from "primereact/button";

export default function ThemeToggleButton() {
  const { theme, toggle } = useTheme();
  return (
    <Button
      icon={theme === "dark" ? "pi pi-sun" : "pi pi-moon"}
      onClick={toggle}
      className="p-button-text"
    />
  );
}
