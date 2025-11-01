
'use client';
import React from 'react';
import { Point } from './LiveMap';
import { Button } from 'primereact/button';

type Props = {
  points: Point[];
  selectedIndex?: number | null;
  onSelectIndex?: (i: number) => void;
};

export default function PointsList({ points, selectedIndex, onSelectIndex }: Props) {
  if (!points.length) {
    return <div className="text-sm text-gray-500">No points available</div>;
  }

  return (
    <ul className="flex flex-col gap-2 max-h-72 overflow-auto pr-2">
      {points.map((p, i) => {
        const isSelected = i === selectedIndex;
        return (
          <li
            key={i}
            className={`flex items-center justify-between gap-3 p-2 rounded-md cursor-pointer ${
              isSelected ? 'bg-violet-50 dark:bg-violet-900/30' : 'hover:bg-gray-50 dark:hover:bg-white/3'
            }`}
            onClick={() => onSelectIndex?.(i)}
            role="button"
          >
            <div className="flex flex-col">
              <div className="text-sm font-medium">Mile {p.mileMarker ?? i}</div>
              <div className="text-xs text-gray-500">{new Date(p.timestamp).toLocaleString()}</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-600 mr-2">{p.altitude ?? '—'} ft</div>
              <Button icon="pi pi-map-marker" className="p-button-text" onClick={(e) => { e.stopPropagation(); onSelectIndex?.(i); }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}