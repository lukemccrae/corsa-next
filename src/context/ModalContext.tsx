'use client';
import React, { createContext, useContext, useState } from 'react';

type ModalContextType = {
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  toggleLogin: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within a ModalProvider');
  return ctx;
};

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [loginOpen, setLoginOpen] = useState(false);

  const openLogin = () => setLoginOpen(true);
  const closeLogin = () => setLoginOpen(false);
  const toggleLogin = () => setLoginOpen(v => !v);

  return (
    <ModalContext.Provider value={{ loginOpen, openLogin, closeLogin, toggleLogin }}>
      {children}
    </ModalContext.Provider>
  );
};