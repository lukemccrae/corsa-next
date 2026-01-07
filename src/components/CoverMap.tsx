"use client";
import React, { useState, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import { useTheme } from "./ThemeProvider";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import type { Waypoint } from "../generated/schema";

type CoverMapProps = {
  username: string;
  waypoints: Waypoint[];
  profilePicture: string;
};

export default function CoverMap(props: CoverMapProps) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const tileUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";

  // Determine the actual center:  current location or provided center
  const mapCenter = useMemo<[number, number]>(() => {

    const lastWaypoint = props.waypoints[props.waypoints.length - 1];
    return [lastWaypoint.lat, lastWaypoint.lng];
  }, [props.waypoints]);

  const lastWaypoint = useMemo(() => {
    const last = props.waypoints[props.waypoints.length - 1];
    return [last.lat, last.lng] as [number, number];
  }, [props.waypoints]);
  // Create icon for the athlete's current position
  const createAthleteIcon = () => {
    if (props.profilePicture) {
      return L.divIcon({
        className: "athlete-marker",
        html: `
          <div style="position: relative;">
            <img 
              src="${props.profilePicture}" 
              style="width:40px; height:40px; border-radius:50%; border:3px solid #3b82f6; box-shadow:0 0 8px rgba(59,130,246,0.5); object-fit:  cover;" 
              alt="${props.username}"
            />
            <div style="
              position: absolute;
              bottom: -2px;
              right: -2px;
              width: 12px;
              height: 12px;
              background:  #10b981;
              border:  2px solid white;
              border-radius: 50%;
              box-shadow: 0 0 4px rgba(0,0,0,0.3);
            "></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });
    }

    // Fallback icon if no profile picture
    const initials = props.username?.charAt(0).toUpperCase() || "? ";
    return L.divIcon({
      className: "athlete-marker-fallback",
      html: `
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: 3px solid white;
          box-shadow: 0 0 8px rgba(59,130,246,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
        ">
          ${initials}
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  };

  // Create icon for waypoint markers
  const createWaypointIcon = (index: number) => {
    return L.divIcon({
      className: "waypoint-marker",
      html: `
        <div style="
          width: 12px;
          height: 12px;
          border-radius:  50%;
          background: rgba(0, 0, 0, 0.9);
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: bold;
        ">
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });
  };

  // Format time
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "N/A";
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return "Invalid date";
    }
  };

  const MapContent = ({ isExpanded = false }: { isExpanded?: boolean }) => (
    <MapContainer
      center={mapCenter}
      zoom={14}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={isExpanded}
      dragging={isExpanded}
      doubleClickZoom={isExpanded}
      attributionControl={false}
      zoomControl={isExpanded}
    >
      <TileLayer
        url={tileUrl}
        attribution="Map data: &copy; OpenStreetMap contributors"
        maxZoom={17}
      />

      {/* Route polyline */}
      {props.waypoints && props.waypoints.length > 1 && (
        <Polyline
          positions={props.waypoints.map((wp) => [wp.lat, wp.lng])}
          pathOptions={{ color: "#3b82f6", weight: 3, opacity: 0.9 }}
        />
      )}

      {/* Current location marker with profile picture */}
      {(
        <Marker
          position={lastWaypoint}
          icon={createAthleteIcon()}
        >
          <Popup>
            <div className="text-sm">
              <div className="font-semibold mb-1">@{props.username}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Current Position
              </div>
              <div className="text-xs mt-1">
                Lat: {lastWaypoint[0].toFixed(5)}
                <br />
                Lng: {lastWaypoint[1].toFixed(5)}
              </div>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Waypoint markers */}
      {props.waypoints?.map((waypoint, index) => {
        if (!waypoint.lat || !waypoint.lng) return null;

        return (
          <Marker
            key={`waypoint-${index}-${waypoint.timestamp}`}
            position={[waypoint.lat, waypoint.lng]}
            icon={createWaypointIcon(index)}
          >
            <Popup>
              <div className="text-sm min-w-[200px]">
                <div className="font-semibold mb-2">Waypoint {index + 1}</div>

                {waypoint.mileMarker !== null &&
                  waypoint.mileMarker !== undefined && (
                    <div className="text-xs mb-1">
                      <i className="pi pi-flag mr-1" />
                      <strong>Distance: </strong>{" "}
                      {Number(waypoint.mileMarker).toFixed(2)} mi
                    </div>
                  )}

                {waypoint.altitude !== null &&
                  waypoint.altitude !== undefined && (
                    <div className="text-xs mb-1">
                      <i className="pi pi-chart-line mr-1" />
                      <strong>Altitude: </strong>{" "}
                      {Math.round(waypoint.altitude)} ft
                    </div>
                  )}

                {waypoint.cumulativeVert !== null &&
                  waypoint.cumulativeVert !== undefined && (
                    <div className="text-xs mb-1">
                      <i className="pi pi-arrow-up mr-1" />
                      <strong>Vert Gain:</strong>{" "}
                      {Math.round(waypoint.cumulativeVert)} ft
                    </div>
                  )}

                {waypoint.timestamp && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    <i className="pi pi-clock mr-1" />
                    {formatTime(waypoint.timestamp)}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );

  return (
    <>
      <div
        className={`h-60 w-full rounded-lg overflow-hidden relative`}
      >
        <MapContent />
        <div className="absolute top-2 right-2 z-[1000]">
          <Button
            icon="pi pi-window-maximize"
            rounded
            text
            severity="secondary"
            onClick={() => setExpanded(true)}
            className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg"
            aria-label="Expand map"
            tooltip="Expand map"
            tooltipOptions={{ position: "left" }}
          />
        </div>
      </div>

      <Dialog
        visible={expanded}
        onHide={() => setExpanded(false)}
        header="Map View"
        modal
        dismissableMask
        maximizable
        style={{ width: "90vw", height: "90vh" }}
        contentClassName="p-0"
      >
        <div className="w-full h-full" style={{ minHeight: "70vh" }}>
          <div className={`h-full ${theme === "dark" ? "dark-topo" : ""}`}>
            <MapContent isExpanded />
          </div>
        </div>
      </Dialog>
    </>
  );
}
