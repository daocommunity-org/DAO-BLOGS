"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { BarChart3, ExternalLink, FileText, Globe, LoaderCircle, PenLine, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type BlogStatus = "draft" | "published";
type Action = "status" | "delete";

interface AdminBlogActionsProps {
  blogId: string;
  slug: string;
  title: string;
  status: BlogStatus;
  canEdit: boolean;
  canDelete: boolean;
}

const actionClass = "h-9 w-full gap-1.5 px-2 text-xs font-medium enabled:cursor-pointer";

export function AdminBlogActions({ blogId, slug, title, status, canEdit, canDelete }: AdminBlogActionsProps) {
  const router = useRouter();
  const [dialog, setDialog] = useState<Action>();
  const [pending, setPending] = useState<Action>();
  const [error, setError] = useState<string>();
  const [refreshing, refresh] = useTransition();
  const inFlight = useRef(false);
  const busy = !!pending || refreshing;
  const isPublished = status === "published";
  const isDelete = dialog === "delete";
  const basePath = `/admin/blogs/${blogId}`;
  const previewPath = isPublished ? `/blogs/${encodeURIComponent(slug)}` : `${basePath}/preview`;
  const statusLabel = isPublished ? "Unpublish" : "Publish";

  function openDialog(action: Action) {
    if (busy) return;
    setError(undefined);
    setDialog(action);
  }

  async function confirm() {
    if (!dialog || inFlight.current || busy || (isDelete ? !canDelete : !canEdit)) return;
    const action = dialog;
    const nextStatus: BlogStatus = isPublished ? "draft" : "published";
    const fallback = isDelete ? "Couldn’t delete the article. Try again." : "Couldn’t update the article status. Try again.";
    inFlight.current = true;
    setPending(action);
    setError(undefined);

    try {
      const response = await fetch(`/api${basePath}`, isDelete ? { method: "DELETE" } : {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success !== true) {
        throw new Error(response.status < 500 && typeof result?.error === "string" ? result.error : fallback);
      }

      setDialog(undefined);
      toast.success(isDelete ? "Article deleted." : nextStatus === "published" ? "Article published." : "Moved to drafts.");
      refresh(() => router.refresh());
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : fallback);
    } finally {
      inFlight.current = false;
      setPending(undefined);
    }
  }

  return (
    <div className="w-full space-y-2 sm:w-60" aria-busy={busy}>
      <div className="grid grid-cols-2 gap-1.5">
        <Link href={`${basePath}/analytics`} className={buttonVariants({ variant: "outline", className: actionClass })}
          aria-label={`Analytics for ${title}`}>
          <BarChart3 aria-hidden="true" className="size-3.5 text-primary" /> Analytics
        </Link>

        {canEdit ? (
          <Link href={`${basePath}/edit`} className={buttonVariants({ variant: "outline", className: actionClass })}
            aria-label={`Edit ${title}`}>
            <PenLine aria-hidden="true" className="size-3.5" /> Edit
          </Link>
        ) : (
          <Button type="button" disabled variant="outline" className={actionClass} title="Only the author and co-authors can edit">
            <PenLine aria-hidden="true" className="size-3.5" /> Edit
          </Button>
        )}

        <Link href={previewPath} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", className: actionClass })}
          aria-label={`${isPublished ? "View" : "Preview"} ${title}`}>
          <ExternalLink aria-hidden="true" className="size-3.5" /> {isPublished ? "View live" : "Preview"}
        </Link>

        <Button type="button" variant="outline" className={actionClass} disabled={busy || !canEdit}
          title={!canEdit ? "Only the author and co-authors can change publication status" : undefined}
          onClick={() => openDialog("status")}>
          {isPublished
            ? <FileText aria-hidden="true" className="size-3.5" />
            : <Globe aria-hidden="true" className="size-3.5" />}
          {statusLabel}
        </Button>
      </div>

      {canDelete ? (
        <Button type="button" variant="destructive" disabled={busy} className={actionClass}
          onClick={() => openDialog("delete")}>
          <Trash2 aria-hidden="true" className="size-3.5" /> Delete article
        </Button>
      ) : canEdit ? <p className="py-1 text-center text-xs text-slate-300">Co-author</p> : null}

      <AlertDialog open={!!dialog} onOpenChange={(open) => {
        if (!open && !inFlight.current) setDialog(undefined);
      }}>
        {dialog && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isDelete ? "Delete this article?" : isPublished ? "Move this article to drafts?" : "Publish this article?"}
              </AlertDialogTitle>
              <AlertDialogDescription className="wrap-anywhere">
                {isDelete
                  ? `“${title}” and its likes and comments will be permanently removed.`
                  : isPublished
                    ? `“${title}” will be removed from the public blog feed and saved as a draft.`
                    : `“${title}” will appear in the public blog feed.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {error && <p role="alert" className="rounded-md border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
              <AlertDialogAction type="button" disabled={busy} variant={isDelete ? "destructive" : "default"}
                className="h-9 gap-2 px-3 enabled:cursor-pointer" onClick={confirm}>
                {pending && <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />}
                {pending
                  ? (isDelete ? "Deleting…" : isPublished ? "Moving to draft…" : "Publishing…")
                  : isDelete ? "Delete article" : isPublished ? "Move to draft" : "Publish article"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </div>
  );
}
