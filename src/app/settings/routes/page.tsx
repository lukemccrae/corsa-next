"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { useUser } from "@/src/context/UserContext";
// import { useTheme } from "@/src/components/ThemeProvider";
import RouteUploadModal from "@/src/components/RouteUploadModal";
import RouteViewerModal from "@/src/components/RouteViewerModal";
import { Route } from "@/src/generated/schema";

const APPSYNC_ENDPOINT =
  "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
const APPSYNC_API_KEY = "da2-5f7oqdwtvnfydbn226e6c2faga";

export default function RoutesSettingsPage() {
  const { user } = useUser();
  // const { theme } = useTheme();
  const toast = useRef<Toast>(null);

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [viewerRoute, setViewerRoute] = useState<Route | null>(null);

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
      setRoutes(data?.getUserByUserName?.routes || []);
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
    // Refresh routes list
    fetchRoutes();
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

  const actionsTemplate = (rowData: Route) => (
    <Button
      icon="pi pi-eye"
      rounded
      text
      aria-label="View route"
      onClick={() => setViewerRoute(rowData)}
    />
  );

  const cardBg =
    "bg-white border-gray-200 text-gray-900";

  return (
    <>
      <Toast ref={toast} />
      <RouteUploadModal
        visible={uploadModalVisible}
        onHide={() => setUploadModalVisible(false)}
        onSuccess={handleUploadSuccess}
      />
      <RouteViewerModal
        visible={viewerRoute != null}
        onHide={() => setViewerRoute(null)}
        route={viewerRoute}
      />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Routes</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your uploaded route files
          </p>
        </div>

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
              field="gain"
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
            <Column header="" body={actionsTemplate} style={{ width: "4rem" }} />
          </DataTable>
        </Card>
      </div>
    </>
  );
}
