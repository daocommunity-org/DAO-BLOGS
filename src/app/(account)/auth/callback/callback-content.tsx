"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AuthLoadingScreen } from "@/features/auth/auth-loading-screen";
import { getReturnPath } from "@/features/auth/return-path";

export default function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const rawReturnTo = searchParams?.get("returnTo") ?? "/";
  const returnTo = getReturnPath(rawReturnTo);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.replace(returnTo);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [returnTo]);

  return (
    <>
      <AuthLoadingScreen
        message="Signing in..."
        submessage="Redirecting you back"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `setTimeout(function(){ window.location.replace(${JSON.stringify(returnTo)}); }, 1000);`,
        }}
      />
    </>
  );
}
