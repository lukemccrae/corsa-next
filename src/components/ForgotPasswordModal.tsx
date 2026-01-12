"use client";
import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useUser } from "../context/UserContext";

type ForgotPasswordModalProps = {
  visible: boolean;
  onHide: () => void;
};

export default function ForgotPasswordModal({
  visible,
  onHide,
}: ForgotPasswordModalProps) {
  const { forgotPassword, resetPasswordWithCode } = useUser();
  const toast = useRef<Toast>(null);
  
  const [step, setStep] = useState<"request" | "reset">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      
      toast.current?.show({
        severity: "success",
        summary:  "Code Sent",
        detail: "Check your email for the reset code",
        life: 5000,
      });
      
      setStep("reset");
    } catch (error: any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to send reset code",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPasswordWithCode(email, code, newPassword);
      
      toast.current?.show({
        severity: "success",
        summary: "Password Reset",
        detail: "Your password has been updated successfully",
        life: 5000,
      });
      
      // Reset form and close modal
      setTimeout(() => {
        setStep("request");
        setEmail("");
        setCode("");
        setNewPassword("");
        onHide();
      }, 1500);
    } catch (error:  any) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to reset password",
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("request");
    setEmail("");
    setCode("");
    setNewPassword("");
    onHide();
  };

  const footer = (
    <div className="flex justify-between items-center">
      {step === "reset" && (
        <Button
          label="Back"
          icon="pi pi-arrow-left"
          text
          onClick={() => setStep("request")}
          disabled={loading}
        />
      )}
      <div className="flex gap-2 ml-auto">
        <Button
          label="Cancel"
          severity="secondary"
          onClick={handleClose}
          disabled={loading}
        />
        <Button
          label={step === "request" ? "Send Code" : "Reset Password"}
          loading={loading}
          onClick={() => {
            if (step === "request") {
              const form = document.querySelector("form");
              form?.requestSubmit();
            } else {
              const form = document.querySelectorAll("form")[1];
              form?.requestSubmit();
            }
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={handleClose}
        header={step === "request" ? "Forgot Password" :  "Reset Password"}
        modal
        dismissableMask
        footer={footer}
        className="w-full max-w-md"
      >
        {step === "request" ?  (
          <form onSubmit={handleRequestCode} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter your email address and we'll send you a code to reset your password.
            </p>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Email</label>
              <InputText
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full"
              />
            </div>

            <button type="submit" style={{ display: "none" }} />
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter the code sent to <strong>{email}</strong> and your new password.
            </p>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Reset Code</label>
              <InputText
                name="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                required
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">New Password</label>
              <Password
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                toggleMask
                required
                className="w-full"
              />
            </div>

            <button type="submit" style={{ display:  "none" }} />
          </form>
        )}
      </Dialog>
    </>
  );
}