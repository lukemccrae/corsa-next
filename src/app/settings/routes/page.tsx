"use client";
import React, { useRef, useState, useEffect } from "react";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dialog } from "primereact/dialog";
import { Footer } from "../../../components/Footer";
import { useTheme } from "../../../components/ThemeProvider";
import SmallTrackMap from "../../../components/SmallTrackMap";
import { Dropdown } from "primereact/dropdown";
import ElevationGraphWithHover from "../../../components/ElevationGraphWithHover";
import RouteView from "@/src/components/RouteView";

// Types
type Route = {
  id: string;
  name: string;
  filename: string;
  distance: number;
  gain: number;
  points: [number, number][];
  elevation: number[];
  uom: string;
};

// Utility for generating a fake elevation profile
function generateElevation(points: [number, number][]): number[] {
  return points.map((_, i) =>
    Math.round(4000 + 200 * Math.sin(i / 5) + Math.random() * 80)
  );
}

export default function RoutesSettingsPage() {
  const toast = useRef<Toast>(null);
  const { theme } = useTheme();

  // MOCK DATA
  const [routes, setRoutes] = useState<Route[]>([
    {
      id: "1",
      name: "Mt Whitney Route",
      filename: "whitney.gpx",
      distance: 22.5,
      points: [
        [36.578581, -118.291994],
        [36.5787, -118.29],
        [36.576, -118.288],
        [36.574, -118.284],
        [36.57, -118.28],
      ],
      elevation: [8300, 8500, 9200, 11400, 14050],
      gain: 3567,
      uom: "IMPERIAL",
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewRoute, setViewRoute] = useState<Route | null>(null);
  const fileUploadRef = useRef<FileUpload>(null);

  // NEW: highlight point to show on map when hovering the chart
  const [hoverPoint, setHoverPoint] = useState<[number, number] | null>(null);

  // Upload handler (mock)
  const handleUpload = async (e: any) => {
    const file = e.files?.[0];
    if (!file) return;

    const filename = file.name;
    const baseName = filename.replace(/\.gpx$/i, "");

    const newPoints: [number, number][] = [
      [36.5 + Math.random(), -118.2 + Math.random()],
      [36.51 + Math.random(), -118.21 + Math.random()],
      [36.52 + Math.random(), -118.22 + Math.random()],
      [36.53 + Math.random(), -118.23 + Math.random()],
      [36.54 + Math.random(), -118.24 + Math.random()],
      [36.55 + Math.random(), -118.25 + Math.random()],
    ];

    const elevation = generateElevation(newPoints);

    const newRoute: Route = {
      id: (routes.length + 1).toString(),
      name: baseName,
      filename,
      distance: Number((10 + Math.random() * 30).toFixed(2)),
      points: newPoints,
      elevation,
      gain: 0,
      uom: "METRIC",
    };

    setRoutes((rs) => [...rs, newRoute]);

    toast.current?.show({
      severity: "success",
      summary: "Route uploaded",
      detail: filename,
      life: 1300,
    });

    fileUploadRef.current?.clear();
  };

  const delRoute = (id: string) => {
    setRoutes((rs) => rs.filter((r) => r.id !== id));
    if (editingId === id) setEditingId(null);

    toast.current?.show({
      severity: "warn",
      summary: "Route deleted",
      life: 1000,
    });
  };

  // Row Component
  function RouteRow({ route }: { route: Route }) {
    const isEditing = editingId === route.id;

    const [localName, setLocalName] = useState(route.name);
    const [localUom, setLocalUom] = useState(route.uom);
    const [localDistance, setLocalDistance] = useState(route.distance);
    const [localGain, setLocalGain] = useState(route.gain);

    // re-seed local state when entering edit mode
    useEffect(() => {
      if (isEditing) {
        setLocalName(route.name);
        setLocalDistance(route.distance);
        setLocalGain(route.gain);
      }
    }, [isEditing]);

    const saveEdit = () => {
      setRoutes((rs) =>
        rs.map((r) =>
          r.id === route.id
            ? {
                ...r,
                name: localName,
                distance: localDistance,
                gain: localGain,
                uom: localUom,
              }
            : r
        )
      );

      setEditingId(null);
      toast.current?.show({
        severity: "info",
        summary: "Route updated",
        life: 1100,
      });
    };

    return (
      <tr>
        {isEditing ? (
          <>
            <td className="p-2">
              <InputText
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                className="w-full"
              />
            </td>

            <td className="p-2">
              <Dropdown
                value={localUom}
                options={[
                  { label: "Metric", value: "METRIC" },
                  { label: "Imperial", value: "IMPERIAL" },
                ]}
                onChange={(e) => setLocalUom(e.value)}
                placeholder="Select UOM"
                className="w-full"
              />
            </td>

            <td className="p-2">
              <InputNumber
                value={localDistance}
                onChange={(e) => setLocalDistance(e.value)}
                inputStyle={{ width: "100%" }}
              />
            </td>

            <td className="p-2">
              <InputNumber
                value={localGain}
                onChange={(e) => setLocalGain(e.value)}
                inputStyle={{ width: "100%" }}
              />
            </td>

            <td className="p-2 text-right">
              <div className="flex gap-1 justify-end">
                <Button
                  icon="pi pi-check"
                  className="p-button-sm p-button-success"
                  onClick={saveEdit}
                  disabled={!localName.trim()}
                />
                <Button
                  icon="pi pi-times"
                  className="p-button-text p-button-sm"
                  onClick={() => setEditingId(null)}
                />
              </div>
            </td>
          </>
        ) : (
          <>
            <td className="p-2">
              <span className="text-sm font-medium">{route.name}</span>
            </td>

            <td className="p-2">
              <span className="text-sm font-medium">{route.uom}</span>
            </td>

            <td className="p-2">
              <span className="text-sm font-medium">
                {route.distance.toFixed(2)} mi
              </span>
            </td>

            <td className="p-2">
              <span className="text-sm font-medium">{route.gain} ft</span>
            </td>

            <td className="p-2 text-right">
              <div className="flex gap-1 justify-end">
                <Button
                  icon="pi pi-pencil"
                  className="p-button-text p-button-sm"
                  onClick={() => setEditingId(route.id)}
                />
                <Button
                  icon="pi pi-eye"
                  className="p-button-text p-button-sm"
                  onClick={() => {
                    setViewRoute(route);
                    setHoverPoint(null);
                  }}
                />
                <Button
                  icon="pi pi-trash"
                  className="p-button-text p-button-danger p-button-sm"
                  onClick={() => delRoute(route.id)}
                />
              </div>
            </td>
          </>
        )}
      </tr>
    );
  }

  function ViewDialog() {
    const r = viewRoute;

    // Build rows for ElevationGraph: [lat, lng, elevation, distanceIndex, cumulativeVert]
    const graphRows = r
      ? r.points.map((p, i) => [p[0], p[1], r.elevation?.[i] ?? 0, i, r.gain ?? 0] as number[])
      : [];

    return (
      <Dialog
        header={r?.name}
        visible={!!r}
        style={{ width: "640px", maxWidth: "98vw" }}
        onHide={() => {
          setViewRoute(null);
          setHoverPoint(null);
        }}
        modal
        draggable={false}
      >
        {r && <RouteView></RouteView>}
      </Dialog>
    );
  }

  return (
    <>
      <div className="flex flex-col flex-auto min-h-screen bg-surface-950">
        <div className="rounded-t-3xl bg-surface-0 dark:bg-surface-900 py-8 px-8 lg:px-20 max-w-5xl mx-auto w-full shadow">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-0">
              Route Settings
            </h2>
            <p className="text-gray-400 text-sm max-w-2xl mt-2">
              Upload and manage your GPX routes for pre-calculation of stats.
            </p>
          </div>

          {/* Keep columns stacked on small screens */}
          <div className="flex flex-col gap-6 md:flex-row md:gap-10 mt-6">
            <main className="flex-1">
              <Toast ref={toast} />

              <div className="rounded-xl border border-gray-200 dark:border-white/6 bg-white dark:bg-gray-950 p-2 max-w-3xl">
                <div className="flex items-center justify-between mb-2 px-2">
                  <div className="text-xs text-gray-400 font-semibold">
                    Analyzed Routes
                  </div>

                  <FileUpload
                    ref={fileUploadRef}
                    mode="basic"
                    name="route"
                    accept=".gpx"
                    maxFileSize={10000000}
                    chooseLabel="Upload GPX"
                    customUpload
                    auto
                    uploadHandler={handleUpload}
                    disabled={!!editingId}
                  />
                </div>

                {/* Table wrapper: horizontal scroll on small screens */}
                <div className="overflow-x-auto">
                  <table className="min-w-[760px] w-full table-auto">
                    <thead>
                      <tr className="text-xs font-semibold text-gray-400 text-left">
                        <th className="p-2">Route Name</th>
                        <th className="p-2">UOM</th>
                        <th className="p-2">Distance</th>
                        <th className="p-2">Gain</th>
                        <th className="p-2 text-right">&nbsp;</th>
                      </tr>
                    </thead>

                    <tbody>
                      {routes.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-6 text-sm text-gray-400 text-center"
                          >
                            No routes added yet.
                          </td>
                        </tr>
                      ) : (
                        routes.map((r) => <RouteRow key={r.id} route={r} />)
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </main>
          </div>
        </div>

        <ViewDialog />
      </div>

      <Footer />
    </>
  );
}