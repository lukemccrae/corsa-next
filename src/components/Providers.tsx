"use client";
import React from "react";
import { UserProvider } from "../context/UserContext";
import ModalProvider from "./ModalProvider";
import ThemeProvider from './ThemeProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ThemeProvider>
        <ModalProvider>{children}</ModalProvider>
      </ThemeProvider>
    </UserProvider>
  );
}
