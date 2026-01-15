"use client";
import React from "react";
import { Button } from "primereact/button";
import { useTheme } from "./ThemeProvider";

const DISCORD_INVITE_URL = "https://discord.gg/UPUTkbQMWZ";

export const Footer = () => {
  const { theme } = useTheme();

  const handleDiscordClick = () => {
    window.open(DISCORD_INVITE_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <footer
      className={`bg-gray-900 text-gray-100 border-t border-gray-800 py-6 px-4 mt-auto`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm">© CORSA</div>
        <Button
          icon="pi pi-discord"
          label="Need help?"
          onClick={handleDiscordClick}
        />{" "}
      </div>
    </footer>
  );
};
