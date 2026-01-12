import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full px-6 py-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
        <i className="pi pi-map-marker text-6xl text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          404 - Page Not Found
        </h2>
        <p className="text-gray-600 dark: text-gray-400 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="text-gray-600 dark: text-gray-400 mb-6">
          We are in the process of updating the old Corsa tracking pages, they
          will be restored soon.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <i className="pi pi-home" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
