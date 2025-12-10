// src/components/CreateButton.tsx
"use client";
import React, { useRef, useState } from "react";
import { useUser } from "../context/UserContext";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { useRouter } from "next/navigation";
import CreateTrackerModal from "./CreateTrackerModal";

export function CreateButton() {
  const { user } = useUser();
  const opRef = useRef<OverlayPanel>(null);
  const router = useRouter();
  const [trackerModalOpen, setTrackerModalOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <Button
        icon="pi pi-plus"
        className="p-button-primary"
        rounded
        aria-label="Create new"
        onClick={() => {
              opRef.current?.hide();
              setTrackerModalOpen(true);
            }}
      />

      <CreateTrackerModal visible={trackerModalOpen} onHide={() => setTrackerModalOpen(false)} />
    </>
  );
}