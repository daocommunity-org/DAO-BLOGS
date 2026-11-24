import { Suspense } from "react";
import AuthCallbackContent from "./callback-content";
import { AuthLoadingScreen } from "@/features/auth/auth-loading-screen";

export const metadata = {
  title: "Signing in... | DAO Blogs",
  robots: { index: false, follow: false },
};

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <AuthLoadingScreen
          message="Completing sign-in..."
          submessage="Finalizing your session, welcome to DAO Blogs"
        />
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
