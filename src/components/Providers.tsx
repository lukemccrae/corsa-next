'use client';
import React from 'react';
import { UserProvider } from '../context/UserContext';
import ModalProvider from './ModalProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <ModalProvider>{children}</ModalProvider>
    </UserProvider>
  );
}