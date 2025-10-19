import React from 'react';
import { useRouter } from 'next/router';
import LiveTracker from '@/components/LiveTracker';

// This page is for /live/[username] tracker
export default function LivePage() {
  const { query } = useRouter();
  const username = query.username as string | undefined;

  return <LiveTracker username={username} />;
}