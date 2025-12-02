"use client";

import { MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngExpression } from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet icons in Next.js
L.Marker.prototype.options.icon = L.icon({
    iconRetinaUrl: markerIcon2x.src,
    // @ts-ignore
    iconUrl: markerIcon,
    shadowUrl: markerShadow.src,
});

export default function TrackerMap({
    lat,
    lng,
}: {
    lat: number;
    lng: number;
}) {
    return (
        <MapContainer
            center={[lat, lng]}
            zoom={11}
            style={{ height: "100%", width: "100%" }}
            dragging={false}
            zoomControl={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            keyboard={false}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[lat, lng] as LatLngExpression} />
        </MapContainer>
    );
}
