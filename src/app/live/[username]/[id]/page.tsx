'use client';
import LiveMap, { Point } from '@/src/components/LiveMap';
import LiveStats from '@/src/components/LiveStats';
import PointsList from '@/src/components/PointsList';
import { useParams } from 'next/navigation';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import React from 'react';

/**
 * Lightweight "live" page scaffold.
 * - No network calls.
 * - Uses local mocked points for display.
 * - Modular components: LiveMap, LiveStats, PointsList.
 *
 * Placeholders and mocks are intentionally simple — replace with real data
 * later (from props or a context) but keep the UI logic here.
 */

export default function LivePage() {
  const params = useParams();
  const username = (params as any)?.username ?? 'unknown';

  // Mock data: simple line of points around a center
  const center: [number, number] = [37.7749, -122.4194]; // SF
  const now = Date.now();
  const mockedPoints: Point[] = React.useMemo(() => {
    const points: Point[] = [];
    for (let i = 0; i < 24; i++) {
      points.push({
        lat: center[0] + (Math.sin(i / 3) * 0.02),
        lng: center[1] + (Math.cos(i / 4) * 0.02) - i * 0.001,
        timestamp: now - (24 - i) * 60 * 1000, // minute apart
        altitude: 100 + Math.round(Math.sin(i / 2) * 40),
        mileMarker: Number((i * 0.5).toFixed(2)),
        message: i % 5 === 0 ? `Checkpoint ${i / 5}` : undefined,
      });
    }
    return points;
  }, [center, now]);

  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  return (
    <div className="h-full w-full p-4 md:p-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-4">
      <div className="flex-1 min-h-[60vh] md:min-h-[72vh] rounded-2xl overflow-hidden shadow">
        <LiveMap
          center={center}
          points={mockedPoints}
          selectedIndex={selectedIndex}
          onSelectIndex={(i) => setSelectedIndex(i)}
        />
      </div>

      <aside className="w-full md:w-96 flex flex-col gap-4">
        <div className="flex items-center justify-between bg-white/80 dark:bg-gray-800/80 rounded-xl p-3 shadow">
          <div className="flex items-center gap-3">
            <Avatar label={username?.charAt(0)?.toUpperCase()} shape="circle" size="large" />
            <div className="flex flex-col">
              <div className="font-semibold">{username}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">Live • demo data</div>
            </div>
          </div>
          <div>
            <Button
              icon="pi pi-download"
              className="p-button-text"
              onClick={() => alert('Download GPX (demo)')}
              aria-label="Download GPX"
            />
          </div>
        </div>

        <LiveStats points={mockedPoints} selectedIndex={selectedIndex} />

        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-3 shadow overflow-auto">
          <h3 className="text-sm font-semibold mb-2">Recent Points</h3>
          <PointsList
            points={mockedPoints}
            selectedIndex={selectedIndex}
            onSelectIndex={(i) => setSelectedIndex(i)}
          />
        </div>
      </aside>
    </div>
  );
}
