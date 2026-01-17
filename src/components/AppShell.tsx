'use client';
import React from 'react';
import Header from './Header';
import { Footer } from './Footer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-screen w-screen bg-gray-50">
      {/* Header overlay */}
      <Header></Header>
      {children}
      {/* Footer overlay */}
    </div>
  );
}
