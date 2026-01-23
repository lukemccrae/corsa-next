import React from "react";
import { Card } from "primereact/card";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "primereact/button";
import DiscordButton from "@/src/components/DiscordButton";

export const metadata: Metadata = {
  title: "Support - CORSA",
  description: "Get help and support for CORSA",
};

export default function SupportPage() {
  return (
    <div className="min-h-70vh bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Support
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              We're here to help! Reach out through any of the channels below.
            </p>
          </div>

          <div className="space-y-6">
            {/* Discord Community */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <i className="pi pi-discord text-3xl text-indigo-500 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Discord Community
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Join our Discord server to chat with the community and get
                    real-time support.
                  </p>
                  <DiscordButton />
                </div>
              </div>
            </div>
            {/* Email Support */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark: border-gray-700">
              <div className="flex items-start gap-4">
                <i className="pi pi-envelope text-3xl text-blue-500 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Email Support
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Send us an email and we'll get back to you as soon as
                    possible.
                  </p>
                  <a
                    href="mailto:lukemccrae@corsa.run"
                    className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    lukemccrae@corsa.run
                    <i className="pi pi-external-link text-sm" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Instagram */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <i className="pi pi-instagram text-3xl text-pink-500 mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Instagram
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Follow us on Instagram for updates and community highlights.
                </p>
                <a
                  href="https://www.instagram.com/corsa.run/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 font-medium"
                >
                  @corsa.run
                  <i className="pi pi-external-link text-sm" />
                </a>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
