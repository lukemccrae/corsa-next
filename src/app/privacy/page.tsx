"use client";
import React from "react";
import { Card } from "primereact/card";
import { useTheme } from "@/src/components/ThemeProvider";

export default function PrivacyPolicyPage() {
  const { theme } = useTheme();

  const cardBg =
    theme === "dark"
      ? "bg-gray-800 border-gray-700 text-gray-100"
      : "bg-white border-gray-200 text-gray-900";

  return (
    <div className="min-h-screen p-4 md:p-8">
      <Card className={`max-w-4xl mx-auto ${cardBg}`}>
        <div className="prose dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Last Updated: January 17, 2026
          </p>

          {/* Data Collection */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Data Collection</h2>
            <p className="mb-4">
              When you connect your Strava account, we collect:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Your activity data (routes, times, distances)</li>
              <li>Profile information (name, photo)</li>
              <li>Segment efforts and leaderboard positions</li>
            </ul>
          </section>

          {/* Data Usage */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Data Usage</h2>
            <p className="mb-4">We use your Strava data solely to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Display your activities and achievements</li>
              <li>Show you leaderboard rankings</li>
              <li>Provide community features for group events</li>
            </ul>

            <p className="font-semibold mb-4">We do NOT:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Share your data with third parties</li>
              <li>Use your data for advertising or analytics</li>
              <li>Train AI/ML models with your data</li>
            </ul>
          </section>

          {/* Data Deletion */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Data Deletion</h2>
            <p className="mb-4">
              You can disconnect your Strava account at any time in Settings.
              We will delete all your Strava data immediately upon disconnection.
            </p>
          </section>

          {/* Strava's Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Strava's Privacy Policy</h2>
            <p className="mb-4">
              Your use of Strava data is also governed by{" "}
              <a
                href="https://www.strava.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Strava's Privacy Policy
              </a>.
            </p>
          </section>

          {/* Acknowledgment */}
          <section className="mb-8 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Acknowledgment of Strava Integration</h3>
            <div className="flex items-center gap-4 mb-3">
              <img
                src="/api_logo_pwrdBy_strava_horiz_white.svg"
                alt="Powered by Strava"
                className="h-8"
              />
            </div>
            <p className="text-sm">
              CORSA uses the Strava API to provide enhanced features. By using CORSA's Strava integration,
              you acknowledge that you have read and agree to Strava's{" "}
              <a
                href="https://www.strava.com/legal/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="https://www.strava.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Privacy Policy
              </a>.
            </p>
          </section>
        </div>
      </Card>
    </div>
  );
}
