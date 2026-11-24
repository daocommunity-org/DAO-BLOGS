"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MonacoHtmlEditor } from "@/features/admin/monaco-html-editor";
import { UnsavedChangesDialog, useUnsavedChanges } from "@/features/admin/unsaved-changes";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ArrowLeft,
  Save,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface BlogContentEditorProps {
  blogId: string;
  slug: string;
  title: string;
  status: "draft" | "published";
  initialContent: string;
}

export function BlogContentEditor({
  blogId,
  slug,
  title,
  status,
  initialContent,
}: BlogContentEditorProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [savedContent, setSavedContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [failedContent, setFailedContent] = useState<string>();
  const savingLock = useRef(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const isDirty = content !== savedContent;
  const guard = useUnsavedChanges(isDirty);
  const saveStatus = isSaving ? "Saving…" : failedContent === content
    ? "Save failed" : isDirty ? "Unsaved changes" : "All changes saved";
  const previewHref = status === "published" ? `/blogs/${slug}` : `/admin/blogs/${blogId}/preview`;

  const handleSave = async (refresh = true) => {
    if (savingLock.current || isUploadingImage) return false;
    if (!isDirty) return true;
    savingLock.current = true;
    setIsSaving(true);
    setFailedContent(undefined);
    try {
      const res = await fetch(`/api/admin/blogs/${blogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save content.");
      }
      setSavedContent(content);
      toast.success("Content saved successfully.");
      if (refresh) router.refresh();
      return true;
    } catch (error) {
      setFailedContent(content);
      toast.error(error instanceof Error ? error.message : "Failed to save content.");
      return false;
    } finally {
      savingLock.current = false;
      setIsSaving(false);
    }
  };

  return (
    <main className="flex h-dvh min-h-[32rem] flex-col bg-background">
      <header className="sticky top-0 z-20 shrink-0 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Link href={`/admin/blogs/${blogId}/edit`} aria-label="Back to article settings" title="Back to article settings"
              className={buttonVariants({ variant: "outline", size: "icon-lg", className: "border-border/80 text-slate-200" })}>
              <ArrowLeft aria-hidden="true" />
            </Link>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold tracking-tight sm:text-lg" title={title || undefined}>
                {title || "Untitled article"}
              </h1>
              <div className="mt-1 flex items-center gap-2 text-[11px] font-medium sm:gap-2.5">
                <span className={status === "published" ? "text-emerald-300" : "text-slate-300"}>
                  {status === "published" ? "Published" : "Draft"}
                </span>
                <span aria-hidden="true" className="h-3 border-l border-border" />
                <span role="status" className={failedContent === content ? "text-rose-300" : isDirty ? "text-amber-200" : "text-slate-300"}>
                  {saveStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link href={previewHref} target="_blank" rel="noreferrer"
              aria-label={status === "published" ? "View live article in a new tab" : "Preview saved draft in a new tab"}
              title={status === "published" ? "View live article" : "Preview saved draft"}
              className={buttonVariants({ variant: "outline", size: "lg", className: "size-9 border-border/80 text-slate-200 sm:w-auto sm:px-3" })}>
              <ExternalLink aria-hidden="true" />
              <span className="hidden sm:inline">{status === "published" ? "View live" : "Preview draft"}</span>
            </Link>
            <Button
              type="button"
              size="lg"
              onClick={() => void handleSave()}
              disabled={!isDirty || isSaving || isUploadingImage}
              aria-label="Save content"
              className="gap-1.5 px-2.5 text-xs font-semibold enabled:cursor-pointer disabled:border-border/70 disabled:bg-card disabled:text-slate-300 disabled:opacity-100 sm:px-3.5"
            >
              {isSaving ? (
                <Loader2 aria-hidden="true" className="size-3.5 motion-safe:animate-spin" />
              ) : (
                <Save aria-hidden="true" className="size-3.5" />
              )}
              <span>{isSaving ? "Saving…" : "Save"}<span className="hidden sm:inline">{!isSaving && " content"}</span></span>
            </Button>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 px-2 py-2 sm:px-6 sm:py-4">
        <MonacoHtmlEditor
          value={content}
          onChange={setContent}
          readOnly={isSaving}
          isUploadingImage={isUploadingImage}
          onUploadingChange={setIsUploadingImage}
        />
      </div>
      <UnsavedChangesDialog
        guard={guard}
        busy={isSaving || isUploadingImage}
        saving={isSaving}
        onSave={() => handleSave(false)}
      />
    </main>
  );
}
