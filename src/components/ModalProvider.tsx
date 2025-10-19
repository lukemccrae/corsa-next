'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import LoginModal from './LoginModal';

type ModalContextType = {
  openLogin: () => void;
  closeLogin: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within a ModalProvider');
  return ctx;
};

export default function ModalProvider({ children }: { children: React.ReactNode }) {
  const [loginVisible, setLoginVisible] = useState(false);
  const [pushedHistory, setPushedHistory] = useState(false);

  const openLogin = () => {
    if (typeof window === 'undefined') return;

    if (window.location.pathname !== '/login') {
      // push state so URL becomes /login without Next navigation
      window.history.pushState({ modal: 'login' }, '', '/login');
      setPushedHistory(true);
    }
    setLoginVisible(true);
  };

  const closeLogin = () => {
    setLoginVisible(false);

    if (pushedHistory && typeof window !== 'undefined') {
      // go back to restore previous URL; popstate listener will keep state consistent
      window.history.back();
      setPushedHistory(false);
    } else {
      // If we didn't push but are at /login (direct load), replace to root
      if (typeof window !== 'undefined' && window.location.pathname === '/login') {
        window.history.replaceState({}, '', '/');
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onPop = (e: PopStateEvent) => {
      const state = (e.state as any) ?? {};
      if (state.modal === 'login' || window.location.pathname === '/login') {
        setLoginVisible(true);
      } else {
        setLoginVisible(false);
      }
    };

    window.addEventListener('popstate', onPop);

    // If the page was loaded at /login directly, open the modal
    if (window.location.pathname === '/login') {
      setLoginVisible(true);
    }

    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <ModalContext.Provider value={{ openLogin, closeLogin }}>
      {children}
      <LoginModal visible={loginVisible} onHide={closeLogin} />
    </ModalContext.Provider>
  );
}