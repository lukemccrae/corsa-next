'use client';

import React from 'react';
import { Button } from 'primereact/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full px-6 py-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
        <i className="pi pi-exclamation-triangle text-6xl text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark: text-gray-100">
          Something went wrong! 
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            label="Try again"
            icon="pi pi-refresh"
            onClick={reset}
            severity="danger"
          />
          <Button
            label="Go home"
            icon="pi pi-home"
            onClick={() => (window. location.href = '/')}
            outlined
          />
        </div>
      </div>
    </div>
  );
}