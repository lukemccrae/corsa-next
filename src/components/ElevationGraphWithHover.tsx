// src/components/ElevationGraphWithMapSync.tsx
"use client";

import React, { useRef, useState } from "react";

type Props = {
  elevation: number[];
  points: [number, number][];
  onHoverIndex?: (i: number | null) => void;
  width?: number;
  height?: number;
  className?: string;
};

const fmt = (x: number) => `${Math.round(x)} ft`;

export default function ElevationGraphWithMapSync({
  elevation,
  points,
  onHoverIndex,
  width = 350,
  height = 80,
  className = "",
}: Props) {
  const pad = 14;
  const min = Math.min(...elevation);
  const max = Math.max(...elevation);

  const pts = elevation.map((e, i) => {
    const x = pad + ((width - 2 * pad) * i) / (elevation.length - 1);
    const y = pad + ((height - 2 * pad) * (1 - (e - min) / (max - min || 1)));
    return [x, y];
  });

  const polyStr = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  function handleMouse(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = Math.max(0, Math.min(width - pad * 2, e.clientX - rect.left - pad));
    const i = Math.round((relX / (width - 2 * pad)) * (elevation.length - 1));
    if (i >= 0 && i < elevation.length) {
      setHoverIdx(i);
      onHoverIndex?.(i);
    } else {
      setHoverIdx(null);
      onHoverIndex?.(null);
    }
  }

  return (
    <div className={className + " relative select-none"}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        onMouseMove={handleMouse}
        onMouseLeave={() => {
          setHoverIdx(null);
          onHoverIndex?.(null);
        }}
        style={{ cursor: "crosshair", touchAction: "none" }}
      >
        <rect
          x={pad}
          y={pad}
          width={width - 2 * pad}
          height={height - 2 * pad}
          fill="#f3f4f6"
          className="dark:fill-gray-800"
        />
        <polyline
          points={polyStr}
          fill="none"
          stroke="#8884d8"
          strokeWidth="2"
        />
        <text x={pad} y={pad + 12} fontSize="11" fill="#94a3b8">
          {fmt(max)}
        </text>
        <text x={pad} y={height - 2} fontSize="11" fill="#94a3b8">
          {fmt(min)}
        </text>
        {/* Hover line/cursor */}
        {hoverIdx !== null && (
          <>
            <line
              x1={pts[hoverIdx][0]}
              y1={pad}
              x2={pts[hoverIdx][0]}
              y2={height - pad}
              stroke="#8b5cf6"
              strokeDasharray="2"
              strokeWidth={1}
            />
            <circle
              cx={pts[hoverIdx][0]}
              cy={pts[hoverIdx][1]}
              r={4}
              fill="#a5b4fc"
              stroke="#312e81"
              strokeWidth={1.5}
            />
          </>
        )}
      </svg>
      {/* Tooltip */}
      {hoverIdx !== null && (
        <div
          className="pointer-events-none absolute"
          style={{
            left: `${pts[hoverIdx][0]}px`,
            top: `${Math.min(pts[hoverIdx][1] - 36, height - 44)}px`,
            minWidth: "62px",
            zIndex: 10,
          }}
        >
          <div className="bg-white dark:bg-gray-900 shadow px-2 py-1 rounded text-xs text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-white/10">
            <div className="font-medium">{fmt(elevation[hoverIdx])}</div>
            <div className="text-gray-400">#{hoverIdx + 1}</div>
          </div>
        </div>
      )}
    </div>
  );
}