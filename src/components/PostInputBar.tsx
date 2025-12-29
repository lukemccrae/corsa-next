"use client";
import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { useTheme } from "./ThemeProvider";
import { useUser } from "../context/UserContext";

type Props = {
  placeholder?: string;
  onPost?: (value: string) => void;
};

export default function PostInputBar({ placeholder, onPost }: Props) {
  const { user } = useUser();
  const { theme } = useTheme();
  const [value, setValue] = useState("");

  const bg = theme === "dark"
    ? "bg-gray-800 text-white"
    : "bg-white text-black";
  const border = theme === "dark"
    ? "border border-gray-700"
    : "border border-gray-200";
  const inputBg = theme === "dark"
    ? "bg-gray-700 text-white placeholder-gray-400"
    : "bg-gray-100 text-gray-800 placeholder-gray-500";

  return (
    <div className={`flex items-center gap-2 rounded-xl p-2 ${bg} ${border} w-full`}>
      <Avatar
        image={user?.picture}
        label={!user?.picture && user?.preferred_username ? user.preferred_username.charAt(0).toUpperCase() : undefined}
        shape="circle"
        size="large"
        className="!w-10 !h-10"
      />
      <InputText
        className={`flex-1 px-4 py-2 rounded-full outline-none border-none focus:ring-0 focus:outline-none ${inputBg}`}
        placeholder={placeholder ?? `What's on your mind, ${user?.preferred_username}?`}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && value.trim()) {
            onPost?.(value.trim());
            setValue("");
          }
        }}
      />
    </div>
  );
}