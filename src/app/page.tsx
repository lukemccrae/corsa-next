// app/page.tsx
"use client";
import dynamic from "next/dynamic";

const FullScreenMap = dynamic(() => import("../components/BasicMap"), {
  ssr: false,
});

export default function Home() {
  return (
    // Fill the parent main (which is flex-1 in layout). Use w-full to avoid horizontal scroll.
    <div className="relative h-full w-full">
      <FullScreenMap center={[51.505, -0.09]} zoom={3} />
    </div>
  );
}