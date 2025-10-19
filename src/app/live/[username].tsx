import React from 'react';
import { useRouter } from 'next/router';

// This page is for /live/[username] tracker
export default function LivePage() {
  const { query } = useRouter();
  const username = query.username as string | undefined;

  return <div></div>;
}