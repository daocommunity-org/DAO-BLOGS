"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MonacoHtmlEditor } from "./monaco-html-editor";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  Save,
  Loader2,
  ExternalLink,
  Globe,
  FileText,
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
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/blogs/${blogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save content.");
      }
      toast.success("Content saved successfully.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save content.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh]">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-md shrink-0">
        <div className="max-w-full px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/admin/blogs/${blogId}/edit`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Metadata</span>
            </Link>
            <span className="text-border/60 select-none">·</span>
            <span className="text-sm font-medium text-foreground truncate max-w-[150px] sm:max-w-sm">
              {title || "Untitled Article"}
            </span>
            <Badge
              variant={status === "published" ? "default" : "secondary"}
              className="text-[10px] uppercase px-1.5 py-0 shrink-0"
            >
              {status}
            </Badge>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            {status === "published" && (
              <Link href={`/blogs/${slug}`} target="_blank">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer h-8 px-2.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">View Live</span>
                </Button>
              </Link>
            )}

            <Link href={`/admin/blogs/${blogId}/edit`}>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs font-medium cursor-pointer h-8 px-3"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Metadata</span>
              </Button>
            </Link>

            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-1.5 text-xs font-semibold cursor-pointer h-8 px-4 justify-center shrink-0"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{isSaving ? "Saving..." : "Save Content"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Monaco editor fills the rest */}
      <div className="flex-1 min-h-0">
        <MonacoHtmlEditor
          value={content}
          onChange={(val) => setContent(val)}
          minHeight="100%"
        />
      </div>
    </div>
  );
}
