"use client";
import React, { useEffect, useState, useRef } from "react";
import { PanelMenu } from "primereact/panelmenu";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { Avatar } from "primereact/avatar";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import Cropper from "react-easy-crop";
import { useUser } from "../../../context/UserContext";
import { useTheme } from "../../../components/ThemeProvider";
import { Footer } from "../../../components/Footer";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ProfileForm = {
  name: string;
  username: string;
  email: string;
  cell: string;
  avatar: string; // base64 preview or remote URL
  avatarFile: File | null;
};

export default function AccountSettingsPage() {
  const toast = useRef<Toast>(null);
  const { user } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    username: "",
    email: "",
    cell: "",
    avatar: "",
    avatarFile: null,
  });

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      username: user.preferred_username || "",
      email: user.email || "",
      avatar: user.picture || "",
    }));
  }, [user]);

  // Avatar Cropper modal state/logic
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropAreaPixels, setCropAreaPixels] = useState<any>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  function onAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, avatarFile: file }));
    setShowCropModal(true);
  }

  async function getCroppedImg(file: File, cropPixels: any): Promise<string> {
    return new Promise((resolve) => {
      const image = new Image();
      image.src = URL.createObjectURL(file);
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = 320;
        canvas.height = 320;
        ctx.drawImage(
          image,
          cropPixels.x,
          cropPixels.y,
          cropPixels.width,
          cropPixels.height,
          0,
          0,
          320,
          320
        );
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
    });
  }

  async function saveCrop() {
    if (!form.avatarFile || !cropAreaPixels) return;
    const base64 = await getCroppedImg(form.avatarFile, cropAreaPixels);
    setForm((f) => ({
      ...f,
      avatar: base64,
      avatarFile: null,
    }));
    setShowCropModal(false);

    toast.current?.show({
      severity: "success",
      summary: "Avatar updated",
      life: 2000,
    });
  }

  function cancelCrop() {
    setForm((f) => ({ ...f, avatarFile: null }));
    setShowCropModal(false);
  }

  async function updateProfile() {
    // TODO: upload image + send mutation
    // All original functionality stays here
    console.log("Updated profile:", form);

    toast.current?.show({
      severity: "success",
      summary: "Profile updated",
      life: 2500,
    });
  }

  // Page shell/layout
  return (
    <>
      <div className="flex flex-col flex-auto min-h-screen bg-surface-950">
        {/* Card shell */}
        <div className="rounded-t-3xl bg-surface-0 dark:bg-surface-900 py-8 px-8 lg:px-20 max-w-5xl mx-auto w-full shadow">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-0">
              Account Settings
            </h2>
          </div>
          <Divider />

          <div className="flex flex-row gap-10 mt-6">
            {/* Main profile form */}
            <main className="flex-1">
              <Toast ref={toast} />
              <h3 className="font-semibold text-lg mb-8">Profile</h3>

              <div className="flex flex-col md:flex-row gap-10">
                {/* LEFT COLUMN – FORM */}
                <div className="flex-1 flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Name</label>
                    <InputText
                      className="w-full"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Username</label>
                    <InputText
                      className="w-full"
                      value={form.username}
                      onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Email</label>
                    <InputText
                      className="w-full"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-medium">Cell</label>
                    <InputText
                      className="w-full"
                      value={form.cell}
                      onChange={(e) =>
                        setForm({ ...form, cell: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* RIGHT COLUMN – AVATAR */}
                <div className="flex flex-col items-start lg:items-center gap-4">
                  <Avatar
                    image={form.avatar}
                    label={!form.avatar ? form.name?.charAt(0) : undefined}
                    shape="circle"
                    size="xlarge"
                    className="!w-28 !h-28"
                  />

                  <Button
                    label="Upload"
                    icon="pi pi-upload"
                    className="p-button-outlined p-button-secondary"
                    onClick={() =>
                      document.getElementById("avatarInput")?.click()
                    }
                  />

                  <input
                    id="avatarInput"
                    type="file"
                    accept="image/*"
                    onChange={onAvatarSelect}
                    className="hidden"
                  />
                </div>
              </div>
              <div className="mt-8">
                <Button
                  label="Update Profile"
                  icon="pi pi-check"
                  className="w-auto"
                  onClick={updateProfile}
                />
              </div>
              {/* Avatar Crop modal */}
              {showCropModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-xl flex flex-col items-center w-full max-w-md">
                    <div className="w-[300px] h-[300px] relative">
                      {form.avatarFile && (
                        <Cropper
                          image={URL.createObjectURL(form.avatarFile)}
                          crop={crop}
                          zoom={zoom}
                          aspect={1}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={(_, px) => setCropAreaPixels(px)}
                        />
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        label="Save"
                        severity="success"
                        onClick={saveCrop}
                      />
                      <Button
                        label="Cancel"
                        severity="danger"
                        onClick={cancelCrop}
                      />
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
