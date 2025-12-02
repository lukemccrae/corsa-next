"use client";
import React from "react";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import dynamic from "next/dynamic";

const TrackerMap = dynamic(() => import("./TrackerMap"), { ssr: false });

export default function FeedItem({ entry }: { entry: any }) {

    // Timestamp helper
    const timeAgo = (iso?: string) => {
        if (!iso) return "—";
        const d = new Date(iso).getTime();
        const now = Date.now();
        const s = Math.max(1, Math.round((now - d) / 1000));
        if (s < 60) return `${s}s ago`;
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
        return `${Math.floor(s / 86400)}d ago`;
    };

    switch (entry.type) {
        case "blog":
            return (
                <Card className="mb-6">
                    <div className="flex gap-2 items-center mb-2">
                        <Avatar
                            image={entry.profilePicture}
                            size="normal"
                            shape="circle"
                            className=""
                        />
                        <span className="font-medium">{entry.username}</span>
                        <span className="text-xs text-gray-400">{timeAgo(entry.createdAt)}</span>
                    </div>
                    <h3 className="font-semibold text-lg">{entry.title}</h3>
                    <p className="mb-2">{entry.text}</p>
                    {entry.imageUrl && (
                        <img
                            src={entry.imageUrl}
                            alt={entry.caption ?? ""}
                            className="rounded w-64 mb-2"
                        />
                    )}
                </Card>
            );
        case "tracker":
            return (
                <Card className="mb-6">
                    {/* Header */}
                    <div className="flex gap-2 items-center mb-2">
                        <Avatar
                            image={entry.profilePicture}
                            size="normal"
                            shape="circle"
                        />
                        <span className="font-medium">{entry.username}</span>
                        <span className="text-xs text-gray-400">
                            {timeAgo(entry.createdAt)}
                        </span>
                    </div>

                    {/* Title */}
                    <div className="mb-1 flex items-center gap-2">
                        <i className="pi pi-map-marker text-red-500 text-sm"></i>
                        <span className="font-semibold">{entry.title}</span>
                    </div>

                    {/* Stats */}
                    <div className="text-xs mb-2">
                        Distance: <span className="font-bold">{entry.stats?.distance} mi</span>
                        &nbsp;| Vert: <span className="font-bold">{entry.stats?.vert} ft</span>
                    </div>

                    {/* Timing */}
                    <div className="text-xs text-gray-500 mb-2">
                        Start: <span className="font-medium">
                            {new Date(Number(entry.startTime)).toLocaleString()}
                        </span>
                        <br />
                        Finish: <span className="font-medium">
                            {new Date(Number(entry.finishTime)).toLocaleString()}
                        </span>
                    </div>
                    <div className="h-48 w-full rounded-lg overflow-hidden mb-2">
                        <TrackerMap
                            lat={entry.currentLocation.lat}
                            lng={entry.currentLocation.lng}
                        />
                    </div>
                </Card>
            );
        case "status":
            return (
                <Card className="mb-6">
                    <div className="flex gap-2 items-center mb-2">
                        <Avatar
                            image={entry.profilePicture}
                            size="normal"
                            shape="circle"
                            className=""
                        />
                        <span className="font-medium">{entry.username}</span>
                        <span className="text-xs text-gray-400">{timeAgo(entry.createdAt)}</span>
                    </div>
                    <p>{entry.text}</p>
                </Card>
            );
        case "photo":
            return (
                <Card className="mb-6">
                    <div className="flex gap-2 items-center mb-2">
                        <Avatar
                            image={entry.profilePicture}
                            size="normal"
                            shape="circle"
                            className=""
                        />
                        <span className="font-medium">{entry.username}</span>
                        <span className="text-xs text-gray-400">{timeAgo(entry.createdAt)}</span>
                    </div>
                    {entry.caption && <div className="text-sm">{entry.caption}</div>}
                    {entry.imageUrl && (
                        <img
                            src={entry.imageUrl}
                            alt={entry.caption ?? ""}
                            className="rounded w-64 mb-2"
                        />
                    )}
                </Card>
            );
        default:
            return null;
    }
}