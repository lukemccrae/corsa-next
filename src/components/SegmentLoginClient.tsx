"use client";
import React, { useEffect, useState } from "react";
import LoginModal from "./LoginModal";
import { useRouter } from "next/navigation";

type SegmentLoginClientProps = {
  segmentId: string;
  segmentName?: string;
  segmentDescription: string;
  segmentLocation: string;
};

export default function SegmentLoginClient({
  segmentId,
  segmentName,
}: SegmentLoginClientProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
  }, []);

  const hide = () => {
    setVisible(false);
    if (segmentId) {
      router.push(`/burritoleague/${segmentId}`);
    } else {
      router. push("/burritoleague");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      {segmentName && (
        <div className="absolute top-6 left-0 right-0 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
            Sign in to join
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {segmentName}
          </h1>
        </div>
      )}
      <LoginModal visible={visible} onHide={hide} />
    </div>
  );
}