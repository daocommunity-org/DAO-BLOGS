"use client";

import { useEffect, useState, useRef } from "react";
import { TocHeading } from "@/lib/toc";

interface TableOfContentsProps {
  headings: TocHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const headingRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  // Scrollspy via IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    // Set default active to first heading
    if (!activeId && headings[0]) {
      setActiveId(headings[0].id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible entries
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by their distance from the top of the viewport
          visibleEntries.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -55% 0px",
        threshold: 0,
      }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings, activeId]);

  if (headings.length < 2) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
      window.history.replaceState(null, "", '#' + id);
    }
  };

  return (
    <nav className="w-full space-y-3 select-none" aria-label="Table of contents">
      {/* Top Section Label matching user design */}
      <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground/70 pl-3">
        On this page
      </div>

      {/* Navigation Links with Active Guideline Track */}
      <div className="relative border-l border-border/40 pl-3 space-y-1.5">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const isSubheading = heading.level === 3;

          return (
            <div key={heading.id} className="relative group">
              {/* Active bracket / notch indicator on the left border */}
              {isActive && (
                <span
                  className="absolute -left-[13px] top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(255,102,0,0.6)] transition-all duration-200"
                  aria-hidden="true"
                />
              )}

              <a
                href={'#' + heading.id}
                onClick={(e) => handleClick(e, heading.id)}
                ref={(el) => {
                  if (el) headingRefs.current.set(heading.id, el);
                  else headingRefs.current.delete(heading.id);
                }}
                className={
                  'block text-xs transition-colors duration-150 leading-snug cursor-pointer ' +
                  (isSubheading ? 'pl-3.5 py-0.5 ' : 'py-1 ') +
                  (isActive
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground/80 hover:text-foreground font-normal')
                }
              >
                {heading.text}
              </a>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
