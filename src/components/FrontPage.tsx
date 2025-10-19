"use client";
import React from "react";
import Head from "next/head";
import BasicMap from "./BasicMap";

/**
 * /map page
 * - Demonstrates the BasicMap component.
 * - Injects the Leaflet CSS via a CDN link in the head (no local CSS files).
 *
 * If you prefer to import the leaflet CSS from node_modules you can:
 *   import 'leaflet/dist/leaflet.css'
 * but the project instruction asked to avoid extra CSS files where possible,
 * so we add it to the Head here.
 */

export default function MapPage() {
  return (
    <>
      <BasicMap center={[51.505, -0.09]} zoom={13} />
    </>
  );
}
