"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { MonacoHtmlEditor } from "./monaco-html-editor";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
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
import {
  ArrowLeft,
  Save,
  Trash2,
  Globe,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  X,
  ExternalLink,
  FileText,
  Hash,
  Compass,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface BlogData {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  content: string;
  status: "draft" | "published";
  createdAt?: string;
  author?: {
    name?: string;
    email?: string;
  };
}

interface BlogEditorFormProps {
  initialData?: BlogData;
  isEdit?: boolean;
}

export function BlogEditorForm({ initialData, isEdit = false }: BlogEditorFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!isEdit);
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [imageLoadError, setImageLoadError] = useState(false);
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(", ") || "");
  const [status, setStatus] = useState<"draft" | "published">(
    initialData?.status || "draft"
  );
  const [content, setContent] = useState(
    initialData?.content ||
      `<h2 class="text-2xl font-bold text-foreground mb-4">Introduction</h2>
<p class="text-muted-foreground leading-relaxed mb-4">
  Welcome to our club blog post. We are exploring decentralized tools and workflows.
</p>

<pre class="mermaid">
graph LR
  A[Concept] --> B[Prototype]
  B --> C[Community Review]
  C --> D[Launch]
</pre>

<div class="p-4 bg-muted/40 border border-border rounded-lg my-4">
  <p class="text-primary font-semibold">Pro tip: You can use any Tailwind CSS classes directly here!</p>
</div>`
  );

  const [savingAction, setSavingAction] = useState<"draft" | "published" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSaving = savingAction !== null;

  // Real-time metadata stats
  const { wordCount, readingTime, mermaidCount } = useMemo(() => {
    const textOnly = content.replace(/<[^>]*>/g, " ");
    const words = textOnly.trim().split(/\s+/).filter(Boolean).length;
    const time = Math.max(1, Math.ceil(words / 200));
    const mermaidMatches = content.match(/(?:<pre\s+class=["'](?:language-)?mermaid["']>)|(?:```mermaid)/gi);
    return {
      wordCount: words,
      readingTime: time,
      mermaidCount: mermaidMatches ? mermaidMatches.length : 0,
    };
  }, [content]);

  // Parsed tags list
  const tagsList = useMemo(() => {
    return tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);
  }, [tagsInput]);

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tagsList.filter((t) => t !== tagToRemove);
    setTagsInput(updated.join(", "));
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoSlug) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverImageChange = (val: string) => {
    setCoverImage(val);
    setImageLoadError(false);
  };

  const handleCoverUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "dao-blogs/covers");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload cover image");
      }

      setCoverImage(data.url);
      setImageLoadError(false);
      toast.success("Cover image uploaded to Cloudinary!");
    } catch (err: any) {
      console.error("Cover upload error:", err);
      toast.error(err.message || "Failed to upload cover image.");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Please enter an article title.");
      return false;
    }
    if (!slug.trim()) {
      toast.error("Please enter a valid URL slug.");
      return false;
    }
    if (!excerpt.trim()) {
      toast.error("Please enter an excerpt / summary.");
      return false;
    }
    if (!content.trim()) {
      toast.error("Article content cannot be empty.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSave = async (targetStatus?: "draft" | "published") => {
    const finalStatus = targetStatus || status;
    if (!validateForm()) return;

    setSavingAction(finalStatus);

    try {
      const url = isEdit
        ? `/api/blogs/${initialData?._id || slug}`
        : "/api/blogs";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim(),
          coverImage: coverImage.trim(),
          tags: tagsList,
          content,
          status: finalStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save blog post.");
      }

      setPublishDialogOpen(false);
      setStatus(finalStatus);
      toast.success(
        finalStatus === "published"
          ? "Article published live to the community!"
          : "Draft saved successfully."
      );

      setTimeout(() => {
        router.push("/admin/blogs");
        router.refresh();
      }, 600);
    } catch (err: any) {
      const errMsg = err.message || "An error occurred while saving.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setSavingAction(null);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/blogs/${initialData?._id || slug}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete post.");
      }

      toast.success("Article deleted permanently.");
      setTimeout(() => {
        router.push("/admin/blogs");
        router.refresh();
      }, 500);
    } catch (err: any) {
      const errMsg = err.message || "Failed to delete article.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* 1. Top Breadcrumb & Navigation */}
      <section className="w-full dashed-border-b">
        <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-4 dashed-border-x flex items-center justify-between">
          <Link
            href="/admin/blogs"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to all articles
          </Link>

          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            ADMIN // {isEdit ? `EDIT_${status.toUpperCase()}` : "NEW_ARTICLE"}
          </span>
        </div>
      </section>

      {/* 2. Header & Action Controls */}
      <header className="w-full dashed-border-b">
        <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-8 sm:py-10 dashed-border-x flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold">
                Article Editor
              </span>
              <Badge
                variant={status === "published" ? "default" : "secondary"}
                className="text-[10px] font-mono uppercase px-2 py-0"
              >
                {status}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground truncate">
              {title || (isEdit ? "Edit Article" : "Create New Article")}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              /blogs/{slug || "slug-placeholder"}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {/* View Live Post (if published) */}
            {isEdit && status === "published" && (
              <Link href={`/blogs/${slug}`} target="_blank">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Live
                </Button>
              </Link>
            )}

            {/* Delete Post Modal (Edit mode only) */}
            {isEdit && (
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isDeleting || isSaving}
                      className="gap-1.5 cursor-pointer text-xs"
                      title="Delete post"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  }
                />
                <AlertDialogContent size="md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete article permanently?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently remove &quot;{title || "this article"}&quot; and all associated comments and likes from the DAO database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5 cursor-pointer font-medium"
                    >
                      {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {isDeleting ? "Deleting..." : "Confirm & Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Dynamic Actions based on current status */}
            {status === "published" ? (
              <>
                {/* Published post: Option to unpublish / revert to draft */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSave("draft")}
                  disabled={isSaving || isDeleting}
                  className="gap-1.5 text-xs font-medium cursor-pointer"
                >
                  {savingAction === "draft" && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  )}
                  {savingAction === "draft" ? "Reverting..." : "Revert to Draft"}
                </Button>

                {/* Published post: Save Changes directly */}
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleSave("published")}
                  disabled={isSaving || isDeleting}
                  className="gap-1.5 text-xs font-semibold cursor-pointer"
                >
                  {savingAction === "published" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {savingAction === "published" ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <>
                {/* Draft post: Save Draft */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSave("draft")}
                  disabled={isSaving || isDeleting}
                  className="gap-1.5 text-xs font-medium cursor-pointer"
                >
                  {savingAction === "draft" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  {savingAction === "draft" ? "Saving..." : "Save Draft"}
                </Button>

                {/* Draft post: Publish Modal */}
                <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
                  <AlertDialogTrigger
                    render={
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (validateForm()) setPublishDialogOpen(true);
                        }}
                        disabled={isSaving || isDeleting}
                        className="gap-1.5 font-semibold text-xs cursor-pointer"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        Publish Article
                      </Button>
                    }
                  />
                  <AlertDialogContent size="md">
                    <AlertDialogHeader className="space-y-1.5">
                      <div className="flex items-center gap-2 text-primary text-xs font-mono font-semibold uppercase tracking-wider">
                        <Globe className="w-4 h-4" />
                        Community Publication
                      </div>
                      <AlertDialogTitle className="text-xl font-bold tracking-tight text-foreground">
                        Confirm Publication to DAO
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                        You are about to make this post live. It will be immediately published to the community feed and accessible to all DAO members.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    {/* Horizontal sleek preview card */}
                    <div className="flex items-center gap-4 p-3.5 rounded-xl border border-border/70 bg-[#162032]">
                      {coverImage && !imageLoadError ? (
                        <div className="w-24 h-16 rounded-lg overflow-hidden border border-border/50 shrink-0 bg-muted/30">
                          <img
                            src={coverImage}
                            alt={title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg border border-border/50 shrink-0 bg-muted/20 flex items-center justify-center text-muted-foreground">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="font-semibold text-foreground text-sm truncate">
                          {title || "Untitled Article"}
                        </div>
                        <div className="font-mono text-[11px] text-muted-foreground truncate">
                          /blogs/{slug || "slug"}
                        </div>
                        {excerpt && (
                          <div className="text-[11px] text-muted-foreground line-clamp-1">
                            {excerpt}
                          </div>
                        )}
                      </div>
                    </div>

                    <AlertDialogFooter className="pt-2">
                      <AlertDialogCancel disabled={isSaving}>Keep as Draft</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleSave("published")}
                        disabled={isSaving}
                        className="gap-1.5 font-medium cursor-pointer"
                      >
                        {savingAction === "published" && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        )}
                        {savingAction === "published" ? "Publishing..." : "Confirm & Publish"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <section className="w-full dashed-border-b bg-destructive/10">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-3 dashed-border-x flex items-center gap-2 text-destructive text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        </section>
      )}

      {/* 3. Metadata & Media 2-Column Grid */}
      <section className="w-full dashed-border-b">
        <div className="max-w-6xl w-full mx-auto dashed-border-x grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Article Parameters */}
          <div className="p-6 sm:p-10 md:dashed-border-r max-md:dashed-border-b space-y-6">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Article Parameters
              </span>
              <p className="text-xs text-muted-foreground">
                Core identity and metadata displayed on cards and search.
              </p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                  Title *
                </label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {title.length} chars
                </span>
              </div>
              <Input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Building Community Governance on Web3"
                className="text-sm font-medium h-10"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground font-mono flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-primary" />
                  URL Slug *
                </label>
                <button
                  type="button"
                  onClick={() => setAutoSlug(!autoSlug)}
                  className="text-[11px] font-mono text-primary hover:underline cursor-pointer"
                >
                  {autoSlug ? "Customize" : "Auto-slug"}
                </button>
              </div>
              <Input
                type="text"
                value={slug}
                disabled={autoSlug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="building-community-governance"
                className="font-mono text-xs h-10"
              />
              <span className="text-[11px] font-mono text-muted-foreground block truncate">
                Route: /blogs/{slug || "slug-preview"}
              </span>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                  Excerpt / Summary *
                </label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {excerpt.length} chars
                </span>
              </div>
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A concise summary for home cards and social previews..."
                rows={3}
                className="resize-none text-xs leading-relaxed"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground font-mono flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-primary" />
                Tags (Comma-Separated)
              </label>
              <Input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="governance, web3, engineering, ai"
                className="text-xs h-10"
              />
              {tagsList.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {tagsList.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs font-normal gap-1 pl-2 pr-1.5 py-0.5"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive cursor-pointer"
                        title="Remove tag"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Cover Media & Live Preview */}
          <div className="p-6 sm:p-10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                    Cover Media
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      disabled={isUploadingCover}
                      onClick={() => coverFileInputRef.current?.click()}
                      className="gap-1.5 text-xs cursor-pointer border-primary/40 hover:border-primary text-primary"
                    >
                      {isUploadingCover ? (
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      ) : (
                        <Upload className="w-3 h-3 text-primary" />
                      )}
                      {isUploadingCover ? "Uploading..." : coverImage ? "Change Image" : "Upload Image"}
                    </Button>
                    {coverImage && (
                      <button
                        type="button"
                        onClick={() => handleCoverImageChange("")}
                        className="text-[11px] font-mono text-muted-foreground hover:text-destructive cursor-pointer flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Clear
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload directly to Cloudinary or specify an external image URL.
                </p>
              </div>

              {/* Hidden File Input for Cover Image */}
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverUpload(file);
                  e.target.value = "";
                }}
              />

              {/* Real-time Cover Image Preview Frame / Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleCoverUpload(file);
                }}
                className="rounded-xl border border-border/70 overflow-hidden bg-card/40 relative group"
              >
                {coverImage ? (
                  imageLoadError ? (
                    <div className="w-full aspect-[16/9] flex flex-col items-center justify-center text-center p-4 bg-destructive/10 text-destructive space-y-1.5">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-xs font-semibold">Unable to load cover image</span>
                      <p className="text-[11px] text-muted-foreground">
                        Please verify that the URL is public and points directly to an image asset.
                      </p>
                    </div>
                  ) : (
                    <div className="w-full aspect-[16/9] relative bg-muted/30">
                      <img
                        src={coverImage}
                        alt="Cover Preview"
                        referrerPolicy="no-referrer"
                        onError={() => setImageLoadError(true)}
                        className="w-full h-full object-cover"
                      />
                      {/* Hover Overlay to change image */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={isUploadingCover}
                          onClick={() => coverFileInputRef.current?.click()}
                          className="gap-1.5 text-xs cursor-pointer shadow-lg"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Upload New
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  <div
                    onClick={() => coverFileInputRef.current?.click()}
                    className={`w-full aspect-[16/9] flex flex-col items-center justify-center text-center p-6 bg-muted/10 border-2 border-dashed border-border/70 hover:border-primary/50 transition-colors cursor-pointer ${
                      isUploadingCover ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    {isUploadingCover ? (
                      <>
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                        <span className="text-xs font-medium text-foreground">
                          Uploading to Cloudinary...
                        </span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-muted-foreground/40 mb-2" />
                        <span className="text-xs font-medium text-muted-foreground">
                          Click to upload or drag & drop cover image
                        </span>
                        <p className="text-[11px] text-muted-foreground/70 max-w-xs mt-1 font-mono">
                          PNG, JPG, WebP up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cover Image URL Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Direct Image URL (Optional override)
                </label>
                <Input
                  type="url"
                  value={coverImage}
                  onChange={(e) => handleCoverImageChange(e.target.value)}
                  placeholder="https://res.cloudinary.com/... or external image URL"
                  className="font-mono text-xs h-9"
                />
              </div>
            </div>

            {/* Quick Document Audit */}
            <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2 text-xs font-mono text-muted-foreground">
              <div className="flex justify-between items-center">
                <span>Reading Time</span>
                <span className="text-foreground font-medium">~{readingTime} min read ({wordCount} words)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Mermaid Diagrams</span>
                <span className="text-foreground font-medium">{mermaidCount} detected</span>
              </div>
              {initialData?.author?.name && (
                <div className="flex justify-between items-center">
                  <span>Author</span>
                  <span className="text-foreground font-medium">{initialData.author.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Full-Width Monaco HTML & Mermaid Studio */}
      <section className="w-full dashed-border-b">
        <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-10 dashed-border-x space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Article Body & Diagrams
              </h2>
              <p className="text-xs text-muted-foreground">
                Write content using HTML, standard Tailwind classes, and &lt;pre class=&quot;mermaid&quot;&gt; diagrams.
              </p>
            </div>

            <span className="text-xs font-mono text-muted-foreground">
              Use &quot;Split&quot; or &quot;Preview&quot; above to see real-time output.
            </span>
          </div>

          <MonacoHtmlEditor
            value={content}
            onChange={(val) => setContent(val)}
            minHeight="580px"
          />
        </div>
      </section>
    </div>
  );
}
