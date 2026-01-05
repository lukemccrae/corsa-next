"use client";
import React, { useState, useRef, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { useTheme } from "./ThemeProvider";
import { useUser } from "../context/UserContext";

type ChatMessage = {
  id: string;
  username: string;
  profilePicture?:  string;
  text: string;
  timestamp: number;
  userColor?:  string;
};

type SegmentChatProps = {
  segmentId?:  string;
  className?: string;
};

// Mock messages for demo
const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    username:  "trailrunner_sam",
    profilePicture: "https://i.pravatar.cc/150? img=12",
    text: "Just crushed this segment! 🔥",
    timestamp: Date.now() - 1000 * 60 * 45,
    userColor: "#3b82f6",
  },
  {
    id: "2",
    username: "mountain_goat",
    profilePicture: "https://i.pravatar.cc/150?img=33",
    text: "That climb is brutal in the heat.  Great effort everyone! ",
    timestamp: Date.now() - 1000 * 60 * 30,
    userColor: "#10b981",
  },
  {
    id: "3",
    username: "ultrapacer",
    text: "What's the elevation gain on this one?",
    timestamp: Date. now() - 1000 * 60 * 25,
    userColor: "#f59e0b",
  },
  {
    id: "4",
    username: "trail_blazer_99",
    profilePicture:  "https://i.pravatar.cc/150?img=45",
    text: "About 850ft if I remember correctly",
    timestamp: Date.now() - 1000 * 60 * 20,
    userColor: "#8b5cf6",
  },
  {
    id: "5",
    username: "mountain_goat",
    profilePicture: "https://i.pravatar.cc/150? img=33",
    text:  "Yeah somewhere around there.  The last mile really kicks",
    timestamp: Date.now() - 1000 * 60 * 18,
    userColor: "#10b981",
  },
  {
    id: "6",
    username: "endurance_athlete",
    profilePicture: "https://i.pravatar.cc/150? img=8",
    text: "Anyone hitting this tomorrow morning?  Looking for a group run",
    timestamp: Date.now() - 1000 * 60 * 10,
    userColor: "#ef4444",
  },
  {
    id: "7",
    username: "trailrunner_sam",
    profilePicture: "https://i.pravatar.cc/150?img=12",
    text: "I might be down!  What time? ",
    timestamp: Date.now() - 1000 * 60 * 8,
    userColor: "#3b82f6",
  },
  {
    id: "8",
    username: "endurance_athlete",
    profilePicture: "https://i.pravatar.cc/150?img=8",
    text: "Thinking 6: 30am at the trailhead. Beat the heat 🌅",
    timestamp: Date.now() - 1000 * 60 * 5,
    userColor: "#ef4444",
  },
  {
    id: "9",
    username: "ultrapacer",
    text: "Count me in! Need to work on my climbing",
    timestamp: Date.now() - 1000 * 60 * 3,
    userColor: "#f59e0b",
  },
  {
    id: "10",
    username: "summit_seeker",
    profilePicture: "https://i.pravatar.cc/150? img=28",
    text: "The current KOM holder is insane. Sub-20 on this segment is wild 💪",
    timestamp: Date.now() - 1000 * 60 * 1,
    userColor: "#06b6d4",
  },
];

export default function SegmentChat({ segmentId, className = "" }: SegmentChatProps) {
  const { theme } = useTheme();
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef. current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username: user?.preferred_username || "guest",
      profilePicture:  user?.picture,
      text: inputValue. trim(),
      timestamp: Date. now(),
      userColor: "#3b82f6",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math. floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const cleanUrl = (url: string) => url.replace(/[.,;:!?)\]\}]+$/, "");

  const bg = theme === "dark" ? "bg-gray-800" : "bg-white";
  const border = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const textColor = theme === "dark" ?  "text-gray-100" : "text-gray-900";
  const mutedText = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const inputBg = theme === "dark" ? "bg-gray-700" : "bg-gray-50";
  const hoverBg = theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50";

  return (
    <div className={`flex flex-col ${bg} border ${border} rounded-lg ${className}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${border} flex items-center gap-2`}>
        <i className="pi pi-comments text-xl" />
        <h3 className={`font-semibold ${textColor}`}>Segment Chat</h3>
        <span className={`ml-auto text-sm ${mutedText}`}>
          {messages.length} {messages.length === 1 ?  "message" : "messages"}
        </span>
      </div>

      {/* Messages Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ minHeight: "300px", maxHeight: "500px" }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${hoverBg} rounded-lg p-2 transition-colors`}>
            {/* Avatar */}
            <div className="flex-shrink-0">
              {msg.profilePicture ?  (
                <Avatar
                  image={msg.profilePicture}
                  shape="circle"
                  size="normal"
                  className="w-8 h-8"
                />
              ) : (
                <Avatar
                  label={msg.username. charAt(0).toUpperCase()}
                  shape="circle"
                  size="normal"
                  className="w-8 h-8"
                  style={{ backgroundColor: msg.userColor || "#6b7280" }}
                />
              )}
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className="font-semibold text-sm"
                  style={{ color: msg.userColor || (theme === "dark" ? "#e5e7eb" : "#1f2937") }}
                >
                  {msg.username}
                </span>
                <span className={`text-xs ${mutedText}`}>{formatTimestamp(msg.timestamp)}</span>
              </div>

              <p className={`text-sm ${textColor} break-words`}>
                {msg.text. split(urlRegex).map((part, index) =>
                  urlRegex.test(part) ? (
                    <a
                      key={index}
                      href={cleanUrl(part)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {cleanUrl(part)}
                    </a>
                  ) : (
                    part
                  )
                )}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-3 border-t ${border}`}>
        {user ?  (
          <div className="flex gap-2">
            <InputText
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && ! e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Send a message..."
              className={`flex-1 ${inputBg}`}
            />
            <Button
              icon="pi pi-send"
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-button-primary"
            />
          </div>
        ) : (
          <div className={`text-center py-3 ${mutedText} text-sm`}>
            <a href="/login" className="text-blue-500 hover:underline">
              Log in
            </a>{" "}
            to join the conversation
          </div>
        )}
      </div>
    </div>
  );
}