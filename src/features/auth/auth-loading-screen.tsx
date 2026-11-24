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
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1b263b] px-6 text-center select-none"
    >
      <div className="mb-10">
        <SquareLoader />
      </div>

      <div className="space-y-1 max-w-sm">
        <h2 className="text-base font-medium tracking-tight text-white">
          {message}
        </h2>
        {submessage && (
          <p className="text-xs text-slate-400">
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
