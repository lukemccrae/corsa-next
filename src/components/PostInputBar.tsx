"use client";
import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { useTheme } from "./ThemeProvider";
import { useUser } from "../context/UserContext";
import CreateBlogModal from "./CreateBlogModal";

type Props = {
  placeholder?: string;
  onPost?:  (value: string) => void;
  onBlogPublish?: (blog: {
    title: string;
    content:  string;
    coverImage?: string;
    tags: string[];
  }) => void;
};

export default function PostInputBar({ placeholder, onPost, onBlogPublish }: Props) {
  const { user } = useUser();
  const { theme } = useTheme();
  const [value, setValue] = useState("");
  const [blogModalVisible, setBlogModalVisible] = useState(false);

  const bg = theme === "dark"
    ? "bg-gray-800 text-white"
    : "bg-white text-black";
  const border = theme === "dark"
    ? "border border-gray-700"
    :  "border border-gray-200";
  const inputBg = theme === "dark"
    ? "bg-gray-700 text-white placeholder-gray-400"
    :  "bg-gray-100 text-gray-800 placeholder-gray-500";

  const handleQuickPost = () => {
    if (value.trim()) {
      onPost?.(value.trim());
      setValue("");
    }
  };

  return (
    <>
      <div className={`flex flex-col gap-3 p-4 rounded-lg ${bg} ${border}`}>
        {/* Main input row */}
        <div className="flex items-center gap-3">
          <Avatar
            image={user?.picture}
            icon={! user?. picture ? "pi pi-user" : undefined}
            shape="circle"
            size="large"
          />
          <InputText
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder || "What's on your mind?"}
            className={`flex-1 ${inputBg}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" && value.trim()) {
                handleQuickPost();
              }
            }}
          />
          <Button
            icon="pi pi-send"
            onClick={handleQuickPost}
            disabled={!value.trim()}
            rounded
            aria-label="Post"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            label="Photo"
            icon="pi pi-image"
            severity="secondary"
            outlined
            size="small"
            onClick={() => console.log("Photo post")}
          />
          <Button
            label="Blog"
            icon="pi pi-file-edit"
            severity="secondary"
            outlined
            size="small"
            onClick={() => setBlogModalVisible(true)}
          />
        </div>
      </div>

      {/* Blog creation modal */}
      <CreateBlogModal
        visible={blogModalVisible}
        onHide={() => setBlogModalVisible(false)}
        onPublish={(blog) => {
          onBlogPublish?.(blog);
          setBlogModalVisible(false);
        }}
      />
    </>
  );
}