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
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0d1b2a]/92 backdrop-blur-md px-6 text-center select-none animate-in fade-in duration-300"
    >
      <div className="relative mb-10 flex items-center justify-center p-8 rounded-3xl border border-[#415a77]/50 bg-[#1b263b]/75 shadow-[0_0_60px_rgba(31,182,255,0.18)]">
        {/* Glow backdrop behind rotated diamond matching website cyan */}
        <div
          aria-hidden="true"
          className="absolute -inset-4 rounded-full bg-[#1fb6ff]/25 blur-3xl"
        />
        <SquareLoader />
      </div>

      <div className="space-y-2 max-w-sm">
        <h2 className="text-xl font-semibold tracking-tight text-white font-heading">
          {message}
        </h2>
        {submessage && (
          <p className="text-sm font-medium text-[#778da9]">
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
