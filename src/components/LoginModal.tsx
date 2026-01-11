// src/components/LoginModal.tsx
"use client";
import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast"; // Add this import
import { useUser } from "../context/UserContext";

type LoginModalProps = {
  visible: boolean;
  onHide: () => void;
};

export default function LoginModal({ visible, onHide }: LoginModalProps) {
  const { loginUser, registerUser } = useUser();
  const formRef = useRef<HTMLFormElement>(null);
  const registerFormRef = useRef<HTMLFormElement>(null);
  const toast = useRef<Toast>(null); // Add this ref
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    registerEmail: "",
    registerPassword: "",
    bio: "",
    pictureUrl: "",
  });

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  // Handle login submit
  const submitLogin = async (e: React.FormEvent) => {
    setErrorMsg("");
    setLoading(true);
    try {
      await loginUser(e);
      onHide();
    } catch (err: any) {
      const message = err?.message ?? "Login failed. Please try again.";
      setErrorMsg(message);

      // Show error as a toast as well
      toast.current?.show({
        severity: "error",
        summary: "Login Failed",
        detail: message,
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle registration submit
  const submitRegister = async (e: React.FormEvent) => {
    setErrorMsg("");
    setLoading(true);
    console.log(e, "<< form event");
    try {
      await registerUser(e);

      // Show success toast
      toast.current?.show({
        severity: "success",
        summary: "Registration Successful",
        detail: "Please check your email to verify your account.",
        life: 6000,
      });

      // Close modal after a short delay to let user see the toast
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        "Registration failed. Please check your info and try again.";
      setErrorMsg(errorMessage);

      // Also show error toast
      toast.current?.show({
        severity: "error",
        summary: "Registration Failed",
        detail: errorMessage,
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Dialog footer (switch/sign in/register/cancel)
  const footer = (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
      <Button
        label={mode === "login" ? "Need an account?" : "Already registered?"}
        text
        onClick={() => {
          setErrorMsg("");
          setMode(mode === "login" ? "register" : "login");
        }}
      />
      <div className="flex gap-2">
        <Button label="Cancel" text onClick={onHide} disabled={loading} />
        <Button
          label={mode === "login" ? "Sign In" : "Register"}
          loading={loading}
          onClick={() => {
            if (mode === "login") {
              formRef.current?.requestSubmit();
            } else {
              registerFormRef.current?.requestSubmit();
            }
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} /> {/* Add Toast component */}
      <Dialog
        header={mode === "login" ? "Sign In" : "Create Account"}
        visible={visible}
        onHide={onHide}
        footer={footer}
        modal
        dismissableMask
        className="w-full max-w-md mx-4"
      >
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md text-sm">
            {errorMsg}
          </div>
        )}

        {mode === "login" ? (
          <form
            ref={formRef}
            onSubmit={submitLogin}
            className="flex flex-col gap-4"
          >
            <label className="text-sm font-medium text-gray-300">Email</label>
            <InputText
              type="email"
              name="email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
              required
            />

            <label className="text-sm font-medium text-gray-300">
              Password
            </label>
            <Password
              name="password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              feedback={false}
              toggleMask
              required
            />

            {/* Hidden submit for accessibility; footer Sign In triggers requestSubmit */}
            <button type="submit" className="hidden" />
          </form>
        ) : (
          <form
            ref={registerFormRef}
            onSubmit={submitRegister}
            className="flex flex-col gap-4"
          >
            <label className="text-sm font-medium text-gray-300">
              First Name
            </label>
            <InputText
              name="firstName"
              value={registerForm.firstName}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, firstName: e.target.value })
              }
            />

            {/* Last Name */}
            <label className="text-sm font-medium text-gray-300">
              Last Name
            </label>
            <InputText
              name="lastName"
              value={registerForm.lastName}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, lastName: e.target.value })
              }
            />

            <label className="text-sm font-medium text-gray-300">
              Username
            </label>
            <InputText
              name="username"
              value={registerForm.username}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, username: e.target.value })
              }
              required
            />

            <label className="text-sm font-medium text-gray-300">Email</label>
            <InputText
              type="email"
              name="registerEmail"
              value={registerForm.registerEmail}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  registerEmail: e.target.value,
                })
              }
              required
            />

            <label className="text-sm font-medium text-gray-300">
              Password
            </label>
            <Password
              name="registerPassword"
              value={registerForm.registerPassword}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  registerPassword: e.target.value,
                })
              }
              toggleMask
              required
            />

            <label className="text-sm font-medium text-gray-300">
              Bio (optional)
            </label>
            <InputText
              name="bio"
              value={registerForm.bio}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, bio: e.target.value })
              }
            />

            <label className="text-sm font-medium text-gray-300">
              Profile Picture URL{" "}
              <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <InputText
              name="pictureUrl"
              value={registerForm.pictureUrl}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, pictureUrl: e.target.value })
              }
            />

            {/* Hidden submit for accessibility; footer Register triggers requestSubmit */}
            <button type="submit" className="hidden" />
          </form>
        )}
      </Dialog>
    </>
  );
}
