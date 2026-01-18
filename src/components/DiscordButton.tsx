"use client"; // ← this tells Next.js this is a client component

import { Button } from "primereact/button";

export default function DiscordButton() {
  return (
    <Button
      icon="pi pi-discord"
      label="Burrito Labs"
      onClick={() =>
        window.open("https://discord.gg/UPUTkbQMWZ", "_blank", "noopener,noreferrer")
      }
    />
  );
}