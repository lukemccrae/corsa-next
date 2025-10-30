"use client";
import { useParams, useRouter } from 'next/navigation';

export default function LivePage() {
  const params = useParams(); // access dynamic route segments
  const router = useRouter(); // navigate programmatically if needed

  const username = params.username;

  return (
    <main className="p-8">
      <h1>Live Tracker for {username}</h1>
    </main>
  );
}