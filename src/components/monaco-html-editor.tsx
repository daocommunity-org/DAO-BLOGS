"use client";

import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { BlogContentRenderer } from "./blog-content-renderer";
import { Button } from "./ui/button";
import {
  Workflow,
  Layout,
  Heading2,
  Code2,
  Columns2,
  Eye,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface MonacoHtmlEditorProps {
  value: string;
  onChange: (val: string) => void;
  minHeight?: string;
}

export function MonacoHtmlEditor({
  value,
  onChange,
  minHeight = "560px",
}: MonacoHtmlEditorProps) {
  const [viewMode, setViewMode] = useState<"split" | "editor" | "preview">("split");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<any>(null);

  const insertSnippet = (snippet: string) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const selection = editor.getSelection();
      if (selection) {
        editor.executeEdits("snippet-insert", [
          { range: selection, text: snippet, forceMoveMarkers: true },
        ]);
        editor.focus();
        return;
      }
    }
    onChange(value ? `${value}\n\n${snippet}` : snippet);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so re-selecting same file triggers change
    e.target.value = "";

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "dao-blogs/content");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image");
      }

      const imgTag = `<img src="${data.url}" alt="Article graphic" class="w-full max-h-[500px] object-cover rounded-xl border border-border my-6" />`;
      insertSnippet(imgTag);
      toast.success("Image uploaded and inserted into article!");
    } catch (err: any) {
      console.error("Editor image upload error:", err);
      toast.error(err.message || "Failed to upload image to Cloudinary.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const mermaidSample = `<pre class="mermaid">
graph LR
  A[Concept] --> B[Prototype]
  B --> C[Community Review]
  C --> D[Launch]
</pre>`;

  const cardSample = `<div class="p-6 bg-card border border-border/70 rounded-xl my-4">
  <h3 class="text-xl font-semibold text-primary mb-2">Featured Guild</h3>
  <p class="text-muted-foreground text-sm">Build decentralized protocols with our developer community.</p>
</div>`;

  return (
    <div className="flex flex-col border border-border/80 rounded-xl overflow-hidden bg-card/60">
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card/90 border-b border-border/70">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground mr-1">
            Quick Insert:
          </span>
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={isUploadingImage}
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 text-xs cursor-pointer border-primary/40 hover:border-primary text-primary"
            title="Upload image to Cloudinary and insert into article"
          >
            {isUploadingImage ? (
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
            ) : (
              <ImageIcon className="w-3 h-3 text-primary" />
            )}
            {isUploadingImage ? "Uploading..." : "+ Upload Image"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => insertSnippet(mermaidSample)}
            className="gap-1.5 text-xs cursor-pointer"
          >
            <Workflow className="w-3 h-3 text-primary" />
            + Mermaid Chart
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => insertSnippet(cardSample)}
            className="gap-1.5 text-xs cursor-pointer"
          >
            <Layout className="w-3 h-3 text-primary" />
            + Tailwind Card
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() =>
              insertSnippet(
                '<h2 class="text-2xl font-semibold text-foreground mt-8 mb-4">Section Heading</h2>\n<p class="text-muted-foreground leading-relaxed mb-4">\n  Add detailed analysis and documentation here.\n</p>'
              )
            }
            className="gap-1.5 text-xs cursor-pointer"
          >
            <Heading2 className="w-3 h-3 text-primary" />
            + Section Heading
          </Button>
        </div>

        {/* View Mode Controls */}
        <div className="inline-flex p-1 rounded-lg border border-border/70 bg-background/80 text-xs">
          <button
            type="button"
            onClick={() => setViewMode("editor")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === "editor"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="w-3 h-3" />
            Code
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === "split"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Columns2 className="w-3 h-3" />
            Split
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === "preview"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="w-3 h-3" />
            Preview
          </button>
        </div>
      </div>

      {/* Editor & Preview Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/70">
        {(viewMode === "editor" || viewMode === "split") && (
          <div
            style={{ minHeight }}
            className={`h-full ${viewMode === "editor" ? "col-span-2" : ""}`}
          >
            <Editor
              height={minHeight}
              defaultLanguage="html"
              theme="vs-dark"
              value={value}
              onMount={(editor) => {
                editorRef.current = editor;
              }}
              onChange={(val) => onChange(val || "")}
              options={{
                minimap: { enabled: false },
                wordWrap: "on",
                fontSize: 13,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 14, bottom: 14 },
                fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
              }}
            />
          </div>
        )}

        {(viewMode === "preview" || viewMode === "split") && (
          <div
            style={{ minHeight }}
            className={`p-6 sm:p-8 overflow-y-auto bg-background/60 ${
              viewMode === "preview" ? "col-span-2" : ""
            }`}
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground mb-6 pb-2.5 border-b border-border/50">
              <span>Live Rendered Output</span>
              <span className="text-[10px] text-primary">Compiled HTML & Diagrams</span>
            </div>
            {value.trim() ? (
              <div className="w-full">
                <BlogContentRenderer content={value} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic py-8 text-center">
                Start typing HTML or Mermaid code on the left to view compiled output in real-time...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
