"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { useUser } from "@/src/context/UserContext";
import RouteUploadModal from "@/src/components/RouteUploadModal";
import { Route } from "@/src/generated/schema";
import dynamic from "next/dynamic";

const RouteViewer = dynamic(
  () => import("@/src/components/RouteViewer"),
  { ssr: false },
);

const APPSYNC_ENDPOINT =
  "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

type RouteWithId = Route & { id: string };

export default function RoutesSettingsPage() {
  const { user } = useUser();
  const toast = useRef<Toast>(null);

  const [routes, setRoutes] = useState<RouteWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteWithId | null>(null);

  useEffect(() => {
    if (user?.preferred_username) {
      fetchRoutes();
    }
  }, [user?.preferred_username]);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const query = `
        query GetUserRoutes {
          getUserByUserName(username: "${user?.preferred_username}") {
            routes {
              storageUrl
              overlayUrl
              createdAt
              distanceInMiles
              gainInFeet
              name
            }
          }
        }
      `;

      const response = await fetch(APPSYNC_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": APPSYNC_API_KEY,
        },
        body: JSON.stringify({ query }),
      });

      const { data } = await response.json();
      console.log(data, "<< fetched user routes data");
      const fetched: RouteWithId[] = data?.getUserByUserName?.routes || [];
      setRoutes(fetched);
      setSelectedRoute((prev) => prev ?? (fetched.length > 0 ? fetched[0] : null));
    } catch (error) {
      console.error("Error fetching routes:", error);
      toast.current?.show({
        severity: "error",
        summary: "Failed to load routes",
        detail: "Could not fetch your routes. Please try again.",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (routeId: string) => {
    toast.current?.show({
      severity: "success",
      summary: "Route Uploaded",
      detail: `Route ${routeId} uploaded successfully`,
      life: 3000,
    });
    fetchRoutes();
  };

  const handleRename = async (newName: string) => {
    if (!selectedRoute || !user?.idToken) return;
    const mutation = `
      mutation UpsertRoute($input: RouteInput!) {
        upsertRoute(input: $input) { name }
      }
    `;
    const input = {
      id: selectedRoute.id,
      name: newName,
      distance: selectedRoute.distanceInMiles,
      distanceInMiles: selectedRoute.distanceInMiles,
      gain: selectedRoute.gainInFeet,
      gainInFeet: selectedRoute.gainInFeet,
      storageUrl: selectedRoute.storageUrl,
      uom: selectedRoute.uom,
      userId: selectedRoute.userId,
    };
    const response = await fetch(APPSYNC_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: user.idToken,
      },
      body: JSON.stringify({ query: mutation, variables: { input } }),
    });
    const { data, errors } = await response.json();
    if (errors?.length) throw new Error(errors[0].message);
    const updatedName: string = data?.upsertRoute?.name ?? newName;
    const updatedRoute = { ...selectedRoute, name: updatedName };
    setRoutes((prev) =>
      prev.map((r) => (r.storageUrl === selectedRoute.storageUrl ? updatedRoute : r)),
    );
    setSelectedRoute(updatedRoute);
  };

  const distanceTemplate = (rowData: Route) => {
    const distanceInMiles = rowData.distanceInMiles ?? 0;
    const distance =
      rowData.uom === "METRIC"
        ? (distanceInMiles * 1.60934).toFixed(2)
        : distanceInMiles.toFixed(2);
    const unit = rowData.uom === "METRIC" ? "km" : "mi";
    return `${distance} ${unit}`;
  };

  const gainTemplate = (rowData: Route) => {
    const gainInFeet = rowData.gainInFeet ?? 0;
    const gain =
      rowData.uom === "METRIC"
        ? (gainInFeet * 0.3048).toFixed(0)
        : gainInFeet.toFixed(0);
    const unit = rowData.uom === "METRIC" ? "m" : "ft";
    return `${gain} ${unit}`;
  };

  const dateTemplate = (rowData: Route) => {
    return new Date(rowData.createdAt).toLocaleDateString();
  };

  const cardBg = "bg-white border-gray-200 text-gray-900";

  return (
    <>
      <Toast ref={toast} />
      <RouteUploadModal
        visible={uploadModalVisible}
        onHide={() => setUploadModalVisible(false)}
        onSuccess={handleUploadSuccess}
      />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Routes</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your uploaded route files
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {/* Route list */}
          <div className="w-full lg:w-2/5">
            <Card className={cardBg}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Your Routes</h3>
                <Button
                  label="Upload Route"
                  icon="pi pi-upload"
                  onClick={() => setUploadModalVisible(true)}
                  disabled={!user}
                />
              </div>

              <DataTable
                value={routes}
                loading={loading}
                emptyMessage="No routes uploaded yet"
                paginator
                rows={10}
                selectionMode="single"
                selection={selectedRoute}
                onSelectionChange={(e) =>
                  setSelectedRoute(e.value as RouteWithId)
                }
                className="w-full"
              >
                <Column field="name" header="Name" sortable />
                <Column
                  field="distanceInMiles"
                  header="Distance"
                  body={distanceTemplate}
                  sortable
                />
                <Column
                  field="gainInFeet"
                  header="Elevation Gain"
                  body={gainTemplate}
                  sortable
                />
                <Column
                  field="createdAt"
                  header="Uploaded"
                  body={dateTemplate}
                  sortable
                />
              </DataTable>
            </Card>
          </div>

          {/* Route details */}
          <div className="w-full lg:w-3/5">
            {selectedRoute ? (
              <Card className={cardBg}>
                <RouteViewer
                  route={selectedRoute}
                  onRename={handleRename}
                />
              </Card>
            ) : (
              <Card className={`${cardBg} flex items-center justify-center`}>
                <div className="py-16 text-center text-gray-400">
                  <i className="pi pi-map text-4xl block mb-3" />
                  <p>Select a route to view details</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
