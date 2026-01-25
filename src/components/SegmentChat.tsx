"use client";
import React, { useState, useRef, useEffect } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { useTheme } from "./ThemeProvider";
import { useUser } from "../context/UserContext";
import { useModal } from "./ModalProvider";
import { ChatMessage } from "../generated/schema";
import { generateClient } from "aws-amplify/api";
import { Amplify } from "aws-amplify";
import * as subscriptions from "../graphql/subscriptions";

type SegmentChatProps = {
  segmentId: string;
  className?: string;
};

export default function SegmentChat({
  segmentId,
  className = "",
}: SegmentChatProps) {
  const theme = "dark";
  const { user } = useUser();
  const { openLogin } = useModal();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const client = generateClient();

  const APPSYNC_ENDPOINT =
    process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT ||
    "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql";
  const APPSYNC_API_KEY =
    process.env.NEXT_PUBLIC_APPSYNC_API_KEY || "da2-5f7oqdwtvnfydbn226e6c2faga";

  // Extracted function to fetch messages (DRY principle)
  const fetchMessages = async () => {
    try {
      const response = await fetch(APPSYNC_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": APPSYNC_API_KEY,
        },
        body: JSON.stringify({
          query: `
          query MyQuery {
            getSegmentBySegmentId(segmentId: "${segmentId}") {
              chat {
                createdAt
                firstName
                lastName
                profilePicture
                streamId
                text
                userId
                username
              }
            }
          }
          `,
          variables: { segmentId },
        }),
      });

      const result = await response.json();
      console.log(result);
      if (result.data?.getSegmentBySegmentId?.chat) {
        setMessages(result.data.getSegmentBySegmentId.chat);
      }
    } catch (error) {
      console.error("Error fetching segment chat messages:", error);
    }
  };

  Amplify.configure({
    API: {
      GraphQL: {
        endpoint:
          "https://tuy3ixkamjcjpc5fzo2oqnnyym.appsync-api.us-west-1.amazonaws.com/graphql",
        region: "us-west-1",
        defaultAuthMode: "iam",
      },
    },
    Auth: {
      Cognito: {
        identityPoolId: "us-west-1:495addf9-156d-41fd-bf55-3c576a9e1c5e",
        allowGuestAccess: true,
      },
    },
  });

  useEffect(() => {
    if (segmentId) {
      const subscribe2Chat = client
        .graphql({
          query: subscriptions.onNewChat,
          variables: { streamId: segmentId },
        })
        .subscribe({
          next: ({ data }) => {
            handleReceivedComments(data.onNewChat);
          },
          error: (error) => console.warn("Chat subscription error:", error),
        });

      return () => {
        // Cleanup subscriptions
        if (subscribe2Chat) subscribe2Chat.unsubscribe();
      };
    }
  }, [segmentId]);

  const handleReceivedComments = (message: any) => {
    if (message.streamId && message.text) {
      setMessages((prevMessages) => [...prevMessages, message]);
    }
  };
  const onNewChat = /* GraphQL */ `
    subscription OnNewChat($streamId: ID!) {
      onNewChat(streamId: $streamId) {
        createdAt
        firstName
        lastName
        profilePicture
        streamId
        text
        userId
        username
      }
    }
  `;

  useEffect(() => {
    if (segmentId) {
      console.log("chat sub");
      let unsubscribe: (() => void) | undefined;

      (async () => {
        const { subscribe } = (await client.graphql({
          query: onNewChat,
          variables: { segmentId },
        })) as any;
        console.log(subscribe, "<< sub");

        unsubscribe = subscribe({
          next: ({ data }: { data: any }) => {
            handleReceivedComments(data.onNewChat);
          },
          error: ({ error }: { error: any }) =>
            console.warn("Chat subscription error:", error),
        });
      })();

      return () => {
        // Cleanup subscriptions
        if (unsubscribe) unsubscribe();
      };
    }
  }, [segmentId]);

  // Fetch initial messages when component mounts
  useEffect(() => {
    if (!segmentId) return;
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentId]);

  const handleSend = async () => {
    if (!inputValue.trim() || !user) return;

    setLoading(true);
    try {
      const response = await fetch(APPSYNC_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: user.idToken,
        },
        body: JSON.stringify({
          query: `
            mutation PublishChat($input: ChatMessageInput!) {
              publishChat(input: $input) {
                streamId
                username
                firstName
                lastName
                text
                createdAt
                profilePicture
                userId
              }
            }
          `,
          variables: {
            input: {
              streamId: segmentId,
              text: inputValue.trim(),
              userId: user["cognito:username"],
              username: user.preferred_username,
              firstName: user.given_name,
              lastName: user.family_name,
              createdAt: new Date().toISOString(),
              profilePicture: user.picture,
            },
          },
        }),
      });

      const result = await response.json();
      if (result.data?.publishChat) {
        setInputValue("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const cleanUrl = (url: string) => url.replace(/[.,;:!?)\]\}]+$/, "");

  const bg = theme === "dark" ? "bg-gray-800" : "bg-white";
  const border = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const textColor = theme === "dark" ? "text-gray-100" : "text-gray-900";
  const mutedText = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const inputBg = theme === "dark" ? "bg-gray-700" : "bg-gray-50";

  const USER_COLORS = [
    "#FF5C5C",
    "#4FC3F7",
    "#81C784",
    "#BA68C8",
    "#FFD54F",
    "#F06292",
    "#4DD0E1",
    "#AED581",
  ];

  function getUsernameColor(username: string) {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
  }

  return (
    <div
      className={`flex flex-col ${bg} border ${border} rounded-lg ${className} max-w-xl`}
    >
      {/* Header */}
      {/* <div className={`px-4 py-3 border-b ${border} flex items-center gap-2`}>
        <i className="pi pi-comments text-xl" />
        <h3 className={`font-semibold ${textColor}`}>Segment Chat</h3>
        <span className={`ml-auto text-sm ${mutedText}`}>
          {messages.length} {messages.length === 1 ? "message" : "messages"}
        </span>
      </div> */}

      {/* Messages Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ minHeight: "300px", maxHeight: "500px" }}
      >
        {messages.length === 0 ? (
          <div className={`text-center ${mutedText} py-2`}>
            Be the first to chat about this segment!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.createdAt}
              className="flex gap-2 text-sm leading-snug"
            >
              {/* Avatar column */}
              <div className="shrink-0 w-8 flex justify-center">
                {msg.profilePicture ? (
                  <Avatar
                    image={msg.profilePicture}
                    shape="circle"
                    className="w-12 h-12"
                  />
                ) : (
                  <Avatar
                    label={msg.username.charAt(0).toUpperCase()}
                    shape="circle"
                    className="w-12 h-12"
                  />
                )}
              </div>

              {/* Content column */}
              <div className="flex flex-col min-w-0">
                {/* Top line: username + badges */}
                <div className="flex items-center gap-2">
                  <span
                    className="font-semibold"
                    style={{ color: getUsernameColor(msg.username) }}
                  >
                    {msg.username}
                  </span>

                  {/* example badge */}
                  {/* {msg.isMod && (
                    <span className="text-xs bg-purple-600 text-white px-1.5 py-0.5 rounded">
                      MOD
                    </span>
                  )} */}
                </div>

                {/* Message body (wraps under username) */}
                <div className="text-gray-200 break-words">
                  {msg.text.split(urlRegex).map((part, index) =>
                    urlRegex.test(part) ? (
                      <a
                        key={index}
                        href={cleanUrl(part)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {cleanUrl(part)}
                      </a>
                    ) : (
                      part
                    ),
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-3 border-t ${border}`}>
        {user ? (
          <div className="flex gap-2">
            <InputTextarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Send a message..."
              className={`flex-1 resize-none ${inputBg}`}
              rows={2}
            />
            <Button
              icon="pi pi-send"
              onClick={handleSend}
              disabled={loading || !inputValue.trim()}
              className="p-button-primary self-end"
            />
          </div>
        ) : (
          <div className={`text-center py-3 ${mutedText} text-sm`}>
            <button
              type="button"
              onClick={openLogin}
              className="text-blue-500 hover:underline"
            >
              Log in
            </button>{" "}
            to join the conversation
          </div>
        )}
      </div>
    </div>
  );
}
