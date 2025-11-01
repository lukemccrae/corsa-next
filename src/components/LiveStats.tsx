'use client';
import React from 'react';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Point } from './LiveMap';

type Props = {
  points: Point[];
  selectedIndex?: number | null;
};

function formatElapsed(points: Point[]) {
  if (!points.length) return '0m';
  const start = points[0].timestamp;
  const end = points[points.length - 1].timestamp;
  const seconds = Math.max(0, Math.floor((end - start) / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m`;
}

function computeTotalMiles(points: Point[]) {
  const last = points[points.length - 1];
  if (!last) return 0;
  if (typeof last.mileMarker === 'number') return last.mileMarker;
  return Number(((points.length - 1) * 0.5).toFixed(2));
}

export default function LiveStats({ points, selectedIndex }: Props) {
  const totalMiles = computeTotalMiles(points);
  const elapsed = formatElapsed(points);
  const lastAltitude = points.length ? points[points.length - 1].altitude ?? '—' : '—';
  const selected = typeof selectedIndex === 'number' ? points[selectedIndex] : undefined;

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-3 shadow flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Activity</div>
          <div className="text-xs text-gray-500">Demo • no network</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">{totalMiles.toFixed(2)} mi</div>
          <div className="text-xs text-gray-500">distance</div>
        </div>
      </div>

      <Divider />

      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-sm font-medium">{elapsed}</div>
          <div className="text-xs text-gray-500">elapsed</div>
        </div>
        <div>
          <div className="text-sm font-medium">{lastAltitude} ft</div>
          <div className="text-xs text-gray-500">elevation</div>
        </div>
        <div>
          <div className="text-sm font-medium">{points.length}</div>
          <div className="text-xs text-gray-500">points</div>
        </div>
      </div>

      {selected && (
        <>
          <Divider />
          <div>
            <div className="text-xs text-gray-500">Selected point</div>
            <div className="text-sm font-medium">
              Mile {selected.mileMarker ?? '—'} • {new Date(selected.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}