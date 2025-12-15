"use client";
import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { domain } from "../context/domain.context";
import { retrieveUserToken } from "../helpers/token.helper";
import { useRouter } from "next/navigation";

/**
 * UploadRouteModal
 *
 * Behavior:
 * - Let user pick a .gpx file.
 * - Immediately read the file and request a presigned PUT URL from the utility API:
 *     GET ${domain.utilityApi}/gpx-presigned  (Authorization: Bearer <token>)
 *   expected response: { url: string, uuid: string, publicUrl?: string }
 * - Upload the GPX content to the returned URL via PUT (XHR used to report progress).
 * - After successful upload, send the GraphQL mutation:
 *     createPlanFromGeoJson(gpxId: "<uuid>", userId: "<userId>", username: "<username>", profilePicture: "<profilePhoto">)
 *   using the same Authorization token pattern in the repo.
 *
 * Props:
 * - visible: boolean
 * - onHide: () => void
 * - onUploaded?: (meta: { uuid?: string; filename: string; publicUrl?: string }) => void
 * - userId?: string
 * - username?: string
 * - profilePhoto?: string
 *
 * Notes:
 * - This component uses PrimeReact Dialog + Button + Toast and Tailwind utility classes for styling.
 * - It mirrors the handleFileUpload service you provided but is usable as a self-contained modal UI.
 */

type Props = {
  visible: boolean;
  onHide: () => void;
  onUploaded?: (meta: {
    uuid?: string;
    filename: string;
    publicUrl?: string;
  }) => void;
  userId?: string;
  username?: string;
  profilePhoto?: string;
  // if true, navigate to /app after success (keeps parity with original handleFileUpload)
  redirectAfter?: boolean;
};

export default function UploadRouteModal({
  visible,
  onHide,
  onUploaded,
  userId = "",
  username = "",
  profilePhoto = "",
  redirectAfter = false,
}: Props) {
  const toast = useRef<Toast | null>(null);
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);

  // reset UI state
  const reset = () => {
    setFile(null);
    setUploading(false);
    setProgress(0);
    setMessage(null);
  };

  // request presigned PUT url from utility API
  async function getSpecifiedBucketPresigned(bucket: string) {
    const token = retrieveUserToken();
    console.log(token)
    const res = await fetch(
      `${domain.utilityApi}/gpx-presigned`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Presign request failed: ${res.status} ${txt}`);
    }
    return await res.json(); // expected { url, uuid, publicUrl? }
  }

  // XHR PUT to track progress reliably
  function uploadPutWithProgress(
    url: string,
    bodyText: string,
    onProgress?: (pct: number) => void
  ) {
    return new Promise<void>((resolve, reject) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url, true);
        // Content-Type recommended by your service (GPX is XML)
        xhr.setRequestHeader("Content-Type", "application/xml");

        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const pct = Math.round((ev.loaded / ev.total) * 100);
            onProgress?.(pct);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(
              new Error(
                `Upload failed: ${xhr.status} ${
                  xhr.statusText || xhr.responseText
                }`
              )
            );
          }
        };

        xhr.onerror = () => reject(new Error("Network error during S3 upload"));
        xhr.send(bodyText);
      } catch (err) {
        reject(err);
      }
    });
  }

  async function callCreateMileMarkerGeoJson(uuid: string) {
    const token = retrieveUserToken();
    const res = await fetch(`${domain.utilityApi}/gpx-geojson-mile-marker`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uuid,
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`Presign request failed: ${res.status} ${txt}`);
    }
  }

  // central flow
  const performUpload = async (f: File) => {
    setUploading(true);
    setProgress(5);
    setMessage("Reading file...");

    try {
      // read GPX text
      const gpxText = await f.text();

      setMessage("Requesting upload URL...");
      const presignedForGpx = await getSpecifiedBucketPresigned(
        "corsa-general-bucket"
      );
      if (!presignedForGpx || !presignedForGpx.url || !presignedForGpx.uuid) {
        throw new Error("Presign response missing url/uuid");
      }

      setProgress(25);
      setMessage("Uploading to S3...");

      // PUT with progress
      await uploadPutWithProgress(presignedForGpx.url, gpxText, (pct) => {
        setProgress(Math.max(25, pct)); // keep baseline of 25
      });

      setProgress(80);
      setMessage("Registering route...");

      const postResult = await callCreateMileMarkerGeoJson(
        presignedForGpx.uuid
      );

      setProgress(100);
      setMessage("Done");
      toast.current?.show({
        severity: "success",
        summary: "Upload complete",
        detail: f.name,
        life: 1800,
      });

      // inform parent
      onUploaded?.({
        uuid: presignedForGpx.uuid,
        filename: f.name,
        publicUrl: presignedForGpx.publicUrl,
      });

      // optionally navigate to /app (keeps parity with original handleFileUpload)
      if (redirectAfter) {
        // small delay so UI shows completion
        setTimeout(() => {
          router.push("/app");
        }, 450);
      }

      // close modal after a short delay
      setTimeout(() => {
        reset();
        onHide();
      }, 600);

      return postResult;
    } catch (err: any) {
      console.error("UploadRouteModal error:", err);
      setMessage(err?.message ?? String(err));
      toast.current?.show({
        severity: "error",
        summary: "Upload failed",
        detail: String(err?.message ?? err),
        life: 6000,
      });
      setUploading(false);
      // leave file in state so user can retry or cancel
      return null;
    }
  };

  // file input change handler — this is the most important part (ensures state updates)
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null;
    if (!picked) {
      setFile(null);
      setMessage(null);
      return;
    }

    // Quick client-side validation
    if (!/\.gpx$/i.test(picked.name)) {
      toast.current?.show({
        severity: "warn",
        summary: "Please select a .gpx file",
        life: 2500,
      });
      e.currentTarget.value = ""; // reset input
      return;
    }

    setFile(picked);
    setMessage(null);

    // Automatically start upload when a file is selected — mirrors user's reference UX
    await performUpload(picked);
  };

  const footer = (
    <div className="flex items-center justify-between w-full">
      <div className="text-xs text-gray-500">
        {message ?? (uploading ? "Working..." : "Select a GPX to upload")}
      </div>
      <div className="flex gap-2">
        <Button
          label="Cancel"
          className="p-button-text"
          onClick={() => {
            reset();
            onHide();
          }}
          disabled={uploading}
        />
        <Button
          label="Close"
          className="p-button-primary"
          onClick={() => {
            reset();
            onHide();
          }}
        />
      </div>
    </div>
  );

  return (
    <Dialog
      header="Upload GPX route"
      visible={visible}
      onHide={() => {
        reset();
        onHide();
      }}
      modal
      dismissableMask
      className="max-w-lg w-full"
      footer={footer}
    >
      <Toast ref={(el) => (toast.current = el)} />
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Choose a GPX file. The file will be uploaded directly to S3 (presigned
          PUT) and then the service will register the route.
        </p>

        <label className="block">
          <input
            type="file"
            accept=".gpx,application/gpx+xml"
            onChange={onFileChange}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-violet-50 file:text-violet-700"
            disabled={uploading}
          />
        </label>

        {file && (
          <div className="rounded-md border p-3 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{file.name}</div>
                <div className="text-xs text-gray-400">
                  {(file.size / 1024).toFixed(1)} KB • {file.type || "unknown"}
                </div>
              </div>
              <div>
                <Button
                  icon="pi pi-times"
                  className="p-button-text p-button-sm"
                  onClick={() => {
                    if (!uploading) {
                      setFile(null);
                    }
                  }}
                  disabled={uploading}
                />
              </div>
            </div>

            <div className="mt-3">
              <div className="w-full bg-gray-100 h-2 rounded overflow-hidden">
                <div
                  className="h-2 bg-violet-500"
                  style={{
                    width: `${progress}%`,
                    transition: "width 200ms linear",
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">{progress}%</div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
