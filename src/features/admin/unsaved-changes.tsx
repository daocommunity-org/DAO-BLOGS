"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Departure = () => void;
type HistoryNavigation = EventTarget & { traverseTo: (key: string) => unknown };
type HistoryNavigationEvent = Event & {
  navigationType: string;
  destination: { key: string; sameDocument: boolean; url: string };
};

export function useUnsavedChanges(isDirty: boolean) {
  const router = useRouter();
  const [departure, setDeparture] = useState<Departure>();
  const bypass = useRef(false);

  useEffect(() => {
    if (!isDirty) return;
    bypass.current = false;

    function requestDeparture(resume: Departure) {
      setDeparture((pending) => pending ?? resume);
    }

    function warnBeforeUnload(event: BeforeUnloadEvent) {
      if (bypass.current) return;
      event.preventDefault();
      event.returnValue = true;
    }

    function isLeavingPage(url: URL) {
      return url.origin !== location.origin ||
        url.pathname !== location.pathname || url.search !== location.search;
    }

    function guardLink(event: MouseEvent) {
      if (bypass.current || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement) || anchor.hasAttribute("download") ||
        (anchor.target && anchor.target.toLowerCase() !== "_self")) return;
      const url = new URL(anchor.href);
      if (!["http:", "https:"].includes(url.protocol) || !isLeavingPage(url)) return;

      event.preventDefault();
      requestDeparture(() => {
        if (url.origin === location.origin) {
          router.push(url.pathname + url.search + url.hash);
        } else {
          location.assign(url.href);
        }
      });
    }

    const navigation = (window as Window & { navigation?: HistoryNavigation }).navigation;
    function guardHistory(event: Event) {
      const { navigationType, destination } = event as HistoryNavigationEvent;
      if (!navigation || bypass.current || !event.cancelable || navigationType !== "traverse" ||
        !destination.sameDocument || !isLeavingPage(new URL(destination.url))) return;

      event.preventDefault();
      requestDeparture(() => {
        navigation.traverseTo(destination.key);
      });
    }

    window.addEventListener("beforeunload", warnBeforeUnload);
    document.addEventListener("click", guardLink, true);
    navigation?.addEventListener("navigate", guardHistory);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
      document.removeEventListener("click", guardLink, true);
      navigation?.removeEventListener("navigate", guardHistory);
    };
  }, [isDirty, router]);

  function leaveWithoutPrompt(resume: Departure) {
    bypass.current = true;
    setDeparture(undefined);
    resume();
  }

  return { departure, dismiss: () => setDeparture(undefined), leaveWithoutPrompt };
}

export function UnsavedChangesDialog({
  guard,
  busy,
  saving,
  onSave,
}: {
  guard: ReturnType<typeof useUnsavedChanges>;
  busy: boolean;
  saving: boolean;
  onSave: () => Promise<boolean>;
}) {
  const { departure, dismiss, leaveWithoutPrompt } = guard;

  async function saveAndLeave() {
    if (!departure || busy) return;
    if (await onSave()) {
      leaveWithoutPrompt(departure);
    } else {
      // The editor displays the validation or save error where it can be fixed.
      dismiss();
    }
  }

  return (
    <AlertDialog open={!!departure} onOpenChange={(open) => {
      if (!open && !saving) dismiss();
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Save your changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. Save them before leaving, or keep editing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col items-stretch sm:flex-row sm:items-center">
          <AlertDialogCancel disabled={saving}>Keep editing</AlertDialogCancel>
          <AlertDialogAction variant="outline" disabled={busy} onClick={() => {
            if (departure) leaveWithoutPrompt(departure);
          }}>
            Discard changes
          </AlertDialogAction>
          <AlertDialogAction disabled={busy} onClick={saveAndLeave}>
            {saving ? "Saving…" : "Save and leave"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
