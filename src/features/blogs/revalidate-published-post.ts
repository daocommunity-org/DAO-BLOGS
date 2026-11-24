import "server-only";

import { revalidatePath } from "next/cache";

type BlogVisibility = { slug: string; status: "draft" | "published" };

export function revalidatePublishedPost(before?: BlogVisibility, after?: BlogVisibility) {
  if (before?.status !== "published" && after?.status !== "published") return;

  revalidatePath("/");
  if (before) revalidatePath(`/blogs/${encodeURIComponent(before.slug)}`);
  if (after && after.slug !== before?.slug) {
    revalidatePath(`/blogs/${encodeURIComponent(after.slug)}`);
  }
}
