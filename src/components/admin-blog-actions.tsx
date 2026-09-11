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
import { Edit, ExternalLink, Trash2, Globe, FileText, Loader2 } from "lucide-react";
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
    <div className="flex items-center gap-2 self-end md:self-center shrink-0 flex-wrap">
      {/* View Link */}
      <Link href={`/blogs/${slug}`} target="_blank">
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs cursor-pointer">
          <ExternalLink className="w-3.5 h-3.5" />
          View
        </Button>
      </Link>

      {/* Edit Link */}
      <Link href={`/admin/blogs/${blogId}/edit`}>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs cursor-pointer">
          <Edit className="w-3.5 h-3.5" />
          Edit
        </Button>
      </Link>

      {/* Toggle Status Modal Confirmation */}
      <AlertDialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <AlertDialogTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdatingStatus || isDeleting}
              className="gap-1.5 text-xs cursor-pointer"
            >
              {isUpdatingStatus ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : nextStatus === "published" ? (
                <Globe className="w-3.5 h-3.5 text-primary" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              {nextStatus === "published" ? "Publish" : "Unpublish"}
            </Button>
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

      {/* Delete Modal Confirmation */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              disabled={isDeleting || isUpdatingStatus}
              className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
              title="Delete post"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </Button>
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
