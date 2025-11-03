'use client';
import React, { useEffect, useRef, useState } from "react";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { useUser } from "../context/UserContext";
import { useModal } from "./ModalProvider";

type ChatMessage = {
  id: string;
  username: string;
  text: string;
  createdAt: string;
  profilePicture?: string | null;
};

export default function LiveChat({
  streamUsername,
  initialMessages = [],
}: {
  streamUsername: string;
  initialMessages?: ChatMessage[];
}) {
  const { user } = useUser();
  const { openLogin } = useModal();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const nowIso = () => new Date().toISOString();

  const sendMessage = () => {
    if (!text.trim()) return;

    const sender = user
      ? {
          username: user.preferred_username ?? "you",
          profilePicture: user.picture ?? undefined,
        }
      : { username: "guest", profilePicture: undefined };

    const msg: ChatMessage = {
      id: String(Date.now()),
      username: sender.username,
      profilePicture: sender.profilePicture ?? null,
      text: text.trim(),
      createdAt: nowIso(),
    };

    // append locally (no fetch)
    setMessages((m) => [...m, msg]);
    setText("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b dark:border-white/6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Live Chat</h3>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Chat for {streamUsername}
          </div>
        </div>
        <div className="text-xs text-gray-400">{messages.length} messages</div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3 bg-white dark:bg-gray-800">
        {messages.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-12">
            No messages yet — be the first to say hi!
          </div>
        ) : (
          messages.map((m) => {
            const mine = user && m.username === user.preferred_username;
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${mine ? "justify-end" : "justify-start"}`}
              >
                {!mine && (
                  <Avatar
                    image={m.profilePicture ?? undefined}
                    label={!m.profilePicture ? m.username?.charAt(0).toUpperCase() : undefined}
                    shape="circle"
                    size="normal"
                    className="!w-8 !h-8 flex-shrink-0"
                  />
                )}

                <div
                  className={`max-w-[78%] break-words ${
                    mine ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block px-3 py-2 rounded-lg text-sm ${
                      mine
                        ? "bg-violet-500 text-white rounded-br-none"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
                    }`}
                  >
                    <div className="font-medium text-xs mb-1">
                      {m.username}
                      <span className="ml-2 text-xs text-gray-400 font-normal">
                        {new Date(m.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div>{m.text}</div>
                  </div>
                </div>

                {mine && (
                  <Avatar
                    image={m.profilePicture ?? undefined}
                    label={!m.profilePicture ? m.username?.charAt(0).toUpperCase() : undefined}
                    shape="circle"
                    size="normal"
                    className="!w-8 !h-8 flex-shrink-0"
                  />
                )}
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t dark:border-white/6 bg-white dark:bg-gray-900">
        {user ? (
          <div className="flex gap-2 items-end">
            <InputTextarea
              value={text}
              onChange={(e) => setText(e.currentTarget.value)}
              rows={2}
              placeholder="Write a message..."
              className="flex-1 resize-none"
            />
            <Button
              label="Send"
              onClick={sendMessage}
              disabled={!text.trim()}
              className="whitespace-nowrap"
            />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-500">Sign in to participate in chat.</div>
            <div>
              <Button label="Sign In" className="p-button-text" onClick={openLogin} />
              {/* <Button
                label="Post as Guest"
                onClick={() => {
                  if (!text.trim()) {
                    setText("Hey — checking out the stream!");
                  }
                  // send as guest immediately
                  const guestMsg: ChatMessage = {
                    id: String(Date.now()),
                    username: "Guest",
                    profilePicture: null,
                    text: text.trim() || "Hey — checking out the stream!",
                    createdAt: nowIso(),
                  };
                  setMessages((m) => [...m, guestMsg]);
                  setText("");
                }}
              /> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}