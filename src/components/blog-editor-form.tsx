"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
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
  Users,
  ChevronDown,
  Check,
  PenLine,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export interface CoAuthor {
  id: string;
  name: string;
  email: string;
  image?: string;
}

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
    id?: string;
    name?: string;
    email?: string;
    image?: string;
  };
  coAuthors?: CoAuthor[];
}

interface BlogEditorFormProps {
  initialData?: BlogData;
  isEdit?: boolean;
}

/** Auto-grow a textarea to fit its content */
function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

export function BlogEditorForm({ initialData, isEdit = false }: BlogEditorFormProps) {
  const router = useRouter();

  const { data: session } = useSession();

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
  const [coAuthors, setCoAuthors] = useState<CoAuthor[]>(initialData?.coAuthors || []);
  const [availableAdmins, setAvailableAdmins] = useState<CoAuthor[]>([]);
  const [coAuthorDropdownOpen, setCoAuthorDropdownOpen] = useState(false);
  const coAuthorDropdownRef = useRef<HTMLDivElement>(null);

  // Textarea refs for auto-grow
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const slugRef = useRef<HTMLTextAreaElement>(null);
  const excerptRef = useRef<HTMLTextAreaElement>(null);
  const tagsRef = useRef<HTMLTextAreaElement>(null);
  const coverImageRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow on value change
  useEffect(() => { autoGrow(titleRef.current); }, [title]);
  useEffect(() => { autoGrow(slugRef.current); }, [slug]);
  useEffect(() => { autoGrow(excerptRef.current); }, [excerpt]);
  useEffect(() => { autoGrow(tagsRef.current); }, [tagsInput]);
  useEffect(() => { autoGrow(coverImageRef.current); }, [coverImage]);

  // Close co-author dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        coAuthorDropdownRef.current &&
        !coAuthorDropdownRef.current.contains(event.target as Node)
      ) {
        setCoAuthorDropdownOpen(false);
      }
    }
    if (coAuthorDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [coAuthorDropdownOpen]);

  // Fetch registered admin users for co-author selection
  useEffect(() => {
    async function loadAdmins() {
      try {
        const res = await fetch("/api/admin/users");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.admins)) {
            setAvailableAdmins(data.admins);
          }
        }
      } catch (e) {
        console.error("Failed to load admin users for co-authors:", e);
      }
    }
    loadAdmins();
  }, []);

  const isPrimaryAuthor =
    !isEdit ||
    !initialData?.author?.id ||
    !session?.user?.id ||
    initialData.author.id === session.user.id;

  // Sync state if initialData.coAuthors changes
  useEffect(() => {
    if (initialData?.coAuthors) {
      setCoAuthors(initialData.coAuthors);
    }
  }, [initialData?.coAuthors]);

  // Fetch freshest co-authors directly on mount in edit mode to bypass stale router cache
  useEffect(() => {
    if (!isEdit || !initialData?._id) return;
    let isMounted = true;
    async function fetchFreshBlog() {
      try {
        const res = await fetch(`/api/blogs/${initialData?._id}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.blog && Array.isArray(data.blog.coAuthors) && isMounted) {
            setCoAuthors(data.blog.coAuthors);
            if (initialData) {
              initialData.coAuthors = data.blog.coAuthors;
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch fresh blog on mount:", err);
      }
    }
    fetchFreshBlog();
    return () => {
      isMounted = false;
    };
  }, [isEdit, initialData?._id]);

  const persistCoAuthors = async (updated: CoAuthor[]) => {
    if (!isEdit || !initialData?._id) return;
    try {
      const res = await fetch(`/api/blogs/${initialData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coAuthors: updated }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save co-author changes.");
      }
      if (initialData) {
        initialData.coAuthors = updated;
      }
      toast.success("Co-authors updated & saved.");
      router.refresh();
    } catch (err: any) {
      console.error("Failed to auto-save co-authors:", err);
      toast.error(err.message || "Failed to update co-authors.");
    }
  };

  const handleToggleCoAuthor = async (admin: CoAuthor) => {
    if (!isPrimaryAuthor) {
      toast.error("Only the primary author can modify co-authors.");
      return;
    }
    const isAlreadySelected = coAuthors.some((ca) => ca.id === admin.id);
    const updated = isAlreadySelected
      ? coAuthors.filter((ca) => ca.id !== admin.id)
      : [...coAuthors, admin];

    setCoAuthors(updated);
    if (isEdit && initialData?._id) {
      await persistCoAuthors(updated);
    }
  };

  const handleRemoveCoAuthor = async (adminId: string) => {
    if (!isPrimaryAuthor) {
      toast.error("Only the primary author can modify co-authors.");
      return;
    }
    const updated = coAuthors.filter((ca) => ca.id !== adminId);
    setCoAuthors(updated);
    if (isEdit && initialData?._id) {
      await persistCoAuthors(updated);
    }
  };
  const [content, setContent] = useState(
    initialData?.content ||
      `<h2 class="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
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

  const validateForm = useCallback(() => {
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
    setError(null);
    return true;
  }, [title, slug, excerpt]);

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
          coAuthors,
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

  const isAnyBusy = isSaving || isDeleting || isUploadingCover;

  return (
    <div className="w-full flex flex-col">

      {/* ── Sticky Top Bar ── */}
      <div className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/blogs"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Articles
            </Link>
            <span className="text-border/60 select-none">·</span>
            <span className="text-sm font-medium text-foreground truncate max-w-[180px] sm:max-w-xs">
              {title || (isEdit ? "Edit Article" : "New Article")}
            </span>
            <Badge
              variant={status === "published" ? "default" : "secondary"}
              className="text-[10px] uppercase px-1.5 py-0 shrink-0"
            >
              {status}
            </Badge>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isEdit && status === "published" && (
              <Link href={`/blogs/${slug}`} target="_blank">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer h-8 px-2.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">View Live</span>
                </Button>
              </Link>
            )}

            {isEdit && initialData?._id && (
              <Link href={`/admin/blogs/${initialData._id}/editor`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium cursor-pointer h-8 px-3 border-primary/40 text-primary hover:bg-primary/5">
                  <PenLine className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open Editor</span>
                </Button>
              </Link>
            )}

            {isEdit && isPrimaryAuthor && (
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button type="button" variant="destructive" size="sm" disabled={isAnyBusy} className="gap-1.5 cursor-pointer text-xs h-8 px-3 justify-center shrink-0">
                      {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{isDeleting ? "Deleting..." : "Delete"}</span>
                    </Button>
                  }
                />
                <AlertDialogContent size="md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete article permanently?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently remove &quot;{title || "this article"}&quot; from the DAO database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5 cursor-pointer font-medium min-w-[140px] justify-center">
                      {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{isDeleting ? "Deleting..." : "Confirm & Delete"}</span>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {status === "published" ? (
              <>
                <Button type="button" variant="outline" size="sm" onClick={() => handleSave("draft")} disabled={isAnyBusy} className="gap-1.5 text-xs font-medium cursor-pointer h-8 px-3 justify-center shrink-0">
                  {savingAction === "draft" ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> : <FileText className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{savingAction === "draft" ? "Reverting..." : "Revert to Draft"}</span>
                </Button>
                <Button type="button" size="sm" onClick={() => handleSave("published")} disabled={isAnyBusy} className="gap-1.5 text-xs font-semibold cursor-pointer h-8 px-3 justify-center shrink-0">
                  {savingAction === "published" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savingAction === "published" ? "Saving..." : "Save Changes"}</span>
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" size="sm" onClick={() => handleSave("draft")} disabled={isAnyBusy} className="gap-1.5 text-xs font-medium cursor-pointer h-8 px-3 justify-center shrink-0">
                  {savingAction === "draft" ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> : <Save className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{savingAction === "draft" ? "Saving..." : "Save Draft"}</span>
                </Button>

                <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
                  <AlertDialogTrigger
                    render={
                      <Button type="button" size="sm" onClick={() => { if (validateForm()) setPublishDialogOpen(true); }} disabled={isAnyBusy} className="gap-1.5 font-semibold text-xs cursor-pointer h-8 px-3 justify-center shrink-0">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Publish</span>
                      </Button>
                    }
                  />
                  <AlertDialogContent size="md">
                    <AlertDialogHeader className="space-y-1.5">
                      <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
                        <Globe className="w-4 h-4" />
                        Community Publication
                      </div>
                      <AlertDialogTitle className="text-xl font-semibold tracking-tight text-foreground">Confirm Publication to DAO</AlertDialogTitle>
                      <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
                        This will be immediately published to the community feed and accessible to all DAO members.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex items-center gap-4 p-3.5 rounded-xl border border-border/70 bg-[#162032]">
                      {coverImage && !imageLoadError ? (
                        <div className="w-24 h-16 rounded-lg overflow-hidden border border-border/50 shrink-0 bg-muted/30">
                          <img src={coverImage} alt={title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg border border-border/50 shrink-0 bg-muted/20 flex items-center justify-center text-muted-foreground">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="font-semibold text-foreground text-sm truncate">{title || "Untitled Article"}</div>
                        <div className="text-[11px] text-muted-foreground truncate">/blogs/{slug || "slug"}</div>
                        {excerpt && <div className="text-[11px] text-muted-foreground line-clamp-1">{excerpt}</div>}
                      </div>
                    </div>
                    <AlertDialogFooter className="pt-2">
                      <AlertDialogCancel disabled={isSaving}>Keep as Draft</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleSave("published")} disabled={isSaving} className="gap-1.5 font-medium cursor-pointer min-w-[140px] justify-center">
                        {savingAction === "published" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>{savingAction === "published" ? "Publishing..." : "Confirm & Publish"}</span>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="w-full bg-destructive/10 border-b border-destructive/20">
          <div className="max-w-6xl w-full mx-auto px-4 sm:px-8 py-3 flex items-center gap-2 text-destructive text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} className="ml-auto hover:text-destructive/70 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="w-full dashed-border-b">
        <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-8 dashed-border-x">
          <div className="space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-primary font-semibold">
              {isEdit ? "Edit Article" : "New Article"}
            </span>
            <p className="text-xs text-muted-foreground">
              Manage metadata, cover image and co-authors here.{" "}
              {isEdit && initialData?._id && (
                <Link href={`/admin/blogs/${initialData._id}/editor`} className="text-primary hover:underline font-medium">
                  Open the content editor →
                </Link>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Metadata & Media 2-Column Grid */}
      <section className="w-full dashed-border-b">
        <div className="max-w-6xl w-full mx-auto dashed-border-x grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Article Parameters */}
          <div className="p-6 sm:p-10 md:dashed-border-r max-md:dashed-border-b space-y-6">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
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
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Title *
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {title.length} chars
                </span>
              </div>
              <Textarea
                ref={titleRef}
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Building Community Governance on Web3"
                rows={1}
                disabled={isAnyBusy}
                className="resize-none overflow-hidden text-sm font-medium leading-snug"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-primary" />
                  URL Slug *
                </label>
                <button
                  type="button"
                  onClick={() => setAutoSlug(!autoSlug)}
                  className="text-[11px] text-primary hover:underline cursor-pointer"
                >
                  {autoSlug ? "Customize" : "Auto-slug"}
                </button>
              </div>
              <Textarea
                ref={slugRef}
                value={slug}
                disabled={autoSlug || isAnyBusy}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="building-community-governance"
                rows={1}
                className="resize-none overflow-hidden text-xs leading-snug"
              />
              <span className="text-[11px] text-muted-foreground block truncate">
                Route: /blogs/{slug || "slug-preview"}
              </span>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Excerpt / Summary *
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {excerpt.length} chars
                </span>
              </div>
              <Textarea
                ref={excerptRef}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A concise summary for home cards and social previews..."
                rows={3}
                disabled={isAnyBusy}
                className="resize-none overflow-hidden text-xs leading-relaxed"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-primary" />
                Tags (Comma-Separated)
              </label>
              <Textarea
                ref={tagsRef}
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="governance, web3, engineering, ai"
                rows={1}
                disabled={isAnyBusy}
                className="resize-none overflow-hidden text-xs leading-snug"
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

            {/* Co-Authors (Admin Only) */}
            <div className="space-y-2.5 pt-1 border-t border-border/30">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  Co-Authors (Admins)
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {coAuthors.length} selected
                </span>
              </div>

              {/* Custom Shadcn-style Co-author Dropdown (Only Primary Author can modify) */}
              {isPrimaryAuthor ? (
                <div className="relative" ref={coAuthorDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setCoAuthorDropdownOpen(!coAuthorDropdownOpen)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/30 focus:border-primary/60 focus:ring-1 focus:ring-primary/40 outline-none transition-all cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-muted-foreground truncate">
                        {coAuthors.length > 0
                          ? `${coAuthors.length} co-author${coAuthors.length > 1 ? "s" : ""} selected`
                          : "Select co-authors from DAO admins..."}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                        coAuthorDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {coAuthorDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl border border-border/80 bg-[#162032] shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100 max-h-56 overflow-y-auto">
                      <div className="p-1.5 space-y-0.5">
                        {availableAdmins
                          .filter(
                            (adm) =>
                              adm.id !== session?.user?.id &&
                              adm.id !== initialData?.author?.id
                          )
                          .map((adm) => {
                            const isSelected = coAuthors.some((ca) => ca.id === adm.id);
                            return (
                              <button
                                key={adm.id}
                                type="button"
                                onClick={() => handleToggleCoAuthor(adm)}
                                className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                                  isSelected
                                    ? "bg-primary/15 text-primary font-medium"
                                    : "hover:bg-muted/40 text-foreground"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Avatar className="w-6 h-6 rounded-full shrink-0">
                                    <AvatarImage src={adm.image} alt={adm.name} referrerPolicy="no-referrer" />
                                    <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                                      {adm.name?.[0]?.toUpperCase() || "A"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0 truncate">
                                    <div className="font-medium text-xs leading-tight truncate">
                                      {adm.name}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground truncate leading-tight">
                                      {adm.email}
                                    </div>
                                  </div>
                                </div>
                                {isSelected ? (
                                  <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                                ) : (
                                  <span className="text-[10px] text-muted-foreground/60 shrink-0">Add</span>
                                )}
                              </button>
                            );
                          })}
                        {availableAdmins.filter(
                          (adm) =>
                            adm.id !== session?.user?.id &&
                            adm.id !== initialData?.author?.id
                        ).length === 0 && (
                          <div className="py-3 px-2 text-center text-[11px] text-muted-foreground">
                            No other admin accounts available.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-3 py-2 text-xs rounded-lg border border-border/40 bg-muted/10 text-muted-foreground flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                  <span>Co-author management is reserved for the primary author ({initialData?.author?.name || "Author"}).</span>
                </div>
              )}

              {/* Selected Co-Authors List */}
              {coAuthors.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {coAuthors.map((ca) => (
                    <div
                      key={ca.id}
                      className="inline-flex items-center gap-2 py-1 pl-1.5 pr-2 rounded-full border border-border/50 bg-muted/20 text-xs text-foreground"
                    >
                      <Avatar className="w-5 h-5 rounded-full">
                        <AvatarImage src={ca.image} alt={ca.name} referrerPolicy="no-referrer" />
                        <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                          {ca.name?.[0]?.toUpperCase() || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{ca.name}</span>
                      {isPrimaryAuthor && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCoAuthor(ca.id)}
                          className="text-muted-foreground hover:text-destructive cursor-pointer transition-colors ml-0.5"
                          title={`Remove ${ca.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  No co-authors added. Only you ({session?.user?.name || "Author"}) are credited.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Cover Media & Live Preview */}
          <div className="p-6 sm:p-10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                    Cover Media
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      disabled={isUploadingCover || isSaving || isDeleting}
                      onClick={() => coverFileInputRef.current?.click()}
                      className="gap-1.5 text-xs cursor-pointer border-primary/40 hover:border-primary text-primary w-28 h-6 justify-center shrink-0"
                    >
                      {isUploadingCover ? (
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      ) : (
                        <Upload className="w-3 h-3 text-primary" />
                      )}
                      <span>{isUploadingCover ? "Uploading..." : coverImage ? "Change Image" : "Upload Image"}</span>
                    </Button>
                    {coverImage && (
                      <button
                        type="button"
                        onClick={() => handleCoverImageChange("")}
                        className="text-[11px] text-muted-foreground hover:text-destructive cursor-pointer flex items-center gap-1"
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
                        <p className="text-[11px] text-muted-foreground/70 max-w-xs mt-1">
                          PNG, JPG, WebP up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cover Image URL Textarea */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Direct Image URL (Optional override)
                </label>
                <Textarea
                  ref={coverImageRef}
                  value={coverImage}
                  onChange={(e) => handleCoverImageChange(e.target.value)}
                  placeholder="https://res.cloudinary.com/... or external image URL"
                  rows={1}
                  disabled={isAnyBusy}
                  className="resize-none overflow-hidden text-xs leading-snug"
                />
              </div>
            </div>

            {/* Quick Document Audit */}
            <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2 text-xs text-muted-foreground">
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

      {/* ── Open Editor CTA ── */}
      {isEdit && initialData?._id && (
        <section className="w-full dashed-border-b">
          <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 py-10 dashed-border-x">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl border border-border/60 bg-muted/10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Article Content
                </div>
                <p className="text-xs text-muted-foreground">
                  {wordCount > 0
                    ? `~${readingTime} min read · ${wordCount} words written`
                    : "No content yet — open the editor to start writing."}
                </p>
              </div>
              <Link href={`/admin/blogs/${initialData._id}/editor`}>
                <Button className="gap-2 font-semibold cursor-pointer shrink-0">
                  <PenLine className="w-4 h-4" />
                  Open Content Editor
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
