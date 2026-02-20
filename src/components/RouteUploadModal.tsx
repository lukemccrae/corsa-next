"use client";
import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { ProgressBar } from "primereact/progressbar";
import { Toast } from "primereact/toast";
import { useUser } from "../context/UserContext";
import { useTheme } from "./ThemeProvider";

const UTILITY_API_ENDPOINT = "    https://hpju2h9n7h.execute-api.us-west-1.amazonaws.com/prod"; // Replace with your utility API endpoint

type RouteUploadModalProps = {
  visible: boolean;
  onHide: () => void;
  onSuccess?: (routeId: string) => void;
};

type UnitOfMeasure = "IMPERIAL" | "METRIC";

const uomOptions = [
  { label: "Imperial (mi, ft)", value: "IMPERIAL" },
  { label: "Metric (km, m)", value: "METRIC" },
];

export default function RouteUploadModal({
  visible,
  onHide,
  onSuccess,
}: RouteUploadModalProps) {
  const { user } = useUser();
  const { theme } = useTheme();
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);

  const [name, setName] = useState("");
  const [uom, setUom] = useState<UnitOfMeasure>("IMPERIAL");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const reset = () => {
    setName("");
    setUom("IMPERIAL");
    setSelectedFile(null);
    setUploading(false);
    setUploadProgress(0);
    fileUploadRef.current?.clear();
  };

  const handleFileSelect = (event: any) => {
    const file = event.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith(".gpx")) {
        toast.current?.show({
          severity: "error",
          summary: "Invalid File",
          detail: "Please select a GPX file",
          life: 3000,
        });
        fileUploadRef.current?.clear();
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.current?.show({
          severity: "error",
          summary: "File Too Large",
          detail: "File must be less than 10MB",
          life: 3000,
        });
        fileUploadRef.current?.clear();
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!name.trim()) {
      toast.current?.show({
        severity: "error",
        summary: "Name Required",
        detail: "Please enter a route name",
        life: 3000,
      });
      return;
    }

    if (!selectedFile) {
      toast.current?.show({
        severity: "error",
        summary: "File Required",
        detail: "Please select a GPX file",
        life: 3000,
      });
      return;
    }

    if (!user?.idToken) {
      toast.current?.show({
        severity: "error",
        summary: "Not Authenticated",
        detail: "Please log in to upload routes",
        life: 3000,
      });
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      console.log(user.idToken, '<< user.idToken')
      // Step 1: Initialize upload and get presigned URL
      const initResponse = await fetch(
        `${UTILITY_API_ENDPOINT}/routes/init-upload`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: user.idToken,
          },
          body: JSON.stringify({
            name: name.trim(),
            uom,
          }),
        }
      );
      console.log(initResponse, '<< initResponse')

      if (!initResponse.ok) {
        const errorData = await initResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to initialize route upload"
        );
      }

      const { success, routeId, uploadUrl, uploadFields } =
        await initResponse.json();

      if (!success || !uploadUrl || !uploadFields) {
        throw new Error("Invalid response from init-upload");
      }

      setUploadProgress(30);

      // Step 2: Upload file to S3 using presigned POST
      const formData = new FormData();

      // Add all the fields from the presigned POST
      Object.entries(uploadFields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      // Add the file last (required by S3)
      formData.append("file", selectedFile);

      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text().catch(() => "");
        console.error("S3 upload error:", errorText);
        throw new Error("Failed to upload file to storage");
      }

      setUploadProgress(100);

      toast.current?.show({
        severity: "success",
        summary: "Upload Successful",
        detail: "Your route is being processed",
        life: 3000,
      });

      // Call success callback
      onSuccess?.(routeId);

      // Reset and close
      setTimeout(() => {
        reset();
        onHide();
      }, 1000);
    } catch (error: any) {
      console.error("Route upload error:", error);
      toast.current?.show({
        severity: "error",
        summary: "Upload Failed",
        detail: error.message || "Failed to upload route. Please try again.",
        life: 5000,
      });
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      reset();
      onHide();
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={handleClose}
        header="Upload Route"
        modal
        dismissableMask={!uploading}
        closable={!uploading}
        className="w-full max-w-md"
      >
        <div className="flex flex-col gap-4">
          {/* Route Name */}
          <div className="flex flex-col gap-2">
            <label htmlFor="routeName" className="font-semibold text-sm">
              Route Name *
            </label>
            <InputText
              id="routeName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Mount Tam Loop"
              disabled={uploading}
              className="w-full"
            />
          </div>

          {/* Unit of Measure */}
          <div className="flex flex-col gap-2">
            <label htmlFor="uom" className="font-semibold text-sm">
              Unit of Measure *
            </label>
            <Dropdown
              id="uom"
              value={uom}
              options={uomOptions}
              onChange={(e) => setUom(e.value)}
              disabled={uploading}
              className="w-full"
            />
          </div>

          {/* File Upload */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">GPX File *</label>
            <FileUpload
              ref={fileUploadRef}
              name="file"
              accept=".gpx"
              maxFileSize={10485760}
              onSelect={handleFileSelect}
              disabled={uploading}
              chooseLabel="Select GPX File"
              uploadLabel="Upload"
              cancelLabel="Clear"
              auto={false}
              customUpload
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selected: {selectedFile.name} (
                {(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="flex flex-col gap-2">
              <ProgressBar value={uploadProgress} />
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                {uploadProgress < 30
                  ? "Initializing upload..."
                  : uploadProgress < 100
                  ? "Uploading file..."
                  : "Processing complete!"}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              label="Cancel"
              severity="secondary"
              onClick={handleClose}
              disabled={uploading}
            />
            <Button
              label="Upload"
              onClick={handleUpload}
              disabled={uploading || !name.trim() || !selectedFile}
              loading={uploading}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}