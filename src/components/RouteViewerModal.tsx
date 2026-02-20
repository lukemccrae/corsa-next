"use client";

import React from "react";
import { Dialog } from "primereact/dialog";
import { Route } from "@/src/generated/schema";
import RouteViewer from "./RouteViewer";

type Props = {
  visible: boolean;
  onHide: () => void;
  route: Route | null;
};

export default function RouteViewerModal({ visible, onHide, route }: Props) {
  return (
    <Dialog
      header={route?.name ? `Route: ${route.name}` : "Route"}
      visible={visible}
      onHide={onHide}
      modal
      dismissableMask
      className="w-[95vw] max-w-5xl"
      contentClassName="p-0"
    >
      {visible && route && <RouteViewer route={route} />}
    </Dialog>
  );
}
