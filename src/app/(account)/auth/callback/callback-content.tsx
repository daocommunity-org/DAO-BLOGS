"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { AuthLoadingScreen } from "@/features/auth/auth-loading-screen";
import { getReturnPath } from "@/features/auth/return-path";

export default function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;

    const returnTo = getReturnPath(searchParams?.get("returnTo") ?? "/");

    const timer = setTimeout(() => {
      window.location.replace(returnTo);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [searchParams]);

  return (
    <AuthLoadingScreen
      message="Signing in..."
      submessage="Redirecting you back"
    />
  );
}
