"use client";
import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useTheme } from "./ThemeProvider";
import type { LiveStream, TrackerGroup } from "../generated/schema";

type FullScreenMapProps = {
  center: [number, number];
  zoom?: number;
  className?: string;
  livestreams?:  LiveStream[];
  groups?: TrackerGroup[];
};

export default function FullScreenMap({
  center,
  zoom = 13,
  className = "",
  livestreams = [],
  groups = [],
}:  FullScreenMapProps) {
  const { theme } = useTheme();

  // Create icon for livestreams
  const createStreamIcon = (stream: LiveStream) => {
    const profilePic = stream.user?. profilePicture;
    const title = stream.title || "Untitled";
    const initials = title.charAt(0).toUpperCase();
    const isLive = stream.live;

    const liveIndicator = isLive
      ?  `<div style="
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background:  #ef4444;
          border:  2px solid white;
          border-radius: 50%;
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3);
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        "></div>`
      : "";

    if (profilePic) {
      return L.divIcon({
        className: "livestream-marker",
        html: `
          <div style="position: relative;">
            <img 
              src="${profilePic}" 
              alt="${title}"
              style="
                width:  40px;
                height: 40px;
                border-radius:  50%;
                border: 3px solid ${isLive ? "#ef4444" : "#3b82f6"};
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                object-fit: cover;
                background: white;
              "
            />
            ${liveIndicator}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor:  [20, 40],
        popupAnchor: [0, -40],
      });
    }

    return L.divIcon({
      className: "livestream-marker",
      html: `
        <div style="position: relative;">
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border:  3px solid ${isLive ? "#ef4444" : "#3b82f6"};
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
            box-shadow:  0 2px 8px rgba(0,0,0,0.3);
          ">
            ${initials}
          </div>
          ${liveIndicator}
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor:  [0, -40],
    });
  };

  // Create icon for tracker groups
  const createGroupIcon = (group: TrackerGroup) => {
    const profilePic = group.user?.profilePicture;
    const name = group.name || "Untitled";
    const initials = name.charAt(0).toUpperCase();
    const isLive = group.user?.live;

    const liveIndicator = isLive
      ? `<div style="
          position: absolute;
          top:  -2px;
          right:  -2px;
          width:  12px;
          height:  12px;
          background:  #ef4444;
          border: 2px solid white;
          border-radius: 50%;
        "></div>`
      : "";

    if (profilePic) {
      return L.divIcon({
        className: "group-marker",
        html: `
          <div style="position:  relative;">
            <img 
              src="${profilePic}" 
              alt="${name}"
              style="
                width: 36px;
                height: 36px;
                border-radius:  50%;
                border: 3px solid ${isLive ? "#ef4444" : "#10b981"};
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                object-fit: cover;
                background: white;
              "
            />
            ${liveIndicator}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });
    }

    return L.divIcon({
      className: "group-marker",
      html: `
        <div style="position: relative;">
          <div style="
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border: 3px solid ${isLive ? "#ef4444" : "#10b981"};
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 16px;
            box-shadow:  0 2px 8px rgba(0,0,0,0.3);
          ">
            ${initials}
          </div>
          ${liveIndicator}
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });
  };

  React.useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .leaflet-control-attribution svg { display: none ! important; }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const themeWrapperClass = theme === "dark" ? "dark-topo" : "";

  // Calculate bounds to fit all markers
  const bounds = useMemo(() => {
    const allPoints:  [number, number][] = [];

    livestreams.forEach((stream) => {
      if (stream.currentLocation?. lat && stream.currentLocation?.lng) {
        allPoints.push([stream.currentLocation.lat, stream.currentLocation.lng]);
      }
    });

    groups.forEach((group) => {
      if (group.currentLocation?. lat && group.currentLocation?.lng) {
        allPoints.push([group.currentLocation.lat, group.currentLocation.lng]);
      }
    });

    if (allPoints.length === 0) return undefined;
    return L.latLngBounds(allPoints);
  }, [livestreams, groups]);

  return (
    <div className={`relative w-full h-full ${themeWrapperClass} ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        bounds={bounds}
        boundsOptions={{ padding: [50, 50] }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        />

        {/* Render livestream markers */}
        {livestreams
          .filter((stream) => stream.currentLocation?. lat && stream.currentLocation?.lng)
          .map((stream) => {
            const { lat, lng } = stream.currentLocation! ;
            const username = stream.user?.username;

            return (
              <Marker
                key={stream.streamId}
                position={[lat, lng]}
                icon={createStreamIcon(stream)}
                eventHandlers={{
                  click:  () => {
                    if (username) {
                      window.location.href = `/profile/${username}/${stream.streamId}`;
                    }
                  },
                }}
              >
                <Popup>
                  <div className="min-w-[200px] p-2">
                    <div className="flex items-center gap-2 mb-2">
                      {stream.user?.profilePicture && (
                        <img
                          src={stream.user.profilePicture}
                          alt={username || "User"}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {stream.title}
                        </p>
                        {username && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            @{username}
                          </p>
                        )}
                      </div>
                    </div>

                    {stream.live && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                          LIVE NOW
                        </span>
                      </div>
                    )}

                    {username && (
                      <a
                        href={`/profile/${username}/${stream.streamId}`}
                        className="inline-block w-full text-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                      >
                        View Stream
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Render tracker group markers */}
        {groups
          .filter((group) => group.currentLocation?.lat && group.currentLocation?.lng)
          .map((group) => {
            const { lat, lng } = group.currentLocation!;
            const username = group.user?.username;

            return (
              <Marker
                key={group. groupId}
                position={[lat, lng]}
                icon={createGroupIcon(group)}
                eventHandlers={{
                  click:  () => {
                    // Navigate to group page when implemented
                    console.log("Group clicked:", group.groupId);
                  },
                }}
              >
                <Popup>
                  <div className="min-w-[180px] p-2">
                    <div className="flex items-center gap-2 mb-2">
                      {group.user?.profilePicture && (
                        <img
                          src={group.user.profilePicture}
                          alt={username || "User"}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {group.name}
                        </p>
                        {username && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            @{username}
                          </p>
                        )}
                      </div>
                    </div>

                    {group. user?.live && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                          LIVE
                        </span>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}