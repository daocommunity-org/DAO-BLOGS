"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface DeleteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  label?: string;
}

export const DeleteButton = forwardRef<HTMLButtonElement, DeleteButtonProps>(
  ({ isLoading = false, label = "Delete", className = "", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || isLoading}
        aria-label={label}
        className={`group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-medium shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:pointer-events-none select-none h-8 w-[100px] ${className}`}
        {...props}
      >
        {/* Text that slides/fades on hover */}
        <span className="text-xs font-semibold tracking-wide transition-all duration-200 -translate-x-2.5 group-hover:opacity-0 group-hover:-translate-x-4">
          {isLoading ? "Deleting..." : label}
        </span>

        {/* Right Icon box that expands to fill on hover */}
        <span className="absolute right-0 top-0 bottom-0 w-7 flex items-center justify-center border-l border-rose-700/60 bg-rose-700/20 group-hover:w-full group-hover:border-l-0 group-hover:bg-transparent transition-all duration-200">
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-white transition-transform duration-200 group-active:scale-75"
            >
              <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z" />
            </svg>
          )}
        </span>
      </button>
    );
  }
);

DeleteButton.displayName = "DeleteButton";
