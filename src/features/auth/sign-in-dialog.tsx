"use client";

import Image from "next/image";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { useRef, useState, type RefObject } from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import { AuthLoadingScreen } from "./auth-loading-screen";
import { getReturnPath } from "./return-path";

export function SignInDialog({
  open,
  onOpenChange,
  returnTo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnTo?: string;
}) {
  const googleButton = useRef<HTMLButtonElement>(null);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-[#070e1a]/75 backdrop-blur-sm transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup
          initialFocus={googleButton}
          className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[25rem] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[1.25rem] border border-white/10 bg-[#162238] px-6 pt-9 pb-8 text-center text-foreground shadow-[0_24px_80px_rgba(3,8,20,0.55)] transition-[opacity,scale] duration-200 ease-out data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none sm:px-10"
        >
          <Dialog.Close
            type="button"
            aria-label="Close sign-in"
            className="absolute top-3 right-3 grid size-9 cursor-pointer place-items-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <X aria-hidden="true" className="size-[18px]" />
          </Dialog.Close>

          <Image
            src="/daopng.png"
            alt=""
            width={48}
            height={48}
            className="mx-auto size-12 rounded-full ring-4 ring-primary/10"
          />
          <Dialog.Title className="mt-5 text-[1.375rem] leading-tight font-semibold tracking-tight sm:text-2xl">
            Sign in to DAO Blogs
          </Dialog.Title>
          <Dialog.Description className="mx-auto mt-2 max-w-[17rem] text-sm leading-relaxed text-slate-300">
            Like posts, join the discussion, and access your profile.
          </Dialog.Description>

          <GoogleSignIn returnTo={returnTo} buttonRef={googleButton} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function GoogleSignIn({
  returnTo,
  buttonRef,
}: {
  returnTo?: string;
  buttonRef: RefObject<HTMLButtonElement | null>;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function continueWithGoogle() {
    if (pending) return;
    setPending(true);
    setError(false);
    const returnPath = getReturnPath(
      returnTo ?? (window.location.pathname + window.location.search + window.location.hash),
    );
    const callbackURL = `/auth/callback?returnTo=${encodeURIComponent(returnPath)}`;
    try {
      const [result] = await Promise.all([
        signIn.social({
          provider: "google",
          callbackURL,
          errorCallbackURL: `/sign-in/error?returnTo=${encodeURIComponent(returnPath)}`,
        }),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);
      if (!result.error && result.data?.redirect) return;
    } catch {
      // The inline message also covers a network failure before Google opens.
    }
    setError(true);
    setPending(false);
  }

  return (
    <>
      {pending && (
        <AuthLoadingScreen
          message="Connecting to Google..."
          submessage="Redirecting to secure login"
        />
      )}
      <div className="mt-7">
        <button
          ref={buttonRef}
          type="button"
          aria-label="Sign in with Google"
          aria-busy={pending}
          disabled={pending}
          onClick={continueWithGoogle}
          className="inline-flex cursor-pointer rounded-full transition-[filter,opacity] hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none"
        >
          <Image
            src="/auth/google-sign-in.png"
            alt=""
            width={198}
            height={44}
            unoptimized
            className="h-auto w-[198px]"
          />
        </button>
        {error && <p role="alert" className="mt-3 text-sm text-rose-300">Couldn’t start sign-in. Try again.</p>}
      </div>
    </>
  );
}

export function SignInPrompt({ returnTo, message }: { returnTo: string; message: string }) {
  const [open, setOpen] = useState(true);

  return (
    <section className="mx-auto max-w-lg space-y-4 px-6 py-20 text-center">
      <h1 className="text-xl font-semibold">Sign in to DAO Blogs</h1>
      <p className="text-sm text-muted-foreground">{message}</p>
      <div className="flex items-center justify-center gap-4">
        <Button onClick={() => setOpen(true)}>Sign in</Button>
        <Link href="/" className="text-sm underline underline-offset-4">Back to blogs</Link>
      </div>
      <SignInDialog open={open} onOpenChange={setOpen} returnTo={returnTo} />
    </section>
  );
}
