"use client";
import React, { useEffect } from "react";
import { UserProvider } from "../context/UserContext";
import ModalProvider from "./ModalProvider";
import ThemeProvider from './ThemeProvider';
import { Amplify } from "aws-amplify";


export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    Amplify.configure({
      Auth: {
        Cognito: {
          identityPoolId: "us-west-1:495addf9-156d-41fd-bf55-3c576a9e1c5e",
          allowGuestAccess: true,
        },
        region: "us-west-1",
      } as any,
    });
  }, []);
  return (
    <UserProvider>
      <ThemeProvider>
        <ModalProvider>{children}</ModalProvider>
      </ThemeProvider>
    </UserProvider>
  );
}
