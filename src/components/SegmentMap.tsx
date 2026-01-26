import { Segment } from "../generated/schema";
import { Button } from "primereact/button";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Simple hash function to generate consistent random values from a string
const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Create icon for the athlete's current position
const createSegmentIcon = (segmentId: string) => {
  // Generate consistent random counts for badges based on segment ID
  const hash = hashCode(segmentId);
  const userCount = (hash % 11) + 5; // Random number between 5-15
  const chatCount = ((hash >> 4) % 41) + 10; // Random number between 10-50

  if (Number(segmentId) % 3 === 0) {
    return L.divIcon({
      className: "athlete-marker",
      html: `
      <div style="position: relative;">
        <div
          style="
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          "
        >
          <img 
            src="/burrito.png" 
            alt="Burrito" 
            style="width: 36px; height: 36px;"
          />
        </div>
        <div style="position: absolute; top: -8px; right: -8px; display: flex; flex-direction: column; gap: 2px;">
          <!-- User count badge -->
          <div class="bg-red-500 text-white rounded-full px-1 text-xs flex items-center gap-1" style="box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            <i class="pi pi-users" style="font-size: 14px;"></i>
            <span style="font-size: 14px; font-weight: 600;">${userCount}</span>
          </div>
        </div>
      </div>
    `,
      iconSize: [48, 48],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  }
  return L.divIcon({
    className: "athlete-marker",
    html: `
      <div style="position: relative;">
        <div
          style="
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          "
        >
          <img 
            src="/burrito.png" 
            alt="Burrito" 
            style="width: 36px; height: 36px;"
          />
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const tileUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";

export const SegmentMap = (props: { segments: Segment[] }) => (
  <div className="relative w-full h-full">
    <MapContainer
      center={[37.65269205846588, -93.40350964996749]}
      zoom={3}
      style={{ height: "100%", width: "100%" }}
      dragging={true}
      doubleClickZoom={true}
      attributionControl={false}
      zoomControl={false}
      maxBoundsViscosity={1.0}
      minZoom={2}
      maxZoom={17}
      maxBounds={[
        [-85, -180],
        [85, 180],
      ]}
    >
      <TileLayer
        url={tileUrl}
        attribution="Map data: &copy; OpenStreetMap contributors"
        maxZoom={17}
      />

      {/* Current location marker with profile picture */}
      {props.segments.map((segment, index) => {
        if (!segment.location) return null;
        return (
          <Marker
            position={[segment.location.lat, segment.location.lng]}
            icon={createSegmentIcon(segment.segmentId)}
          >
            <Popup
              className="segment-popup"
              maxWidth={320}
              autoPan={true}
              autoPanPadding={[40, 40]}
              keepInView={true}
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {" "}
                    <img
                      src="/burrito.png"
                      alt="Burrito"
                      style={{ width: "24px", height: "24px" }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base leading-tight">
                      {segment.title}
                    </h3>
                    {segment.description && (
                      <p className="text-xs opacity-80 mt-1">
                        {segment.description}
                      </p>
                    )}
                  </div>
                </div>

                {(segment.city || segment.state || segment.country) && (
                  <div className="flex items-center gap-2 text-xs opacity-70">
                    <i className="pi pi-map-marker text-xs" />
                    <span>
                      {[segment.city, segment.state, segment.country]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {segment.link && (
                    <a
                      href={segment.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        label="Segment Details"
                        icon="pi pi-external-link"
                        size="small"
                        outlined
                        className="w-full"
                      />
                    </a>
                  )}
                  <a href={`/burritoleague/${segment.segmentId}`}>
                    <Button
                      label="Leaderboard"
                      icon="pi pi-trophy"
                      size="small"
                      className="w-full"
                    />
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
    <div className="absolute bottom-4 left-4 z-[1000] rounded px-2 py-1">
      <img
        src="/api_logo_pwrdBy_strava_horiz_white.svg"
        alt="Powered by Strava"
        className="h-4 w-auto"
      />
    </div>
  </div>
);
