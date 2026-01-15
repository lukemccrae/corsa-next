"use client";
import React, { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { Button } from "primereact/button";

interface DiscordHelpButtonProps {
  inviteUrl: string;
}

export default function DiscordHelpButton({ inviteUrl }: DiscordHelpButtonProps) {
  const { theme } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    window.open(inviteUrl, "_blank", "noopener,noreferrer");
  };

  const bgColor = theme === "dark" ? "bg-indigo-600" : "bg-indigo-500";
  const hoverBgColor = theme === "dark" ? "hover:bg-indigo-700" : "hover:bg-indigo-600";
  const tooltipBg = theme === "dark" ? "bg-gray-800" : "bg-gray-900";

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip */}
      {showTooltip && (
        <div
          className={`absolute bottom-full right-0 mb-2 px-3 py-2 ${tooltipBg} text-white text-sm rounded-lg whitespace-nowrap shadow-lg transition-opacity duration-200`}
        >
          Need help? Join our Discord
          {/* Arrow pointer */}
          <div
            className={`absolute top-full right-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent ${
              theme === "dark" ? "border-t-8 border-t-gray-800" : "border-t-8 border-t-gray-900"
            }`}
          />
        </div>
      )}

      {/* Discord Button */}
      <Button
        onClick={handleClick}
        className={`${bgColor} ${hoverBgColor} hover:scale-110 transition-all duration-200 shadow-lg`}
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          padding: 0,
          border: "none",
        }}
        aria-label="Need help? Join our Discord"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-7 h-7 text-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
        </svg>
      </Button>
    </div>
  );
}
