"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle, ArrowLeft, BookOpen, ExternalLink, FileText, Globe, Image as ImageIcon, LoaderCircle, PenLine,
  Save, Trash2, Upload, X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { splitArticleContent } from "@/features/blogs/split-article-content";
import { UnsavedChangesDialog, useUnsavedChanges } from "@/features/admin/unsaved-changes";
import { toast } from "sonner";

interface CoAuthor {
  id: string;
  name: string;
  email: string;
}

export interface BlogEditorData {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  content: string;
  status: "draft" | "published";
  coAuthors: CoAuthor[];
  authorName?: string;
}

type Fields = { title: string; slug: string; excerpt: string; tags: string; coverImage: string };
type FieldErrors = Partial<Record<"title" | "slug" | "excerpt", string>>;
type Confirmation = "publish" | "unpublish" | "delete";
type Operation = "save" | Confirmation | "cover" | "authors";

const starterContent = `<h2 class="text-2xl font-semibold text-foreground mb-4">Introduction</h2>
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
</div>`;

const fieldClass = "w-full scroll-mt-36 border-border/70 bg-background/65 text-sm aria-invalid:border-destructive/75 disabled:opacity-65";
const toolbarButton = "h-9 gap-1.5 px-2.5 text-xs font-semibold enabled:cursor-pointer sm:px-3";
const operationText: Record<Operation, string> = {
  save: "Saving changes…",
  publish: "Publishing…",
  unpublish: "Moving to draft…",
  delete: "Deleting article…",
  cover: "Uploading cover…",
  authors: "Saving co-authors…",
};
const confirmations = {
  publish: {
    title: "Publish this article?",
    description: "The article will appear in the public blog feed.",
    action: "Publish article",
  },
  unpublish: {
    title: "Move this article to drafts?",
    description: "The public article link will stop working until you publish it again.",
    action: "Move to draft",
  },
  delete: {
    title: "Delete this article?",
    description: "This permanently removes the article and its comments and likes.",
    action: "Delete article",
  },
};

function splitTags(value: string) {
  return [...new Set(value.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
}

async function requireSuccess(response: Response, fallback: string) {
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success !== true) {
    const message = response.status < 500 && typeof result?.error === "string"
      ? result.error
      : fallback;
    throw new Error(message);
  }
  return result;
}

export function BlogEditorForm({
  initialData,
  viewerId,
  canManageAuthors = true,
}: {
  initialData?: BlogEditorData;
  viewerId: string;
  canManageAuthors?: boolean;
}) {
  const router = useRouter();
  const [fields, setFields] = useState<Fields>(() => ({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    excerpt: initialData?.excerpt ?? "",
    tags: initialData?.tags.join(", ") ?? "",
    coverImage: initialData?.coverImage ?? "",
  }));
  const [savedFields, setSavedFields] = useState(fields);
  const [status, setStatus] = useState(initialData?.status ?? "draft");
  const [autoSlug, setAutoSlug] = useState(!initialData);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [operation, setOperation] = useState<Operation>();
  const operationLock = useRef<Operation | undefined>(undefined);
  const [confirmation, setConfirmation] = useState<Confirmation>();
  const [coverError, setCoverError] = useState<string>();
  const [brokenCover, setBrokenCover] = useState<string>();
  const [coAuthors, setCoAuthors] = useState(initialData?.coAuthors ?? []);
  const [adminOptions, setAdminOptions] = useState<CoAuthor[]>([]);
  const [adminLoadFailed, setAdminLoadFailed] = useState(false);
  const [adminsLoading, setAdminsLoading] = useState(canManageAuthors);
  const [adminLoadAttempt, setAdminLoadAttempt] = useState(0);
  const [authorError, setAuthorError] = useState<string>();
  const coverInput = useRef<HTMLInputElement>(null);

  const editorBase = initialData && `/admin/blogs/${initialData._id}`;
  const endpoint = initialData ? `/api/admin/blogs/${initialData._id}` : "/api/admin/blogs";
  const tags = splitTags(fields.tags);
  const isDirty = Object.keys(fields).some((key) => {
    const name = key as keyof Fields;
    return fields[name] !== savedFields[name];
  });
  const busy = !!operation;
  const guard = useUnsavedChanges(!!initialData && isDirty);
  const coverUrl = fields.coverImage.trim();
  const availableAuthors = adminOptions.filter((option) =>
    option.id !== viewerId && !coAuthors.some((author) => author.id === option.id),
  );
  const articleText = initialData?.content.replace(/<[^>]*>/g, " ").trim() ?? "";
  const wordCount = articleText ? articleText.split(/\s+/).length : 0;
  const diagrams = initialData
    ? splitArticleContent(initialData.content).filter((part) => part.type === "mermaid").length
    : 0;

  useEffect(() => {
    if (!canManageAuthors) return;
    const controller = new AbortController();

    async function loadAdmins() {
      try {
        const response = await fetch("/api/admin/users", { signal: controller.signal });
        const result = await requireSuccess(response, "Couldn’t load eligible co-authors.");
        if (!Array.isArray(result.admins)) throw new Error("Invalid co-author list.");
        if (!controller.signal.aborted) setAdminOptions(result.admins);
      } catch {
        if (!controller.signal.aborted) setAdminLoadFailed(true);
      } finally {
        if (!controller.signal.aborted) setAdminsLoading(false);
      }
    }

    void loadAdmins();
    return () => controller.abort();
  }, [adminLoadAttempt, canManageAuthors]);

  function changeField(name: keyof Fields, value: string) {
    setFields((current) => ({
      ...current,
      [name]: value,
      ...(name === "title" && autoSlug ? { slug: makeSlug(value) } : {}),
    }));
    setNotice(undefined);
    if (name === "title" || name === "slug" || name === "excerpt") {
      setFieldErrors((current) => ({
        ...current,
        [name]: undefined,
        ...(name === "title" && autoSlug ? { slug: undefined } : {}),
      }));
    }
    if (name === "coverImage") {
      setCoverError(undefined);
      setBrokenCover(undefined);
    }
  }

  function start(next: Operation) {
    if (operationLock.current) return false;
    operationLock.current = next;
    setOperation(next);
    setError(undefined);
    setNotice(undefined);
    return true;
  }

  function finish() {
    operationLock.current = undefined;
    setOperation(undefined);
  }

  function validate() {
    const errors: FieldErrors = {};
    if (!fields.title.trim()) errors.title = "Enter a title.";
    const slug = fields.slug.trim();
    if (!slug || /[\s/?#\\]/.test(slug) || slug === "." || slug === "..") {
      errors.slug = "Enter a slug without spaces, slashes, or URL punctuation.";
    }
    if (!fields.excerpt.trim()) errors.excerpt = "Enter a short summary.";
    setFieldErrors(errors);
    const firstInvalid = Object.keys(errors)[0];
    if (firstInvalid) document.getElementById(`article-${firstInvalid}`)?.focus();
    return !firstInvalid;
  }

  async function persist(next: "save" | "publish" | "unpublish") {
    if (next === "save" && initialData && !isDirty) return true;
    if (operationLock.current || !validate() || !start(next)) return false;
    const nextStatus = next === "publish" ? "published" : next === "unpublish" ? "draft" : status;
    const metadata = {
      title: fields.title.trim(),
      slug: fields.slug.trim(),
      excerpt: fields.excerpt.trim(),
      coverImage: coverUrl,
      tags,
      status: nextStatus,
    };
    let leaving = false;

    try {
      const response = await fetch(endpoint, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(initialData ? metadata : { ...metadata, content: starterContent, coAuthors }),
      });
      await requireSuccess(response, "Couldn’t save the article. Try again.");
      if (!initialData) {
        leaving = true;
        toast.success(nextStatus === "published" ? "Article published." : "Draft saved.");
        router.push("/admin/blogs");
        return true;
      }
      const snapshot: Fields = {
        title: metadata.title,
        slug: metadata.slug,
        excerpt: metadata.excerpt,
        coverImage: metadata.coverImage,
        tags: metadata.tags.join(", "),
      };
      setFields(snapshot);
      setSavedFields(snapshot);
      setStatus(nextStatus);
      setConfirmation(undefined);
      setNotice(next === "publish" ? "Article published" : next === "unpublish" ? "Moved to drafts" : "All changes saved");
      return true;
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : "Couldn’t save the article. Try again.";
      if (message.toLowerCase().includes("slug")) {
        setConfirmation(undefined);
        setFieldErrors((current) => ({ ...current, slug: message }));
        requestAnimationFrame(() => document.getElementById("article-slug")?.focus());
      } else {
        setError(message);
      }
      return false;
    } finally {
      if (!leaving) finish();
    }
  }

  async function removeArticle() {
    if (!initialData || !canManageAuthors || !start("delete")) return;
    try {
      await requireSuccess(await fetch(endpoint, { method: "DELETE" }), "Couldn’t delete the article. Try again.");
      toast.success("Article deleted.");
      guard.leaveWithoutPrompt(() => router.push("/admin/blogs"));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Couldn’t delete the article. Try again.");
      finish();
    }
  }

  async function uploadCover(file: File) {
    if (operationLock.current) return;
    setCoverError(undefined);
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setCoverError("Choose an image that is 10 MB or smaller.");
      return;
    }
    if (!start("cover")) return;
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", "dao-blogs/covers");
      const result = await requireSuccess(await fetch("/api/admin/upload", { method: "POST", body }), "Couldn’t upload the cover. Try again.");
      if (typeof result.url !== "string") throw new Error("The upload returned no image URL.");
      changeField("coverImage", result.url);
    } catch (failure) {
      setCoverError(failure instanceof Error ? failure.message : "Couldn’t upload the cover. Try again.");
    } finally {
      finish();
    }
  }

  async function updateAuthors(updated: CoAuthor[]) {
    if (!canManageAuthors || operationLock.current) return;
    setAuthorError(undefined);
    if (!initialData) {
      setCoAuthors(updated);
      return;
    }
    if (!start("authors")) return;
    try {
      await requireSuccess(await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coAuthors: updated }),
      }), "Couldn’t save the co-authors. Try again.");
      setCoAuthors(updated);
      setNotice("Co-authors saved");
    } catch (failure) {
      setAuthorError(failure instanceof Error ? failure.message : "Couldn’t save the co-authors. Try again.");
    } finally {
      finish();
    }
  }

  const preview = editorBase && (status === "published"
    ? `/blogs/${encodeURIComponent(savedFields.slug)}`
    : `${editorBase}/preview`);
  const dialog = confirmation && confirmations[confirmation];

  return (
    <div className="flex w-full flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-8">
          <div className="flex min-w-0 flex-1 basis-full items-center gap-3 lg:basis-0">
            <Link href="/admin/blogs" className="inline-flex shrink-0 items-center gap-1.5 rounded-sm text-xs font-medium text-slate-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
              <ArrowLeft aria-hidden="true" className="size-4" /> All articles
            </Link>
            <span aria-hidden="true" className="h-4 w-px shrink-0 bg-border/70" />
            <p className="min-w-0 truncate text-sm font-medium" title={fields.title}>{fields.title || (initialData ? "Untitled article" : "New article")}</p>
            <span className={status === "published"
              ? "shrink-0 rounded-full bg-emerald-400/10 px-2 py-0.5 text-xs font-medium text-emerald-300"
              : "shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-slate-200"}>
              {status === "published" ? "Published" : "Draft"}
            </span>
          </div>

          <div className="flex max-w-full flex-wrap items-center gap-1.5 sm:gap-2">
            {preview && (
              <Link href={preview} target="_blank" rel="noreferrer" aria-label={status === "published" ? "View live" : "Preview draft"}
                className={buttonVariants({ variant: "ghost", size: "sm", className: toolbarButton })}>
                <ExternalLink aria-hidden="true" className="size-4" />
                <span className="hidden sm:inline">{status === "published" ? "View live" : "Preview draft"}</span>
              </Link>
            )}
            {editorBase && (
              <Link href={`${editorBase}/editor`} aria-label="Open content editor"
                className={buttonVariants({ variant: "outline", size: "sm", className: toolbarButton })}>
                <PenLine aria-hidden="true" className="size-4" />
                <span className="hidden sm:inline">Editor</span>
              </Link>
            )}
            {initialData && canManageAuthors && (
              <Button type="button" variant="destructive" size="sm" disabled={busy} className={toolbarButton} aria-label="Delete article"
                onClick={() => { setError(undefined); setConfirmation("delete"); }}>
                <Trash2 aria-hidden="true" className="size-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            )}
            <Button
              type="button" size="sm" variant="outline" className={toolbarButton} disabled={busy}
              onClick={() => {
                if (validate()) {
                  setError(undefined);
                  setConfirmation(status === "published" ? "unpublish" : "publish");
                }
              }}
            >
              <Globe aria-hidden="true" className="size-4" /> {status === "published" ? "Move to draft" : "Publish"}
            </Button>
            <Button
              type="submit" form="article-settings" size="sm" className={toolbarButton}
              disabled={busy || (!!initialData && !isDirty)}
            >
              {operation === "save"
                ? <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />
                : <Save aria-hidden="true" className="size-4" />}
              {operation === "save" ? "Saving…" : status === "published" ? "Save changes" : "Save draft"}
            </Button>
          </div>
        </div>
      </header>

      {error && !confirmation && (
        <div className="mx-auto w-full max-w-screen-2xl px-6 pt-4 sm:px-10">
          <ErrorNotice message={error} />
        </div>
      )}

      <section className="w-full dashed-border-b">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-wrap items-end justify-between gap-3 px-6 py-8 dashed-border-x sm:px-10">
          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold tracking-tight">{initialData ? "Edit article" : "New article"}</h1>
            <p className="text-sm text-slate-300">
              Manage article details, cover image, and co-authors.
              {editorBase && (
                <>{" "}<Link href={`${editorBase}/editor`} className="font-medium text-primary underline-offset-4 hover:underline">Open the content editor</Link></>
              )}
            </p>
          </div>
          <p className="text-xs text-slate-300" role="status">
            {operation ? operationText[operation] : notice || (isDirty ? "Unsaved changes" : "")}
          </p>
        </div>
      </section>

      <form
        id="article-settings" noValidate
        onSubmit={(event) => { event.preventDefault(); void persist("save"); }}
        className="w-full dashed-border-b"
      >
        <div className="mx-auto grid w-full max-w-screen-2xl dashed-border-x md:grid-cols-2">
          <section className="min-w-0 space-y-6 p-6 max-md:dashed-border-b sm:p-10 md:dashed-border-r">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <FileText aria-hidden="true" className="size-4 text-primary" /> Article details
            </h2>
            <fieldset disabled={busy} className="min-w-0 space-y-5">
              <div className="space-y-2">
                <label htmlFor="article-title" className="text-sm font-medium">Title</label>
                <Input id="article-title" className={`h-11 ${fieldClass}`} value={fields.title} required
                  aria-invalid={!!fieldErrors.title} aria-describedby={fieldErrors.title ? "title-error" : undefined}
                  onChange={(event) => changeField("title", event.target.value)} />
                <FieldError name="title" message={fieldErrors.title} />
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="article-slug" className="text-sm font-medium">URL slug</label>
                  <button type="button" className="rounded-sm text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
                    onClick={() => {
                      setAutoSlug(!autoSlug);
                      if (!autoSlug) changeField("slug", makeSlug(fields.title));
                    }}>
                    {autoSlug ? "Edit manually" : "Generate from title"}
                  </button>
                </div>
                <div className="flex min-w-0 items-center overflow-hidden rounded-lg border border-border/70 bg-background/65 focus-within:border-primary/70">
                  <span className="shrink-0 border-r border-border/50 px-3 font-mono text-xs text-slate-300" aria-hidden="true">/blogs/</span>
                <Input id="article-slug" className="h-11 min-w-0 scroll-mt-36 rounded-none border-0 bg-transparent px-3 font-mono text-sm shadow-none focus-visible:ring-0"
                    value={fields.slug} required readOnly={autoSlug} autoCapitalize="none" spellCheck={false}
                    aria-invalid={!!fieldErrors.slug} aria-describedby={fieldErrors.slug ? "slug-error" : undefined}
                    onChange={(event) => changeField("slug", event.target.value)} />
                </div>
                <FieldError name="slug" message={fieldErrors.slug} />
              </div>

              <div className="space-y-2">
                <label htmlFor="article-excerpt" className="text-sm font-medium">Summary</label>
                <Textarea id="article-excerpt" rows={4} className={`min-h-24 resize-y leading-relaxed ${fieldClass}`}
                  value={fields.excerpt} required placeholder="A short summary for the blog feed."
                  aria-invalid={!!fieldErrors.excerpt} aria-describedby={fieldErrors.excerpt ? "excerpt-error" : undefined}
                  onChange={(event) => changeField("excerpt", event.target.value)} />
                <FieldError name="excerpt" message={fieldErrors.excerpt} />
              </div>

              <div className="space-y-2">
                <label htmlFor="article-tags" className="text-sm font-medium">Tags</label>
                <Input id="article-tags" className={`h-11 ${fieldClass}`} value={fields.tags} placeholder="Separate tags with commas"
                  onChange={(event) => changeField("tags", event.target.value)} />
                {tags.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <li key={tag} className="flex max-w-full items-center gap-1 rounded-full border border-border/70 bg-muted/35 py-0.5 pr-1 pl-2.5 text-xs text-slate-200">
                        <span className="wrap-anywhere">{tag}</span>
                        <button type="button" aria-label={`Remove tag ${tag}`} className="grid size-6 shrink-0 place-items-center rounded-full text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-primary"
                          onClick={() => changeField("tags", tags.filter((item) => item !== tag).join(", "))}>
                          <X aria-hidden="true" className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </fieldset>

            <section className="space-y-3 border-t border-border/35 pt-4">
              <h3 className="text-sm font-semibold">Co-authors</h3>
              <div className="space-y-3">
                {initialData?.authorName && <p className="text-xs text-slate-300">Primary author: <span className="font-medium text-foreground">{initialData.authorName}</span></p>}
                {coAuthors.length > 0 && (
                  <ul className="divide-y divide-border/45">
                    {coAuthors.map((author) => (
                      <li key={author.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                        <span className="min-w-0 truncate">{author.name}</span>
                        {canManageAuthors && <button type="button" aria-label={`Remove ${author.name}`} disabled={busy}
                          className="grid size-8 shrink-0 place-items-center rounded-md text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-45"
                          onClick={() => void updateAuthors(coAuthors.filter((item) => item.id !== author.id))}>
                          <X aria-hidden="true" className="size-4" />
                        </button>}
                      </li>
                    ))}
                  </ul>
                )}
                {canManageAuthors ? (
                  adminLoadFailed ? (
                    <>
                      <ErrorNotice message="Couldn’t load eligible co-authors." />
                      <Button type="button" variant="outline" disabled={busy} onClick={() => {
                        setAdminLoadFailed(false);
                        setAdminsLoading(true);
                        setAdminLoadAttempt((count) => count + 1);
                      }}>Try again</Button>
                    </>
                  ) : (
                    <Select
                      value={null}
                      disabled={busy || adminsLoading || !availableAuthors.length}
                      items={availableAuthors.map(({ id, name }) => ({ value: id, label: name }))}
                      onValueChange={(id) => {
                        const author = availableAuthors.find((option) => option.id === id);
                        if (author) void updateAuthors([...coAuthors, author]);
                      }}
                    >
                      <SelectTrigger aria-label="Add co-author" className="w-full border-border/70 bg-background/65 data-[size=default]:h-10">
                        <SelectValue placeholder={
                          operation === "authors" ? "Saving co-authors…" :
                          adminsLoading ? "Loading admins…" :
                          availableAuthors.length ? "Add a co-author" : "No additional admins"
                        } />
                      </SelectTrigger>
                      <SelectContent align="start" alignItemWithTrigger={false}>
                        <SelectGroup>
                          {availableAuthors.map((author) => (
                            <SelectItem key={author.id} value={author.id} className="min-h-10">
                              <span className="grid min-w-0">
                                <span className="truncate font-medium">{author.name}</span>
                                {author.email && <span className="truncate text-xs text-slate-300">{author.email}</span>}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )
                ) : <p className="text-xs text-slate-300">The primary author manages co-authors.</p>}
                {authorError && <ErrorNotice message={authorError} />}
              </div>
            </section>
          </section>

          <section className="min-w-0 space-y-6 p-6 sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <ImageIcon aria-hidden="true" className="size-4 text-primary" /> Cover media
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="lg" className={toolbarButton} disabled={busy}
                  onClick={() => coverInput.current?.click()}>
                  {operation === "cover" ? <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" /> : <Upload aria-hidden="true" className="size-4" />}
                  {operation === "cover" ? "Uploading…" : coverUrl ? "Replace image" : "Upload image"}
                </Button>
                {coverUrl && <Button type="button" variant="ghost" size="lg" disabled={busy} aria-label="Remove cover image"
                  onClick={() => changeField("coverImage", "")}>Remove</Button>}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-dashed border-border/70 bg-background/50"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const file = event.dataTransfer.files[0];
                  if (file) void uploadCover(file);
                }}>
                {coverUrl && coverUrl !== brokenCover ? (
                  // Editors can preview URLs before they are saved or configured for image optimization.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverUrl} alt="Article cover preview" referrerPolicy="no-referrer"
                    className="h-full w-full object-cover" onError={() => setBrokenCover(coverUrl)} />
                ) : (
                  <div className="space-y-2 px-4 text-center text-slate-300">
                    <ImageIcon aria-hidden="true" className="mx-auto size-6 text-primary/70" />
                    <p className="text-sm">{coverUrl ? "Cover preview unavailable" : "Drop an image here"}</p>
                    <p className="text-xs">{coverUrl ? "Check the image URL below." : "Images up to 10 MB"}</p>
                  </div>
                )}
              </div>
              <input ref={coverInput} type="file" accept="image/*" hidden disabled={busy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void uploadCover(file);
                }} />
              <div className="space-y-2">
                <label htmlFor="article-cover" className="text-sm font-medium">Image URL</label>
                <Input id="article-cover" type="text" inputMode="url" className={`h-10 ${fieldClass}`} disabled={busy}
                  value={fields.coverImage} placeholder="https://…" onChange={(event) => changeField("coverImage", event.target.value)} />
              </div>
              {coverError && <ErrorNotice message={coverError} />}
            </div>

            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-xl border border-border/60 bg-muted/15 p-4 text-xs">
              <dt className="text-slate-300">Reading time</dt>
              <dd className="text-right font-medium">{Math.max(1, Math.ceil(wordCount / 200))} min · {wordCount.toLocaleString()} words</dd>
              <dt className="text-slate-300">Mermaid diagrams</dt>
              <dd className="text-right font-medium">{diagrams}</dd>
              {initialData?.authorName && (
                <>
                  <dt className="text-slate-300">Author</dt>
                  <dd className="text-right font-medium wrap-anywhere">{initialData.authorName}</dd>
                </>
              )}
            </dl>
          </section>
        </div>
      </form>

      {editorBase && (
        <section className="w-full dashed-border-b">
          <div className="mx-auto w-full max-w-screen-2xl dashed-border-x px-6 py-10 sm:px-10">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/10 p-5 sm:p-6">
              <div className="space-y-1">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <BookOpen aria-hidden="true" className="size-4 text-primary" /> Article content
                </h2>
                <p className="text-xs text-slate-300">
                  {wordCount ? `${Math.max(1, Math.ceil(wordCount / 200))} min read · ${wordCount.toLocaleString()} words` : "Open the editor to start writing."}
                </p>
              </div>
              <Link href={`${editorBase}/editor`} className={buttonVariants({ size: "lg", className: "h-10 gap-2 px-3.5 font-semibold" })}>
                <PenLine aria-hidden="true" className="size-4" /> Open content editor
              </Link>
            </div>
          </div>
        </section>
      )}

      <AlertDialog open={!!dialog} onOpenChange={(open) => {
        if (!open && !operationLock.current) { setConfirmation(undefined); setError(undefined); }
      }}>
        {dialog && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
              <AlertDialogDescription>{dialog.description}</AlertDialogDescription>
            </AlertDialogHeader>
            {error && <ErrorNotice message={error} />}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
              <AlertDialogAction variant={confirmation === "delete" ? "destructive" : "default"} disabled={busy}
                className={toolbarButton} onClick={() => {
                  if (confirmation === "delete") void removeArticle();
                  if (confirmation === "publish" || confirmation === "unpublish") void persist(confirmation);
                }}>
                {busy && <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />}
                {operation ? operationText[operation] : dialog.action}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
      {initialData && (
        <UnsavedChangesDialog
          guard={guard}
          busy={busy}
          saving={operation === "save"}
          onSave={() => persist("save")}
        />
      )}
    </div>
  );
}

function makeSlug(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function FieldError({ name, message }: { name: string; message?: string }) {
  return message ? <p id={`${name}-error`} role="alert" className="text-xs text-rose-300">{message}</p> : null;
}

function ErrorNotice({ message }: { message: string }) {
  return (
    <p role="alert" className="flex items-start gap-2 rounded-lg border border-rose-400/25 bg-rose-400/10 px-3 py-2.5 text-sm text-rose-200">
      <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> {message}
    </p>
  );
}
