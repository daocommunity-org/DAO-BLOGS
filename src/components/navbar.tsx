"use client";

import Link from "next/link";
import Image from "next/image";
import { AuthButton } from "@/components/auth-button";

export function Navbar() {
  return (
    <header className="w-full dashed-border-b">
      <div className="max-w-6xl w-full mx-auto px-6 sm:px-10 h-16 sm:h-20 flex items-center justify-between gap-4 dashed-border-x">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity min-w-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 relative shrink-0 flex items-center justify-center">
            <Image
              src="/daopng.png"
              alt="DAO Community Logo"
              width={36}
              height={36}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="font-bold text-foreground text-base sm:text-lg tracking-tight truncate">
            DAO Community
          </span>
        </Link>

        <div className="shrink-0">
          <AuthButton />
        </div>
      </div>
    </header>
  );
}

