"use client";

import { useState } from "react";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ProfileSignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      const result = await signOut();
      if (result.error) throw new Error("Sign-out failed.");
      setOpen(false);
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Couldn’t sign out. Try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="outline"
            size="lg"
            disabled={isSigningOut}
            className="h-10 cursor-pointer gap-2 border-border/70 bg-transparent px-3.5 text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <LogOut aria-hidden="true" className="size-4" />
            Sign out
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out of DAO Blogs?</AlertDialogTitle>
          <AlertDialogDescription>
            Sign in again to like posts or join the discussion.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSigningOut} className="h-9 px-3.5">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSignOut}
            disabled={isSigningOut}
            variant="destructive"
            aria-busy={isSigningOut}
            className="h-9 cursor-pointer px-3.5 font-semibold"
          >
            Sign out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
