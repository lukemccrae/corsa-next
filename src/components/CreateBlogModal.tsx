"use client";
import React, { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Editor } from "primereact/editor";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import { Chip } from "primereact/chip";
import { Toast } from "primereact/toast";
import { useTheme } from "./ThemeProvider";
import { useUser } from "../context/UserContext";

type CreateBlogModalProps = {
  visible: boolean;
  onHide: () => void;
  onPublish?:  (blog: {
    title: string;
    content: string;
    coverImage?: string;
    tags:  string[];
  }) => void;
};

export default function CreateBlogModal({
  visible,
  onHide,
  onPublish,
}: CreateBlogModalProps) {
  const { theme } = useTheme();
  const { user } = useUser();
  const toast = useRef<Toast>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [publishing, setPublishing] = useState(false);

  const reset = () => {
    setTitle("");
    setContent("");
    setCoverImage(null);
    setTags([]);
    setTagInput("");
    setPublishing(false);
  };

  const handleImageUpload = (e: any) => {
    const file = e.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event. target?.result as string);
      };
      reader.readAsDataURL(file);

      toast.current?.show({
        severity: "success",
        summary: "Image uploaded",
        detail: file.name,
        life: 1500,
      });
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([... tags, trimmed]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handlePublish = async () => {
    if (!title. trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Title required",
        detail: "Please enter a blog title",
        life: 2000,
      });
      return;
    }

    if (!content.trim() || content === "<p><br></p>") {
      toast.current?.show({
        severity: "warn",
        summary: "Content required",
        detail: "Please write some content",
        life: 2000,
      });
      return;
    }

    setPublishing(true);

    try {
      // TODO: Integrate with your backend API
      await onPublish?. ({
        title:  title.trim(),
        content,
        coverImage:  coverImage || undefined,
        tags,
      });

      toast.current?.show({
        severity: "success",
        summary: "Blog published! ",
        life: 1800,
      });

      setTimeout(() => {
        reset();
        onHide();
      }, 600);
    } catch (error) {
      console.error("Publish error:", error);
      toast.current?.show({
        severity: "error",
        summary: "Publish failed",
        detail: String(error),
        life: 3000,
      });
    } finally {
      setPublishing(false);
    }
  };

  const bg = theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900";
  const inputBg = theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200";
  const chipBg = theme === "dark" ? "bg-blue-900 text-blue-100" : "bg-blue-100 text-blue-900";

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between gap-2">
        <span className="ql-formats">
          <button className="ql-bold" aria-label="Bold"></button>
          <button className="ql-italic" aria-label="Italic"></button>
          <button className="ql-underline" aria-label="Underline"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-list" value="ordered" aria-label="Ordered List"></button>
          <button className="ql-list" value="bullet" aria-label="Bullet List"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-link" aria-label="Insert Link"></button>
          <button className="ql-image" aria-label="Insert Image"></button>
        </span>
        <span className="ql-formats">
          <button className="ql-blockquote" aria-label="Blockquote"></button>
          <button className="ql-code-block" aria-label="Code Block"></button>
        </span>
        <span className="ql-formats">
          <select className="ql-header" defaultValue="0">
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="0">Normal</option>
          </select>
        </span>
      </div>
    );
  };

  const footer = (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {content.replace(/<[^>]*>/g, "").length} characters
      </div>
      <div className="flex gap-2">
        <Button
          label="Cancel"
          severity="secondary"
          outlined
          onClick={() => {
            reset();
            onHide();
          }}
          disabled={publishing}
        />
        <Button
          label={publishing ? "Publishing..." : "Publish"}
          icon="pi pi-send"
          onClick={handlePublish}
          disabled={publishing}
        />
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Create Blog Post"
        visible={visible}
        onHide={() => {
          reset();
          onHide();
        }}
        modal
        dismissableMask={! publishing}
        style={{ width: "90vw", maxWidth: "900px" }}
        footer={footer}
        className={bg}
      >
        <div className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Title</label>
            <InputText
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your blog title..."
              className={`w-full text-2xl font-bold ${inputBg}`}
              disabled={publishing}
            />
          </div>

          {/* Cover Image */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Cover Image (optional)</label>
            {coverImage ?  (
              <div className="relative">
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  icon="pi pi-times"
                  rounded
                  severity="danger"
                  className="absolute top-2 right-2"
                  onClick={() => setCoverImage(null)}
                  disabled={publishing}
                  aria-label="Remove cover image"
                />
              </div>
            ) : (
              <FileUpload
                mode="basic"
                accept="image/*"
                maxFileSize={5000000}
                onSelect={handleImageUpload}
                auto
                chooseLabel="Choose Cover Image"
                className="w-full"
                disabled={publishing}
              />
            )}
          </div>

          {/* Content Editor */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Content</label>
            <Editor
              value={content}
              onTextChange={(e) => setContent(e.htmlValue || "")}
              style={{ height: "400px" }}
              headerTemplate={renderHeader()}
              disabled={publishing}
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex gap-2">
              <InputText
                value={tagInput}
                onChange={(e) => setTagInput(e.target. value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tag and press Enter..."
                className="flex-1"
                disabled={publishing}
              />
              <Button
                icon="pi pi-plus"
                onClick={addTag}
                disabled={! tagInput.trim() || publishing}
                aria-label="Add tag"
              />
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    removable
                    onRemove={() => removeTag(tag)}
                    className={chipBg}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Author info */}
          {user && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <i className="pi pi-user text-gray-500" />
              <span className="text-sm">
                Publishing as <strong>@{user. preferred_username}</strong>
              </span>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}