"use client";
import React from "react";
import { Footer } from "@/src/components/Footer";
import { useTheme } from "@/src/components/ThemeProvider";

export default function SupportPage() {
  const { theme } = useTheme();

  const border = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const cardBg = theme === "dark" ? "bg-gray-800" : "bg-white";

  return (
    <>
      <div className="flex flex-col flex-auto min-h-screen bg-surface-950">
        <div className="rounded-t-3xl bg-surface-0 dark:bg-surface-900 py-8 px-8 lg:px-20 max-w-4xl mx-auto w-full shadow">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-surface-900 dark:text-surface-0">
              Support
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Get help with your account, report issues, or connect with the community.
            </p>
          </div>

          {/* Contact Methods Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Contact Methods</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Discord */}
              <div className={`p-4 rounded-lg border ${border} ${cardBg}`}>
                <div className="flex items-center gap-3 mb-2">
                  <i className="pi pi-discord text-2xl text-indigo-500" />
                  <h3 className="font-semibold">Discord</h3>
                </div>
                <a
                  href="https://discord.gg/BcQTKNr4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Join our server
                </a>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Real-time chat &amp; community
                </p>
              </div>

              {/* Email */}
              <div className={`p-4 rounded-lg border ${border} ${cardBg}`}>
                <div className="flex items-center gap-3 mb-2">
                  <i className="pi pi-envelope text-2xl text-blue-500" />
                  <h3 className="font-semibold">Email</h3>
                </div>
                <a
                  href="mailto:support@corsa.run"
                  className="text-blue-500 hover:underline"
                >
                  support@corsa.run
                </a>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  General inquiries
                </p>
              </div>

              {/* GitHub */}
              <div className={`p-4 rounded-lg border ${border} ${cardBg}`}>
                <div className="flex items-center gap-3 mb-2">
                  <i className="pi pi-github text-2xl text-gray-900 dark:text-gray-100" />
                  <h3 className="font-semibold">GitHub</h3>
                </div>
                <a
                  href="https://github.com/lukemccrae/corsa-next/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Report an issue
                </a>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Bug reports &amp; technical issues
                </p>
              </div>
            </div>
          </div>

          {/* Quick Help Section */}
          <div className={`p-6 rounded-lg border ${border} ${cardBg}`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Need Quick Help?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Join our Discord community for real-time support and connect with other users.
                </p>
              </div>
              <a
                href="https://discord.gg/BcQTKNr4"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors"
              >
                <i className="pi pi-discord" />
                Join Discord
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
