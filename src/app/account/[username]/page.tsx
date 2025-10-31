"use client";

import React, { useRef, useState } from "react";
import { useParams } from "next/navigation";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";
import { Avatar } from "primereact/avatar";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { useTheme } from "../../../components/ThemeProvider";
import { useUser } from "../../../context/UserContext";

/**
 * Account details page adapted to reflect light/dark theme.
 *
 * Notes:
 * - Theme is provided by the app-wide ThemeProvider (Providers in layout).
 * - Styling uses Tailwind classes and PrimeReact components. No CSS files.
 */

type FormState = {
  username: string;
  displayName: string;
  email: string;
  avatarFile: File | null;
  avatarPreview: string | null;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  notifyEmail: boolean;
  notifySms: boolean;
};

export default function AccountDetailsPage() {
  const params = useParams();
  const usernameParam = (params as any)?.username ?? "unknown";
  const toast = useRef<Toast | null>(null);
  const { theme } = useTheme();
  const userCtx = useUser();

  // seed form from current user when available
  const initialForm: FormState = {
    username: usernameParam ?? "johndoe",
    displayName: userCtx.user?.preferred_username ?? "John Doe",
    email: userCtx.user?.email ?? "john@example.com",
    avatarFile: null,
    avatarPreview: userCtx.user?.picture ?? null,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    notifyEmail: true,
    notifySms: false,
  };

  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const preview = URL.createObjectURL(file);
      update("avatarFile", file);
      update("avatarPreview", preview);
    } else {
      update("avatarFile", null);
      update("avatarPreview", null);
    }
  }

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault();

    // Basic validation
    if (!form.displayName.trim()) {
      toast.current?.show({ severity: "warn", summary: "Validation", detail: "Display name is required.", life: 3000 });
      return;
    }
    if (!validateEmail(form.email)) {
      toast.current?.show({ severity: "error", summary: "Invalid email", detail: "Please enter a valid email address.", life: 3500 });
      return;
    }
    if (form.newPassword || form.confirmPassword) {
      if (form.newPassword.length < 8) {
        toast.current?.show({ severity: "error", summary: "Weak password", detail: "New password must be at least 8 characters.", life: 3500 });
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        toast.current?.show({ severity: "error", summary: "Password mismatch", detail: "New password and confirmation do not match.", life: 3500 });
        return;
      }
      if (!form.currentPassword) {
        toast.current?.show({ severity: "error", summary: "Current password", detail: "Please provide your current password to change it.", life: 3500 });
        return;
      }
    }

    setLoading(true);
    try {
      // TODO: Replace with real API call(s) for saving
      await new Promise((r) => setTimeout(r, 900));

      toast.current?.show({ severity: "success", summary: "Saved", detail: "Your account details were updated.", life: 3000 });
      update("currentPassword", "");
      update("newPassword", "");
      update("confirmPassword", "");
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Save failed", detail: "An error occurred while saving.", life: 3500 });
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    // Reset to initial values (could refetch real user)
    setForm(initialForm);
    toast.current?.show({ severity: "info", summary: "Cancelled", detail: "Changes were not saved.", life: 2000 });
  }

  async function handleDeleteAccount() {
    const ok = confirm("Are you sure you want to permanently delete your account? This action cannot be undone.");
    if (!ok) return;

    setDeleting(true);
    try {
      // TODO: Replace with real delete API
      await new Promise((r) => setTimeout(r, 1000));
      toast.current?.show({ severity: "success", summary: "Deleted", detail: "Your account has been deleted (demo).", life: 3000 });
      // optionally sign out or navigate
    } catch {
      toast.current?.show({ severity: "error", summary: "Delete failed", detail: "Unable to delete account.", life: 3500 });
    } finally {
      setDeleting(false);
    }
  }

  // Theme-aware classes (use Tailwind utilities; Prime theme handles component internals)
  const cardBase = "rounded-2xl p-6 transition-colors";
  const cardThemeClass =
    theme === "dark"
      ? "bg-gray-800 text-gray-100 border border-white/6 shadow"
      : "bg-white text-gray-900 border border-gray-200 shadow-lg hover:shadow-xl";
  const subText = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const avatarRing = theme === "dark" ? "ring-2 ring-gray-900" : "ring-2 ring-white";

  return (
    <div className="max-w-4xl mx-auto p-6 h-full">
      <Toast ref={toast} />

      <div className={`${cardBase} ${cardThemeClass}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex-shrink-0">
            <div className={`rounded-full overflow-hidden ${avatarRing}`}>
              <Avatar
                image={form.avatarPreview ?? undefined}
                label={!form.avatarPreview ? form.displayName?.charAt(0).toUpperCase() : undefined}
                shape="circle"
                size="xlarge"
                className="!w-24 !h-24"
                style={{ cursor: "default" }}
              />
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold">{form.displayName}</h2>
                <div className={`text-sm ${subText}`}>@{form.username}</div>
              </div>

              <div className="flex items-center gap-2">
                <Button icon="pi pi-user" label="View Public" className="p-button-text" onClick={() => window.location.href = `/live/${form.username}`} />
                <Button icon="pi pi-cog" className="p-button-text" onClick={() => toast.current?.show({ severity: "info", summary: "Settings", detail: "Settings opening (demo)", life: 1500 })} />
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 max-w-2xl">
              Manage your profile information, security settings, and notification preferences.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Display name */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Display name</label>
            <InputText
              value={form.displayName}
              onChange={(e) => update("displayName", e.currentTarget.value)}
              className="w-full"
            />
          </div>

          {/* Username (read-only) */}
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <InputText value={form.username} onChange={(e) => update("username", e.currentTarget.value)} className="w-full" disabled />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <InputText
              value={form.email}
              onChange={(e) => update("email", e.currentTarget.value)}
              className="w-full"
            />
            <small className="text-xs text-gray-400">Used for login and notifications.</small>
          </div>

          {/* Avatar upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Avatar</label>
            <div className="flex items-center gap-3">
              <input id="avatar" type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
              <label htmlFor="avatar">
                <Button icon="pi pi-upload" label="Upload" className="p-button-secondary" />
              </label>
              <Button
                icon="pi pi-times"
                className="p-button-text"
                onClick={() => {
                  update("avatarFile", null);
                  update("avatarPreview", null);
                }}
                disabled={!form.avatarPreview}
              />
              {form.avatarPreview && <span className="text-sm text-gray-400">{/* filename could be shown here */}</span>}
            </div>
          </div>

          <Divider className="md:col-span-2 my-3" />

          {/* Password change */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Change password</label>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Current password</label>
            <Password
              value={form.currentPassword}
              onChange={(e) => update("currentPassword", e.currentTarget.value)}
              toggleMask
              feedback={false}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">New password</label>
            <Password
              value={form.newPassword}
              onChange={(e) => update("newPassword", e.currentTarget.value)}
              toggleMask
              className="w-full"
              feedback={false}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Confirm new password</label>
            <Password
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.currentTarget.value)}
              toggleMask
              className="w-full"
              feedback={false}
            />
          </div>

          <Divider className="md:col-span-2 my-3" />

          {/* Notifications */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Notifications</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Checkbox inputId="notify-email" checked={form.notifyEmail} onChange={(e) => update("notifyEmail", e.checked ?? false)} />
                <label htmlFor="notify-email" className="text-sm">Email notifications</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox inputId="notify-sms" checked={form.notifySms} onChange={(e) => update("notifySms", e.checked ?? false)} />
                <label htmlFor="notify-sms" className="text-sm">SMS notifications</label>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="md:col-span-2 flex items-center justify-between mt-4">
            <div className="flex gap-2">
              <Button label="Cancel" severity="secondary" className="p-button-text" onClick={handleCancel} />
              <Button label="Save Changes" icon="pi pi-check" onClick={handleSave} loading={loading} />
            </div>

            <div>
              <Button label="Delete account" icon="pi pi-trash" className="p-button-danger p-button-text" onClick={handleDeleteAccount} loading={deleting} />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}