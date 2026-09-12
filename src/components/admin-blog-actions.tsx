"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Edit, ExternalLink, Trash2, Globe, FileText, Loader2, BarChart3 } from "lucide-react";
import { toast } from "sonner";

interface AdminBlogActionsProps {
  blogId: string;
  slug: string;
  title: string;
  status: "draft" | "published";
}

export function AdminBlogActions({
  blogId,
  slug,
  title,
  status,
}: AdminBlogActionsProps) {
  const router = useRouter();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const nextStatus = status === "published" ? "draft" : "published";

  const handleToggleStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/blogs/${blogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update blog status");
      }

      toast.success(
        nextStatus === "published"
          ? "Blog post published to community."
          : "Blog reverted to draft status."
      );
      setStatusModalOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error("Status update error:", err);
      toast.error(err.message || "Failed to update blog status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/blogs/${blogId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete blog post");
      }

      toast.success("Blog post deleted successfully.");
      setDeleteModalOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete blog post");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 shrink-0 self-stretch sm:self-end md:self-center w-full sm:w-60 text-xs">
      {/* 2x2 Clean Action Grid */}
      <div className="grid grid-cols-2 gap-1.5 w-full">
        {/* 1. Analytics Link */}
        <Link
          href={`/admin/blogs/${blogId}/analytics`}
          className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-medium text-[11px] border border-primary/30 hover:border-primary/50 transition-all active:scale-[0.98]"
          title="View article analytics"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analytics</span>
        </Link>

        {/* 2. Edit Post */}
        <Link
          href={`/admin/blogs/${blogId}/edit`}
          className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-md bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground font-medium text-[11px] border border-border/40 hover:border-border transition-all active:scale-[0.98]"
          title="Edit post content"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Edit</span>
        </Link>

        {/* 3. View Article */}
        <Link
          href={`/blogs/${slug}`}
          target="_blank"
          className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-md bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground font-medium text-[11px] border border-border/30 hover:border-border transition-all active:scale-[0.98]"
          title="View live post"
        >
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          <span>View</span>
        </Link>

        {/* 4. Toggle Status (Publish / Draft) */}
        <AlertDialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
          <AlertDialogTrigger
            render={
              <button
                type="button"
                disabled={isUpdatingStatus || isDeleting}
                className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-md font-medium text-[11px] border border-border/40 hover:border-border bg-muted/20 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                title={nextStatus === "published" ? "Publish article" : "Revert to draft"}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : nextStatus === "published" ? (
                  <Globe className="w-3.5 h-3.5" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                <span>{nextStatus === "published" ? "Publish" : "Draft"}</span>
              </button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {nextStatus === "published"
                  ? "Publish blog post?"
                  : "Revert post to draft?"}
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2 pt-1">
                <span>
                  {nextStatus === "published"
                    ? `Are you sure you want to publish "${title}"? It will be immediately visible on the home feed to everyone.`
                    : `Are you sure you want to unpublish "${title}"? It will be hidden from the public feed and saved as a draft.`}
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isUpdatingStatus}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleToggleStatus}
                disabled={isUpdatingStatus}
                className="gap-1.5 cursor-pointer font-medium"
              >
                {isUpdatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isUpdatingStatus
                  ? "Updating..."
                  : nextStatus === "published"
                  ? "Confirm & Publish"
                  : "Confirm & Unpublish"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Full-width clean Delete trigger underneath */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogTrigger
          render={
            <button
              type="button"
              disabled={isDeleting || isUpdatingStatus}
              className="inline-flex items-center justify-center gap-1.5 h-7 w-full rounded-md bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/25 hover:border-destructive/40 transition-all font-medium text-[11px] cursor-pointer disabled:opacity-50 active:scale-[0.98]"
              title="Delete post"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Delete Article</span>
            </button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove &quot;{title}&quot; and all associated likes and comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5 cursor-pointer"
            >
              {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isDeleting ? "Deleting..." : "Confirm & Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
