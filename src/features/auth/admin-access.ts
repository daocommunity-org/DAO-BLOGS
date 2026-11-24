import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const getViewerSession = cache(async () =>
  auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  }),
);

export async function hasAdminPermission(userId: string) {
  // The built-in admin role has user:list. Better Auth also applies its adminUserIds option.
  const { success } = await auth.api.userHasPermission({
    body: {
      userId,
      permissions: { user: ["list"] },
    },
  });
  return success;
}

export const getAdminSession = cache(async () => {
  const session = await getViewerSession();
  if (!session) return null;
  return (await hasAdminPermission(session.user.id)) ? session : null;
});

export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) notFound();
  return session;
}

export function adminNotFound() {
  return NextResponse.json(
    { success: false, error: "Not found." },
    { status: 404, headers: { "Cache-Control": "private, no-store" } },
  );
}
