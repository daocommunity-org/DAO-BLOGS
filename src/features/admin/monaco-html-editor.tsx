"use client";

import { useState, useRef, type Dispatch, type SetStateAction } from "react";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { BlogContentRenderer } from "@/features/admin/blog-content-renderer";
import { Button } from "@/components/ui/button";
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

const viewModes = [
  { value: "editor", label: "Code", icon: Code2 },
  { value: "split", label: "Split", icon: Columns2 },
  { value: "preview", label: "Preview", icon: Eye },
] as const;

const workspaceTheme = "dao-workspace";
const defineWorkspaceTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme(workspaceTheme, {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": "#121c2c",
      "editorGutter.background": "#121c2c",
      "editorLineNumber.foreground": "#8596af",
      "editorLineNumber.activeForeground": "#e2e8f0",
      "editor.lineHighlightBackground": "#1c2b40",
      "editor.lineHighlightBorder": "#1c2b40",
      "editor.selectionBackground": "#264a6d",
      "editorCursor.foreground": "#7dd3fc",
    },
  });
};

interface MonacoHtmlEditorProps {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
  readOnly: boolean;
  isUploadingImage: boolean;
  onUploadingChange: (isUploading: boolean) => void;
}

export function MonacoHtmlEditor({
  value,
  onChange,
  readOnly,
  isUploadingImage,
  onUploadingChange,
}: MonacoHtmlEditorProps) {
  const [viewMode, setViewMode] = useState<(typeof viewModes)[number]["value"]>("split");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

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
    onChange((current) => current ? `${current}\n\n${snippet}` : snippet);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || readOnly || isUploadingImage) return;

    e.target.value = "";
    onUploadingChange(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "dao-blogs/content");

      const res = await fetch("/api/admin/upload", {
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
    } catch (err) {
      console.error("Editor image upload error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to upload image to Cloudinary.");
    } finally {
      onUploadingChange(false);
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

  const headingSample = `<h2 class="text-2xl font-semibold text-foreground mt-8 mb-4">Section Heading</h2>
<p class="text-muted-foreground leading-relaxed mb-4">Add detailed analysis and documentation here.</p>`;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

      {/* Clean toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/60 bg-[#162238]/60 px-4 py-2">
        <div role="group" aria-label="Insert content" className="flex items-center gap-1 sm:gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={readOnly || isUploadingImage}
            onClick={() => fileInputRef.current?.click()}
            className="h-8 gap-1.5 px-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white"
            title="Upload and insert an image"
          >
            {isUploadingImage ? (
              <Loader2 aria-hidden="true" className="size-3.5 motion-safe:animate-spin" />
            ) : (
              <ImageIcon aria-hidden="true" className="size-3.5 text-slate-400" />
            )}
            <span>{isUploadingImage ? "Uploading…" : "Image"}</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={readOnly}
            onClick={() => insertSnippet(mermaidSample)}
            className="h-8 gap-1.5 px-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white"
            title="Insert a Mermaid diagram"
          >
            <Workflow aria-hidden="true" className="size-3.5 text-slate-400" />
            <span>Diagram</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={readOnly}
            onClick={() => insertSnippet(cardSample)}
            className="h-8 gap-1.5 px-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white"
            title="Insert a Tailwind card"
          >
            <Layout aria-hidden="true" className="size-3.5 text-slate-400" />
            <span>Card</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={readOnly}
            onClick={() => insertSnippet(headingSample)}
            className="h-8 gap-1.5 px-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white"
            title="Insert a section heading"
          >
            <Heading2 aria-hidden="true" className="size-3.5 text-slate-400" />
            <span>Heading</span>
          </Button>
        </div>

        {/* View mode toggle */}
        <div role="group" aria-label="Editor view" className="flex items-center rounded-lg border border-border/60 bg-background/60 p-0.5">
          {viewModes.map(({ value: mode, label, icon: Icon }) => (
            <button
              key={mode}
              type="button"
              aria-pressed={viewMode === mode}
              onClick={() => setViewMode(mode)}
              className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors ${
                viewMode === mode
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon aria-hidden="true" className="size-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Preview Workspace */}
      <div className={`grid min-h-0 flex-1 overflow-hidden ${
        viewMode === "split"
          ? "grid-rows-2 md:grid-cols-2 md:grid-rows-1"
          : "grid-cols-1 grid-rows-1"
      }`}>
        {(viewMode === "editor" || viewMode === "split") && (
          <section aria-label="Code editor" className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-[#121c2c]">
            <div className="min-h-0 flex-1">
              <Editor
                height="100%"
                defaultLanguage="html"
                theme={workspaceTheme}
                beforeMount={defineWorkspaceTheme}
                loading={<p role="status" className="p-4 text-xs text-slate-400">Loading code editor…</p>}
                value={value}
                onMount={(editor) => {
                  editorRef.current = editor;
                  editor.onDidDispose(() => {
                    if (editorRef.current === editor) editorRef.current = null;
                  });
                }}
                onChange={(val) => onChange(val || "")}
                options={{
                  minimap: { enabled: false },
                  wordWrap: "on",
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  readOnly,
                  ariaLabel: "HTML source code",
                  padding: { top: 16, bottom: 16 },
                  lineHeight: 22,
                  fontFamily: "var(--font-mono), ui-monospace, SFMono-Regular, Consolas, monospace",
                }}
              />
            </div>
          </section>
        )}

        {(viewMode === "preview" || viewMode === "split") && (
          <section
            aria-label="Live preview"
            className={`flex min-h-0 min-w-0 flex-col overflow-hidden bg-background ${
              viewMode === "split" ? "border-t border-border/50 md:border-t-0 md:border-l" : ""
            }`}
          >
            <div
              role="region"
              aria-label="Live preview"
              tabIndex={0}
              className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-12 sm:py-10 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] focus:outline-none"
            >
              {value.trim() ? (
                <div className="mx-auto w-full max-w-3xl">
                  <BlogContentRenderer content={value} />
                </div>
              ) : (
                <div className="flex h-full min-h-[16rem] items-center justify-center text-center">
                  <p className="text-sm text-slate-400">Write HTML in the editor to preview your article live.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
