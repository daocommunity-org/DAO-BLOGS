"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "@/lib/auth-client";

export function AuthButton() {
  const { data: session, isPending } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
    } finally {
      setIsSigningIn(false);
    }
  };

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
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
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
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isSigningIn}
      className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
    >
      {isSigningIn ? "Signing in…" : "Sign In"}
    </button>
  );
}
