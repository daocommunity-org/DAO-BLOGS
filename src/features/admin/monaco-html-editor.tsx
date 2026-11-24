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

const insertButtonClass = "h-8 min-w-0 gap-1 px-0 text-[11px] text-slate-200 enabled:cursor-pointer sm:gap-1.5 sm:px-2.5 sm:text-xs";
const paneHeaderClass = "flex h-9 shrink-0 items-center justify-between gap-2 border-b border-border/50 bg-card px-3 sm:px-4";

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

    // Reset input so re-selecting same file triggers change
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/75 bg-card shadow-lg shadow-slate-950/15">
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border/65 bg-card px-2 py-2 sm:px-3">
        <div role="group" aria-label="Insert content" className="grid w-full grid-cols-4 items-center gap-1 sm:flex sm:w-auto sm:flex-wrap">
          <span aria-hidden="true" className="mr-1 hidden text-xs font-medium text-slate-400 lg:inline">Insert</span>
          <Button type="button" variant="ghost" size="sm" disabled={readOnly || isUploadingImage}
            onClick={() => fileInputRef.current?.click()} className={insertButtonClass} title="Upload and insert an image">
            {isUploadingImage
              ? <Loader2 aria-hidden="true" className="size-3.5 motion-safe:animate-spin" />
              : <ImageIcon aria-hidden="true" className="size-3.5 text-sky-300" />}
            {isUploadingImage ? "Uploading…" : "Image"}
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={readOnly}
            onClick={() => insertSnippet(mermaidSample)} className={insertButtonClass} title="Insert a Mermaid diagram">
            <Workflow aria-hidden="true" className="size-3.5 text-sky-300" />
            Diagram
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={readOnly}
            onClick={() => insertSnippet(cardSample)} className={insertButtonClass} title="Insert a Tailwind card">
            <Layout aria-hidden="true" className="size-3.5 text-sky-300" />
            Card
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled={readOnly}
            onClick={() => insertSnippet(headingSample)} className={insertButtonClass} title="Insert a section heading">
            <Heading2 aria-hidden="true" className="size-3.5 text-sky-300" />
            Heading
          </Button>
        </div>

        <div role="group" aria-label="Editor view" className="inline-flex rounded-lg border border-border/60 bg-slate-950/25 p-0.5">
          {viewModes.map(({ value: mode, label, icon: Icon }) => (
            <Button key={mode} type="button" variant="ghost" size="sm" aria-pressed={viewMode === mode}
              onClick={() => setViewMode(mode)}
              className="h-8 cursor-pointer gap-1.5 rounded-md px-2.5 text-xs text-slate-300 aria-pressed:border-sky-300/25 aria-pressed:bg-sky-300/10 aria-pressed:text-sky-100">
              <Icon aria-hidden="true" className="size-3.5" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className={`grid min-h-0 flex-1 grid-cols-1 overflow-hidden divide-border/70 ${
        viewMode === "split"
          ? "grid-rows-2 divide-y md:grid-cols-2 md:grid-rows-1 md:divide-x md:divide-y-0"
          : "grid-rows-1"
      }`}>
        {(viewMode === "editor" || viewMode === "split") && (
          <section aria-label="Code panel" className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-[#121c2c]">
            <div className={paneHeaderClass}>
              <h2 className="flex items-center gap-2 text-xs font-semibold text-slate-100">
                <Code2 aria-hidden="true" className="size-3.5 text-slate-400" />
                Source code
              </h2>
              <span className="font-[ui-monospace,monospace] text-[11px] text-slate-400">HTML</span>
            </div>
            <div className="min-h-0 flex-1">
              <Editor
                height="100%"
                defaultLanguage="html"
                theme={workspaceTheme}
                beforeMount={defineWorkspaceTheme}
                loading={<p role="status" className="text-xs text-slate-300">Loading code editor…</p>}
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
                  padding: { top: 14, bottom: 14 },
                  lineHeight: 21,
                  fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
                }}
              />
            </div>
          </section>
        )}

        {(viewMode === "preview" || viewMode === "split") && (
          <section className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-background">
            <div className={paneHeaderClass}>
              <h2 className="flex items-center gap-2 text-xs font-semibold text-slate-100">
                <Eye aria-hidden="true" className="size-3.5 text-slate-400" />
                Live preview
              </h2>
              <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-300" />
            </div>
            <div
              role="region"
              aria-label="Live preview"
              tabIndex={0}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary sm:px-8 sm:py-6"
            >
              {value.trim() ? (
                <div className="mx-auto w-full max-w-3xl">
                  <BlogContentRenderer content={value} />
                </div>
              ) : (
                <div className="mx-auto grid max-w-xs justify-items-center gap-2 py-5 text-center sm:py-10">
                  <Eye aria-hidden="true" className="mb-1 size-5 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-200">No content to preview</p>
                  <p className="text-xs leading-5 text-slate-300">Add HTML in the code editor or insert a snippet from the toolbar.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
