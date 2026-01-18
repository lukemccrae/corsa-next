"use client";
import React, { useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import { useUser } from "../context/UserContext";

type LoginModalProps = {
  visible: boolean;
  onHide: () => void;
};

type ModalMode = "login" | "register" | "forgotPassword" | "resetPassword";

export default function LoginModal({ visible, onHide }: LoginModalProps) {
  const { loginUser, registerUser, forgotPassword, resetPassword } = useUser();
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
    email:  "",
  });

  // Reset password form state
  const [resetPasswordForm, setResetPasswordForm] = useState({
    email: "",
    code: "",
    newPassword: "",
  });

  // Reset modal state when visibility changes
  React.useEffect(() => {
    if (! visible) {
      setMode("login");
      setErrorMsg("");
      setLoading(false);
    }
  }, [visible]);

  // Handle login submit
  const submitLogin = async (e: React. FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      await loginUser(e);
      toast.current?.show({
        severity: "success",
        summary:  "Welcome back!",
        detail: "You've been logged in successfully.",
        life: 3000,
      });
      setTimeout(() => onHide(), 1000);
    } catch (err:  any) {
      const message = err?.message ?? "Login failed. Please check your credentials and try again."
      setErrorMsg(message);
      toast.current?.show({
        severity: "error",
        summary:  "Login Failed",
        detail: message,
        life: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle registration submit
  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      await registerUser(e);
      toast.current?.show({
        severity: "success",
        summary: "Registration Successful!",
        detail: "Your account has been created. You can now sign in.",
        life: 3000,
      });
      // Show success message in modal
      setMode("login");
      setErrorMsg("");
      // Clear registration form
      setRegisterForm({
        firstName: "",
        lastName: "",
        username: "",
        registerEmail: "",
        registerPassword: "",
        bio: "",
        pictureUrl: "",
      });
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        "Registration failed. Please check your information and try again.";
      setErrorMsg(errorMessage);
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
const submitForgotPassword = async (e:  React.FormEvent) => {
  e.preventDefault();
  setErrorMsg("");
  setLoading(true);
  try {
    await forgotPassword(forgotPasswordForm.email);
    setResetEmail(forgotPasswordForm.email);
    toast.current?. show({
      severity: "success",
      summary: "Code Sent",
      detail: "Please check your email for the verification code.",
      life: 5000,
    });
    setMode("resetPassword");
    setResetPasswordForm({ ... resetPasswordForm, email: forgotPasswordForm.email });
  } catch (err:  any) {
    const errorMessage = err?. message || "Failed to send reset code.  Please try again.";
    setErrorMsg(errorMessage);
    toast.current?.show({
      severity: "error",
      summary: "Request Failed",
      detail: errorMessage,
      life: 5000,
    });
    
    // Don't allow progression to reset password if user doesn't exist
    if (err?. message?.includes('No account found')) {
      setMode("login"); // Send them back to login
    }
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
      toast.current?.show({
        severity: "success",
        summary:  "Password Reset Successful",
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
        return "Enter Reset Code";
      default:
        return "Sign In";
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        onHide={onHide}
        header={
          <div className="flex items-center gap-2">
            <i className="pi pi-user text-xl" />
            <h2 className="text-2xl font-bold m-0">{getTitle()}</h2>
          </div>
        }
        modal
        dismissableMask
        className="w-full max-w-md"
        contentClassName="pb-0"
      >
        {/* Error message */}
        {errorMsg && (
          <Message
            severity="error"
            text={errorMsg}
            className="w-full mb-4"
          />
        )}

        {/* LOGIN MODE */}
        {mode === "login" && (
          <form onSubmit={submitLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-semibold text-sm">
                Email
              </label>
              <InputText
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e. target.value })
                }
                required
                autoComplete="email"
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="font-semibold text-sm">
                Password
              </label>
              <Password
                id="password"
                name="password"
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                feedback={false}
                toggleMask
                required
                autoComplete="current-password"
                className="w-full"
                inputClassName="w-full"
              />
            </div>

            <Button
              type="submit"
              label="Sign In"
              icon="pi pi-sign-in"
              loading={loading}
              className="w-full"
            />

            <Divider />

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                label="Create Account"
                icon="pi pi-user-plus"
                severity="secondary"
                outlined
                onClick={() => {
                  setErrorMsg("");
                  setMode("register");
                }}
                className="w-full"
              />
              <Button
                type="button"
                label="Forgot Password?"
                severity="help"
                text
                onClick={() => {
                  setErrorMsg("");
                  setMode("forgotPassword");
                }}
                className="w-full"
              />
            </div>
          </form>
        )}

        {/* REGISTER MODE */}
        {mode === "register" && (
          <form onSubmit={submitRegister} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label htmlFor="firstName" className="font-semibold text-sm">
                  First Name
                </label>
                <InputText
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  value={registerForm.firstName}
                  required
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, firstName: e.target.value })
                  }
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="lastName" className="font-semibold text-sm">
                  Last Name
                </label>
                <InputText
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  required
                  value={registerForm.lastName}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, lastName: e.target. value })
                  }
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="username" className="font-semibold text-sm">
                Username <span className="text-red-500">*</span>
              </label>
              <InputText
                id="username"
                name="username"
                placeholder="johndoe"
                value={registerForm.username}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, username: e.target.value })
                }
                required
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="registerEmail" className="font-semibold text-sm">
                Email <span className="text-red-500">*</span>
              </label>
              <InputText
                id="registerEmail"
                name="registerEmail"
                type="email"
                placeholder="you@example.com"
                value={registerForm.registerEmail}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    registerEmail: e.target.value,
                  })
                }
                required
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="registerPassword" className="font-semibold text-sm">
                Password <span className="text-red-500">*</span>
              </label>
              <Password
                id="registerPassword"
                name="registerPassword"
                placeholder="Choose a strong password"
                value={registerForm.registerPassword}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    registerPassword:  e.target.value,
                  })
                }
                toggleMask
                required
                className="w-full"
                inputClassName="w-full"
              />
            </div>

            {/* <div className="flex flex-col gap-2">
              <label htmlFor="bio" className="font-semibold text-sm">
                Bio <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <InputText
                id="bio"
                name="bio"
                placeholder="Tell us about yourself"
                value={registerForm.bio}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, bio: e.target.value })
                }
                className="w-full"
              />
            </div> */}

            {/* <div className="flex flex-col gap-2">
              <label htmlFor="pictureUrl" className="font-semibold text-sm">
                Profile Picture URL{" "}
                <span className="text-gray-500 text-xs">(optional)</span>
              </label>
              <InputText
                id="pictureUrl"
                name="pictureUrl"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={registerForm.pictureUrl}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, pictureUrl: e.target.value })
                }
                className="w-full"
              />
            </div> */}

            <Button
              type="submit"
              label="Create Account"
              icon="pi pi-user-plus"
              loading={loading}
              className="w-full"
            />

            <Divider />

            <Button
              type="button"
              label="Back to Sign In"
              icon="pi pi-arrow-left"
              severity="secondary"
              text
              onClick={() => {
                setErrorMsg("");
                setMode("login");
              }}
              className="w-full"
            />
          </form>
        )}

        {/* FORGOT PASSWORD MODE */}
        {mode === "forgotPassword" && (
          <form onSubmit={submitForgotPassword} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 m-0">
              Enter your email address and we'll send you a code to reset your password.
            </p>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="forgotEmail" className="font-semibold text-sm">
                Email
              </label>
              <InputText
                id="forgotEmail"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={forgotPasswordForm.email}
                onChange={(e) =>
                  setForgotPasswordForm({ email: e.target.value })
                }
                required
                autoComplete="email"
                className="w-full"
              />
            </div>

            <Button
              type="submit"
              label="Send Reset Code"
              icon="pi pi-send"
              loading={loading}
              className="w-full"
            />

            <Divider />

            <Button
              type="button"
              label="Back to Sign In"
              icon="pi pi-arrow-left"
              severity="secondary"
              text
              onClick={() => {
                setErrorMsg("");
                setMode("login");
              }}
              className="w-full"
            />
          </form>
        )}

        {/* RESET PASSWORD MODE */}
        {mode === "resetPassword" && (
          <form onSubmit={submitResetPassword} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 m-0">
              Enter the verification code sent to{" "}
              <strong>{resetPasswordForm.email}</strong>
            </p>

            <div className="flex flex-col gap-2">
              <label htmlFor="resetCode" className="font-semibold text-sm">
                Verification Code
              </label>
              <InputText
                id="resetCode"
                name="code"
                placeholder="Enter 6-digit code"
                value={resetPasswordForm.code}
                onChange={(e) =>
                  setResetPasswordForm({ ... resetPasswordForm, code: e. target.value })
                }
                required
                maxLength={6}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="newPassword" className="font-semibold text-sm">
                New Password
              </label>
              <Password
                id="newPassword"
                name="newPassword"
                placeholder="Choose a new password"
                value={resetPasswordForm.newPassword}
                onChange={(e) =>
                  setResetPasswordForm({
                    ...resetPasswordForm,
                    newPassword: e. target.value,
                  })
                }
                toggleMask
                required
                className="w-full"
                inputClassName="w-full"
              />
            </div>

            <Button
              type="submit"
              label="Reset Password"
              icon="pi pi-check"
              loading={loading}
              className="w-full"
            />

            <Divider />

            <Button
              type="button"
              label="Back to Sign In"
              icon="pi pi-arrow-left"
              severity="secondary"
              text
              onClick={() => {
                setErrorMsg("");
                setMode("login");
              }}
              className="w-full"
            />
          </form>
        )}
      </Dialog>
    </>
  );
}