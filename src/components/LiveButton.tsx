'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';

type LiveButtonProps = {
  username?: string;
  streamId?: string | number | null;
  onClick?: () => void; // optional extra callback (called after navigation)
  size?: 'sm' | 'md' | 'lg';
};

export default function LiveButton({
  username,
  streamId,
  onClick,
  size = 'md'
}: LiveButtonProps) {
  const router = useRouter();

  const sizeClasses =
    size === 'sm' ? 'px-3 py-1 text-xs' : size === 'lg' ? 'px-4 py-2 text-sm' : 'px-3 py-1 text-sm';

  const handleClick = (e?: React.MouseEvent) => {
    // Prevent default if used inside a form or anchor
    e?.preventDefault();

    if (username) {
      // build route: /live/:username or /live/:username/:streamId
      let path = `/live/${encodeURIComponent(String(username))}`;
      if (streamId) path += `/${encodeURIComponent(String(streamId))}`;
      router.push(path);
    }

    if (typeof onClick === 'function') {
      try {
        onClick();
      } catch (err) {
        // swallow to avoid breaking navigation
        console.error('LiveButton onClick error', err);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        label="LIVE"
        severity="danger"
        className={`p-button-rounded p-button-text ${sizeClasses} font-semibold text-white`}
        onClick={handleClick}
        aria-label="Live"
      />
    </div>
  );
}