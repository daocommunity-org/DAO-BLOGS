"use client";

/*
From Uiverse.io by ZacharyCrespin - https://uiverse.io/ZacharyCrespin/grumpy-stingray-26
MIT License, Copyright (c) ZacharyCrespin (Zachary Crespin)
*/

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SquareLoader } from "@/components/ui/square-loader";

interface AuthLoadingScreenProps {
  message?: string;
  submessage?: string;
}

export function AuthLoadingScreen({
  message = "Please wait...",
  submessage,
}: AuthLoadingScreenProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const content = (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070e1a]/95 backdrop-blur-md px-6 text-center select-none animate-in fade-in duration-300"
    >
      <div className="relative mb-8 flex items-center justify-center p-4">
        <div
          aria-hidden="true"
          className="absolute -inset-4 rounded-full bg-primary/20 blur-2xl"
        />
        <SquareLoader />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
          {message}
        </h2>
        {submessage && (
          <p className="text-sm text-slate-400">
            {submessage}
          </p>
        )}
      </div>
    </div>
  );

  if (!mounted || typeof document === "undefined") {
    return content;
  }

  return createPortal(content, document.body);
}
