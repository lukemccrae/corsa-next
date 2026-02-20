'use client'
import React from "react";
import { Editor } from "primereact/editor";
import { Button } from "primereact/button";
export default function BlogEditorPage() {
  const [content, setContent] = React.useState("");
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-semibold mb-4">Write a Blog Post</h2>
      <Editor value={content} onTextChange={e => setContent(e.htmlValue)} style={{height: '320px'}} />
      <div className="mt-4 flex gap-2">
        <Button label="Save Draft" icon="pi pi-save" />
        <Button label="Publish" icon="pi pi-upload" />
      </div>
    </div>
  );
}