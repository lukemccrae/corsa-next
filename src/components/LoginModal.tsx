"use client";
import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useUser } from "../context/UserContext";

type LoginModalProps = {
  visible: boolean;
  onHide: () => void;
};

export default function LoginModal({ visible, onHide }: LoginModalProps) {
  const { loginUser, registerUser } = useUser();
  const formRef = useRef<HTMLFormElement | null>(null);
  const registerFormRef = useRef<HTMLFormElement | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Handle login submit
  const submitLogin = async (e: React.FormEvent) => {
    setErrorMsg("");
    setLoading(true);
    try {
      await loginUser(e);
      onHide();
    } catch (err) {
      setErrorMsg("Login failed. Please try again.");
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
      onHide();
    } catch (err) {
      setErrorMsg("Registration failed. Please check your info and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Dialog footer (switch/sign in/register/cancel)
  const footer = (
    <div className="flex justify-between items-center gap-2">
      <div>
        <Button
          label={
            mode === "login" ? "Create Account" : "Already have an account?"
          }
          className="p-button-text"
          onClick={() => {
            setErrorMsg("");
            setMode(mode === "login" ? "register" : "login");
          }}
        />
      </div>
      <div className="flex gap-2">
        <Button label="Cancel" className="p-button-text" onClick={onHide} />
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
    <Dialog
      header={mode === "login" ? "Sign in" : "Create Account"}
      visible={visible}
      onHide={onHide}
      modal
      dismissableMask
      className="w-half max-w-md"
      footer={footer}
    >
      {errorMsg && (
        <div className="mb-2 text-xs text-red-500 text-center">{errorMsg}</div>
      )}

      {mode === "login" ? (
        <form
          ref={formRef}
          onSubmit={submitLogin}
          className="flex flex-col gap-4"
          aria-label="login-form"
        >
          <label className="text-sm font-medium text-gray-700">Email</label>
          <InputText
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="w-full"
          />

          <label className="text-sm font-medium text-gray-700">Password</label>
          <Password
            name="password"
            placeholder="Enter your password"
            toggleMask
            feedback={false}
            required
            className="w-full"
          />

          {/* Hidden submit for accessibility; footer Sign In triggers requestSubmit */}
          <button type="submit" className="hidden" aria-hidden />
        </form>
      ) : (
        <form
          ref={registerFormRef}
          onSubmit={submitRegister}
          className="flex flex-col gap-4"
          aria-label="register-form"
        >
          <label className="text-sm font-medium text-gray-700">
            First Name
          </label>
          <InputText
            name="firstName"
            type="text"
            placeholder="First name"
            autoComplete="given-name"
            required
            className="w-full"
            value="luke"
          />

          {/* Last Name */}
          <label className="text-sm font-medium text-gray-700">Last Name</label>
          <InputText
            name="lastName"
            type="text"
            placeholder="Last name"
            autoComplete="family-name"
            required
            className="w-full"
            value="mccrae"
          />
          <label className="text-sm font-medium text-gray-700">Username</label>
          <InputText
            name="username"
            type="text"
            placeholder="Pick a username"
            autoComplete="username"
            required
            className="w-full"
            value="corsa"
          />

          <label className="text-sm font-medium text-gray-700">Email</label>
          <InputText
            name="registerEmail"
            type="email"
            placeholder="your@email.com"
            autoComplete="email"
            required
            className="w-full"
            value="lukemccrae@corsa.run"
          />

          <label className="text-sm font-medium text-gray-700">Password</label>
          <Password
            name="registerPassword"
            placeholder="Enter a password"
            toggleMask
            feedback={false}
            required
            className="w-full"
            value="Eeeee4444$$$$"
          />

          <label className="text-sm font-medium text-gray-700">
            Bio <span className="text-xs text-gray-400">(optional)</span>
          </label>
          <InputText
            name="bio"
            type="text"
            placeholder="Tell us about yourself"
            className="w-full"
          />

          <label className="text-sm font-medium text-gray-700">
            Profile Picture URL{" "}
            <span className="text-xs text-gray-400">(optional)</span>
          </label>
          <InputText
            name="pictureUrl"
            type="url"
            placeholder="https://your.image.url"
            className="w-full"
            value="https://i.imgur.com/MXffVYs.png"
          />

          {/* Hidden submit for accessibility; footer Register triggers requestSubmit */}
          <button type="submit" className="hidden" aria-hidden />
        </form>
      )}
    </Dialog>
  );
}
