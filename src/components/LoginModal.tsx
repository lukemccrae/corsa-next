"use client";
import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useUser } from "../context/UserContext";

type LoginModalProps = {
  visible: boolean;
  onHide: () => void;
};

type ModalMode = "login" | "register" | "forgotPassword" | "resetPassword";

export default function LoginModal({ visible, onHide }: LoginModalProps) {
  const { loginUser, registerUser, forgotPassword, resetPassword } = useUser();
  const formRef = useRef<HTMLFormElement>(null);
  const registerFormRef = useRef<HTMLFormElement>(null);
  const forgotPasswordFormRef = useRef<HTMLFormElement>(null);
  const resetPasswordFormRef = useRef<HTMLFormElement>(null);
  const toast = useRef<Toast>(null);
  
  const [mode, setMode] = useState<ModalMode>("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [resetEmail, setResetEmail] = useState("");

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

  // Forgot password form state
  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: "",
  });

  // Reset password form state
  const [resetPasswordForm, setResetPasswordForm] = useState({
    email: "",
    code: "",
    newPassword: "",
  });

  // Handle login submit
  const submitLogin = async (e: React. FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      await loginUser(e);
      onHide();
    } catch (err:  any) {
      const message = err?. message ??  "Login failed. Please try again. ";
      setErrorMsg(message);
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
  const submitRegister = async (e: React. FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      await registerUser(e);
      toast.current?.show({
        severity: "success",
        summary:  "Registration Successful",
        detail: "Please check your email to verify your account.",
        life: 6000,
      });
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        "Registration failed. Please check your info and try again.";
      setErrorMsg(errorMessage);
      toast.current?.show({
        severity: "error",
        summary: "Registration Failed",
        detail: errorMessage,
        life:  5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle forgot password submit
  const submitForgotPassword = async (e: React. FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      await forgotPassword(forgotPasswordForm. email);
      setResetEmail(forgotPasswordForm.email);
      toast.current?.show({
        severity: "success",
        summary: "Code Sent",
        detail: "Please check your email for the verification code.",
        life: 5000,
      });
      setMode("resetPassword");
      setResetPasswordForm({ ... resetPasswordForm, email: forgotPasswordForm.email });
    } catch (err: any) {
      const errorMessage = err?. message || "Failed to send reset code. Please try again.";
      setErrorMsg(errorMessage);
      toast.current?.show({
        severity: "error",
        summary: "Request Failed",
        detail: errorMessage,
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle reset password submit
  const submitResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      await resetPassword(
        resetPasswordForm.email,
        resetPasswordForm.code,
        resetPasswordForm.newPassword
      );
      toast.current?. show({
        severity: "success",
        summary: "Password Reset Successful",
        detail: "You can now login with your new password.",
        life: 5000,
      });
      setTimeout(() => {
        setMode("login");
        setResetPasswordForm({ email: "", code: "", newPassword:  "" });
        setForgotPasswordForm({ email: "" });
      }, 1500);
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to reset password. Please try again.";
      setErrorMsg(errorMessage);
      toast.current?.show({
        severity: "error",
        summary: "Reset Failed",
        detail: errorMessage,
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Get modal title based on mode
  const getTitle = () => {
    switch (mode) {
      case "login":
        return "Sign In";
      case "register": 
        return "Create Account";
      case "forgotPassword":
        return "Reset Password";
      case "resetPassword": 
        return "Reset Password";
      default:
        return "Sign In";
    }
  };

  // Dialog footer
  const footer = (
    <div className="flex flex-col gap-2 w-full">
      {mode === "login" && (
        <>
          <Button
            label="Don't have an account? Register"
            link
            onClick={() => {
              setErrorMsg("");
              setMode("register");
            }}
            className="w-full"
          />
          <Button
            label="Reset Password"
            link
            onClick={() => {
              setErrorMsg("");
              setMode("forgotPassword");
            }}
            className="w-full"
          />
        </>
      )}
      {mode === "register" && (
        <Button
          label="Already have an account? Sign In"
          link
          onClick={() => {
            setErrorMsg("");
            setMode("login");
          }}
          className="w-full"
        />
      )}
      {(mode === "forgotPassword" || mode === "resetPassword") && (
        <Button
          label="Back to Sign In"
          link
          onClick={() => {
            setErrorMsg("");
            setMode("login");
          }}
          className="w-full"
        />
      )}
      <div className="flex gap-2 justify-end mt-2">
        <Button label="Cancel" outlined onClick={onHide} disabled={loading} />
        <Button
          label={
            mode === "login"
              ? "Sign In"
              : mode === "register"
              ? "Register"
              : mode === "forgotPassword"
              ? "Send Code"
              : "Reset Password"
          }
          loading={loading}
          onClick={() => {
            if (mode === "login") {
              formRef.current?.requestSubmit();
            } else if (mode === "register") {
              registerFormRef.current?.requestSubmit();
            } else if (mode === "forgotPassword") {
              forgotPasswordFormRef.current?.requestSubmit();
            } else if (mode === "resetPassword") {
              resetPasswordFormRef.current?.requestSubmit();
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
        onHide={onHide}
        header={getTitle()}
        footer={footer}
        modal
        className="w-full max-w-md mx-4"
      >
        {errorMsg && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark: border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4">
            {errorMsg}
          </div>
        )}

        {mode === "login" && (
          <form ref={formRef} onSubmit={submitLogin} className="flex flex-col gap-4">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <InputText
              name="email"
              type="email"
              value={loginForm. email}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target. value })
              }
              required
              autoComplete="email"
            />

            <label className="text-sm font-medium text-gray-300">Password</label>
            <Password
              name="password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              feedback={false}
              toggleMask
              required
              autoComplete="current-password"
            />

            <button type="submit" hidden />
          </form>
        )}

        {mode === "register" && (
          <form ref={registerFormRef} onSubmit={submitRegister} className="flex flex-col gap-4">
            <label className="text-sm font-medium text-gray-300">First Name</label>
            <InputText
              name="firstName"
              value={registerForm.firstName}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, firstName: e.target. value })
              }
            />

            <label className="text-sm font-medium text-gray-300">Last Name</label>
            <InputText
              name="lastName"
              value={registerForm.lastName}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, lastName: e.target.value })
              }
            />

            <label className="text-sm font-medium text-gray-300">Username</label>
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
              name="registerEmail"
              type="email"
              value={registerForm.registerEmail}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  registerEmail: e.target.value,
                })
              }
              required
            />

            <label className="text-sm font-medium text-gray-300">Password</label>
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

            <label className="text-sm font-medium text-gray-300">Bio (optional)</label>
            <InputText
              name="bio"
              value={registerForm.bio}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, bio: e.target. value })
              }
            />

            <label className="text-sm font-medium text-gray-300">
              Profile Picture URL (optional)
            </label>
            <InputText
              name="pictureUrl"
              value={registerForm.pictureUrl}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, pictureUrl: e. target.value })
              }
            />

            <button type="submit" hidden />
          </form>
        )}

        {mode === "forgotPassword" && (
          <form ref={forgotPasswordFormRef} onSubmit={submitForgotPassword} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Enter your email address and we'll send you a code to reset your password.
            </p>
            <label className="text-sm font-medium text-gray-300">Email</label>
            <InputText
              name="email"
              type="email"
              value={forgotPasswordForm.email}
              onChange={(e) =>
                setForgotPasswordForm({ email: e.target.value })
              }
              required
              autoComplete="email"
            />
            <button type="submit" hidden />
          </form>
        )}

        {mode === "resetPassword" && (
          <form ref={resetPasswordFormRef} onSubmit={submitResetPassword} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Enter the verification code sent to {resetPasswordForm.email}
            </p>
            
            <label className="text-sm font-medium text-gray-300">Verification Code</label>
            <InputText
              name="code"
              value={resetPasswordForm. code}
              onChange={(e) =>
                setResetPasswordForm({ ...resetPasswordForm, code: e.target.value })
              }
              required
              placeholder="Enter 6-digit code"
            />

            <label className="text-sm font-medium text-gray-300">New Password</label>
            <Password
              name="newPassword"
              value={resetPasswordForm.newPassword}
              onChange={(e) =>
                setResetPasswordForm({
                  ...resetPasswordForm,
                  newPassword: e. target.value,
                })
              }
              toggleMask
              required
            />

            <button type="submit" hidden />
          </form>
        )}
      </Dialog>
    </>
  );
}