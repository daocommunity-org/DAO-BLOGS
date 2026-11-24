"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/lib/auth-client";
import { SignInDialog } from "@/features/auth/sign-in-dialog";

export function AuthButton() {
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (isPending) {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />;
  }

  if (session?.user) {
    return (
      <Link
        href="/profile"
        className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-border hover:ring-foreground/30 transition-shadow duration-200 flex items-center justify-center"
        title="View profile"
      >
        {session.user.image && !imageError ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={32}
            height={32}
            unoptimized
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-medium text-foreground">
            {session.user.name?.[0]?.toUpperCase() || "U"}
          </div>
        )}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
      >
        Sign in
      </button>
      <SignInDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
