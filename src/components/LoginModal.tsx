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
  const formRef = useRef<HTMLFormElement>(null);
  const registerFormRef = useRef<HTMLFormElement>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    registerEmail: "",
    registerPassword:  "",
    bio: "",
    pictureUrl: "",
  });

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  // Handle login submit
  const submitLogin = async (e: React. FormEvent) => {
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
    <div className="flex items-center justify-between gap-3 pt-4">
      <Button
        label={mode === "login" ? "Need an account?" : "Have an account?"}
        link
        type="button"
        onClick={() => {
          setErrorMsg("");
          setMode(mode === "login" ? "register" : "login");
        }}
      />
      <div className="flex gap-2">
        <Button label="Cancel" severity="secondary" onClick={onHide} type="button" />
        <Button
          label={mode === "login" ? "Sign In" : "Register"}
          loading={loading}
          type="button"
          onClick={() => {
            if (mode === "login") {
              formRef.current?.requestSubmit();
            } else {
              registerFormRef.current?. requestSubmit();
            }
          }}
        />
      </div>
    </div>
  );

  return (
    <Dialog
      header={mode === "login" ? "Sign In" : "Create Account"}
      visible={visible}
      onHide={onHide}
      modal
      dismissableMask
      className="w-full max-w-md"
      footer={footer}
    >
      {errorMsg && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      {mode === "login" ?  (
        <form ref={formRef} onSubmit={submitLogin} className="flex flex-col gap-4">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <InputText
            id="email"
            name="email"
            type="email"
            required
            className="w-full"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e. target.value })}
          />

          <label className="text-sm font-medium text-gray-700">Password</label>
          <Password
            id="password"
            name="password"
            feedback={false}
            toggleMask
            required
            className="w-full"
            inputClassName="w-full"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
          />

          {/* Hidden submit for accessibility; footer Sign In triggers requestSubmit */}
          <button type="submit" className="hidden" />
        </form>
      ) : (
        <form ref={registerFormRef} onSubmit={submitRegister} className="flex flex-col gap-4">
          <label className="text-sm font-medium text-gray-700">
            First Name
          </label>
          <InputText
            id="firstName"
            name="firstName"
            required
            className="w-full"
            value={registerForm.firstName}
            onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
          />

          {/* Last Name */}
          <label className="text-sm font-medium text-gray-700">Last Name</label>
          <InputText
            id="lastName"
            name="lastName"
            required
            className="w-full"
            value={registerForm.lastName}
            onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
          />

          <label className="text-sm font-medium text-gray-700">Username</label>
          <InputText
            id="username"
            name="username"
            required
            className="w-full"
            value={registerForm.username}
            onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
          />

          <label className="text-sm font-medium text-gray-700">Email</label>
          <InputText
            id="registerEmail"
            name="registerEmail"
            type="email"
            required
            className="w-full"
            value={registerForm.registerEmail}
            onChange={(e) => setRegisterForm({ ...registerForm, registerEmail: e.target.value })}
          />

          <label className="text-sm font-medium text-gray-700">Password</label>
          <Password
            id="registerPassword"
            name="registerPassword"
            feedback={false}
            toggleMask
            required
            className="w-full"
            inputClassName="w-full"
            value={registerForm.registerPassword}
            onChange={(e) => setRegisterForm({ ...registerForm, registerPassword: e.target.value })}
          />

          <label className="text-sm font-medium text-gray-700">
            Bio (optional)
          </label>
          <InputText
            id="bio"
            name="bio"
            className="w-full"
            value={registerForm.bio}
            onChange={(e) => setRegisterForm({ ...registerForm, bio: e.target.value })}
          />

          <label className="text-sm font-medium text-gray-700">
            Profile Picture URL{" "}
            <span className="font-normal text-gray-500 dark:text-gray-400">
              (optional)
            </span>
          </label>
          <InputText
            id="pictureUrl"
            name="pictureUrl"
            type="url"
            className="w-full"
            value={registerForm.pictureUrl}
            onChange={(e) => setRegisterForm({ ...registerForm, pictureUrl: e.target.value })}
          />

          {/* Hidden submit for accessibility; footer Register triggers requestSubmit */}
          <button type="submit" className="hidden" />
        </form>
      )}
    </Dialog>
  );
}