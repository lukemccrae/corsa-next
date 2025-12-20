"use client";
import React, { useEffect, useRef, useState } from "react";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { useUser } from "../context/UserContext";
import { useModal } from "./ModalProvider";
import { useTheme } from "./ThemeProvider";
import { ChatMessage } from "../generated/graphql";

type Props = {
  profileUsername: string; // the profile being viewed
  initialMessages: ChatMessage[];
};

export default function ProfileLiveChat({
  profileUsername,
  initialMessages,
}: Props) {
  const { user } = useUser();
  const { openLogin } = useModal();
  const { theme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
  setMessages(initialMessages);
}, [initialMessages]);

  const sendMessage = () => {
    if (!text.trim()) return;

    const sender = user
      ? {
          username: user.preferred_username ?? "you",
          profilePicture: user.picture ?? undefined,
        }
      : { username: "guest", profilePicture: undefined };

    const msg: ChatMessage = {
      messageId: `temp-${Date.now()}`,
      username: sender.username,
      profilePicture: sender.profilePicture ?? null,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((m) => [...m, msg]);
    setText("");
  };

  const cardBg =
    theme === "dark"
      ? "bg-gray-800 border border-white/6 text-gray-100"
      : "bg-white border border-gray-100 text-gray-900";

  const inputBg =
    theme === "dark"
      ? "bg-gray-700 text-white placeholder-gray-400"
      : "bg-gray-100 text-gray-800 placeholder-gray-500";

  return (
    <div className={`w-full ${cardBg} rounded-lg overflow-hidden`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-white/6">
        <h3 className="text-lg font-semibold">Live Chat</h3>
      </div>

      {/* Messages container */}
      <div className="px-4 py-3 max-h-96 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            Be the first to say hi!
          </div>
        ) : (
          messages.map((m) => {

            return (
              <div key={m.createdAt} className="flex gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <Avatar
                      image={m.profilePicture ?? undefined}
                      shape="circle"
                      size="normal"
                      className="w-8 h-8"
                    />
                </div>

                {/* Message content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-sm">{m.username}:</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm break-words">{m.text}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-white/6">
        {user ? (
          <div className="flex gap-2">
            <InputTextarea
              value={text}
              onChange={(e) => setText(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              rows={2}
              placeholder="Write a comment..."
              className={`flex-1 resize-none ${inputBg}`}
            />
            <Button
              icon="pi pi-send"
              onClick={sendMessage}
              disabled={!text.trim()}
              className="self-end"
              aria-label="Send message"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <button
              type="button"
              onClick={openLogin}
              className="underline font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign in
            </button>
            <span>
              to post comments, interact with others, and stay updated.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
