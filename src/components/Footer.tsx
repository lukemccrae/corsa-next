"use client";
import React from "react";
import { Button } from "primereact/button";
import { useTheme } from "./ThemeProvider";


export const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer
      className={`bg-gray-900 text-gray-100 border-t border-gray-800 py-6 px-4 mt-auto`}
    >
      <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>© CORSA 2026</span>
          <a
            href="/terms"
            className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Terms
          </a>
          <a
            href="/privacy"
            className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Privacy
          </a>
          <a
            href="/support"
            className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
};
