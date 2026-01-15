'use client';
import React, { useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useTheme } from './ThemeProvider';

type ShareButtonProps = {
  url?: string;
  title?: string;
};

export default function ShareButton({ url, title }: ShareButtonProps) {
  const { theme } = useTheme();
  const toast = useRef<Toast>(null);

  const handleShare = async () => {
    // Use provided URL or default to current page URL
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    try {
      // Check if clipboard API is available
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        
        toast.current?.show({
          severity: 'success',
          summary: 'Link Copied!',
          detail: title ? `Link to "${title}" copied to clipboard` : 'Link copied to clipboard',
          life: 3000,
        });
      } else {
        // Fallback if clipboard API is not available
        toast.current?.show({
          severity: 'warn',
          summary: 'Clipboard Not Available',
          detail: 'Please copy the URL manually from your browser',
          life: 5000,
        });
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Copy Failed',
        detail: 'Failed to copy link to clipboard. Please try again.',
        life: 5000,
      });
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Button
        icon="pi pi-share-alt"
        onClick={handleShare}
        className="p-button-rounded p-button-text"
        aria-label="Share"
        tooltip="Share this page"
        tooltipOptions={{ position: 'bottom' }}
      />
    </>
  );
}
