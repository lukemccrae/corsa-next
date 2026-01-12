'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error:  Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#1f2937',
          color: 'white',
          fontFamily:  'system-ui, sans-serif',
          padding: '20px'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong!</h2>
            <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
              {error. message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={reset}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor:  'pointer',
                fontSize:  '1rem'
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}