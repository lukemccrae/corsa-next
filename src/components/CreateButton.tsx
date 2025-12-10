// src/components/CreateButton.tsx
"use client";
import React, { useRef } from "react";
import { useUser } from "../context/UserContext";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { useRouter } from "next/navigation";

export function CreateButton() {
  const { user } = useUser();
  const opRef = useRef<OverlayPanel>(null);
  const router = useRouter();

  if (!user) return null;

  return (
    <>
      <Button
        icon="pi pi-plus"
        className="p-button-primary"
        rounded
        aria-label="Create new"
        onClick={(e) => opRef.current?.toggle(e)}
      />
      <OverlayPanel ref={opRef} className="p-2 min-w-[160px] rounded-lg shadow">
        <div className="flex flex-col gap-1">
          <Button
            label="Blog"
            icon="pi pi-file-edit"
            className="p-button-text text-left w-full justify-start"
            onClick={() => {
              opRef.current?.hide();
              router.push("/blog/new");
            }}
          />
          <Button
            label="Tracker"
            icon="pi pi-map-marker"
            className="p-button-text text-left w-full justify-start"
            onClick={() => {
              opRef.current?.hide();
              router.push("/track/new"); // adjust if you want to support tracker creation
            }}
          />
        </div>
      </OverlayPanel>
    </>
  );
}