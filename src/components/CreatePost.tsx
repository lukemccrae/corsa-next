"use client";
import React, { useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { useUser } from "../context/UserContext";

/**
 * CreatePost — lets users compose a Blog, Photo, or Status.
 * Renders an editor tailored for each type.
 * 
 * Props:
 * - onPostCreate: (post) => void (optional, for passing up the new post)
 */
export default function CreatePost({ onPostCreate }: { onPostCreate?: (post: any) => void }) {
  const { user } = useUser();
  const [type, setType] = useState<"BLOG" | "PHOTO" | "STATUS">("BLOG");
  const [blogTitle, setBlogTitle] = useState("");
  const [blogText, setBlogText] = useState("");
  const [blogImage, setBlogImage] = useState<File | null>(null);

  const [photoCaption, setPhotoCaption] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [statusText, setStatusText] = useState("");

  function handleTypeChange(t: "BLOG" | "PHOTO" | "STATUS") {
    setType(t);
    // Clear form
    setBlogTitle("");
    setBlogText("");
    setBlogImage(null);
    setPhotoCaption("");
    setPhotoFile(null);
    setStatusText("");
  }

  function handleImageUpload(e: any, setter: (f: File | null) => void) {
    const file = e.files?.[0] ?? null;
    setter(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let post: any;
    if (type === "BLOG") {
      post = {
        type,
        title: blogTitle,
        text: blogText,
        image: blogImage,
      };
    } else if (type === "PHOTO") {
      post = {
        type,
        caption: photoCaption,
        image: photoFile,
      };
    } else if (type === "STATUS") {
      post = {
        type,
        text: statusText,
      };
    }
    onPostCreate?.(post);
    // TODO: integrate save API here
    // Clear form after
    handleTypeChange(type);
  }

  return (
    <Card className="mb-6 shadow border border-gray-100 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3 mb-4">
        <Button
          label="Blog"
          className={type === "BLOG" ? "p-button-primary" : "p-button-text"}
          onClick={() => handleTypeChange("BLOG")}
        />
        <Button
          label="Photo"
          className={type === "PHOTO" ? "p-button-primary" : "p-button-text"}
          onClick={() => handleTypeChange("PHOTO")}
        />
        <Button
          label="Status"
          className={type === "STATUS" ? "p-button-primary" : "p-button-text"}
          onClick={() => handleTypeChange("STATUS")}
        />
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {type === "BLOG" && (
          <>
            <InputText
              placeholder="Blog Title"
              value={blogTitle}
              onChange={e => setBlogTitle(e.currentTarget.value)}
              className="w-full"
            />
            <InputTextarea
              placeholder="Write your article..."
              value={blogText}
              onChange={e => setBlogText(e.currentTarget.value)}
              rows={5}
              className="w-full"
            />
            <div>
              <FileUpload
                mode="basic"
                accept="image/*"
                maxFileSize={2000000}
                auto
                chooseLabel="Attach Image"
                customUpload
                onSelect={e => handleImageUpload(e, setBlogImage)}
                className="w-full"
              />
              {blogImage && (
                <div className="mt-2 text-sm text-gray-600">
                  Attached: {blogImage.name}
                </div>
              )}
            </div>
          </>
        )}
        {type === "PHOTO" && (
          <>
            <FileUpload
              mode="basic"
              accept="image/*"
              maxFileSize={2000000}
              auto
              chooseLabel="Select Photo"
              customUpload
              onSelect={e => handleImageUpload(e, setPhotoFile)}
              className="w-full"
            />
            <InputText
              placeholder="Add a caption"
              value={photoCaption}
              onChange={e => setPhotoCaption(e.currentTarget.value)}
              className="w-full mt-2"
            />
            {photoFile && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {photoFile.name}
              </div>
            )}
          </>
        )}
        {type === "STATUS" && (
          <InputTextarea
            placeholder="What's happening?"
            value={statusText}
            onChange={e => setStatusText(e.currentTarget.value)}
            rows={2}
            className="w-full"
          />
        )}
        <div>
          <Button
            label="Post"
            icon="pi pi-send"
            type="submit"
            className="p-button-primary"
            disabled={
              (type === "BLOG" && !blogTitle && !blogText) ||
              (type === "PHOTO" && !photoFile) ||
              (type === "STATUS" && !statusText)
            }
          />
        </div>
      </form>
    </Card>
  );
}