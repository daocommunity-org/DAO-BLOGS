"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLoadingScreen } from "@/features/auth/auth-loading-screen";
import { getReturnPath } from "@/features/auth/return-path";

export default function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;

    const returnTo = getReturnPath(searchParams.get("returnTo") ?? "/");

    const timer = setTimeout(() => {
      router.replace(returnTo);
      router.refresh();
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [router, searchParams]);

  return (
    <AuthLoadingScreen
      message="Completing sign-in..."
      submessage="Finalizing your session, welcome to DAO Blogs"
    />
  );
}
