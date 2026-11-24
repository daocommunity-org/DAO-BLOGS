"use client";

import { useEffect, useState, useRef } from "react";
import { TocHeading } from "@/lib/toc";

interface TableOfContentsProps {
  headings: TocHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const headingRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgPath, setSvgPath] = useState<string>("");
  const [activeSegment, setActiveSegment] = useState<{ y1: number; y2: number; x: number } | null>(null);

  // Measure row heights and generate smooth continuous SVG track with bends for subheadings (level 3)
  useEffect(() => {
    if (!containerRef.current || headings.length === 0) return;

    const measureAndDraw = () => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();

      const points: { y: number; x: number; id: string; level: number; top: number; bottom: number }[] = [];

      headings.forEach((heading) => {
        const el = headingRefs.current.get(heading.id);
        if (el) {
          const elRect = el.getBoundingClientRect();
          const midY = elRect.top - containerRect.top + elRect.height / 2;
          const topY = elRect.top - containerRect.top;
          const bottomY = elRect.bottom - containerRect.top;
          // Level 2 headings align at x = 1.5, Level 3 indent outward to x = 11.5
          const x = heading.level === 3 ? 11.5 : 1.5;
          points.push({ y: midY, x, id: heading.id, level: heading.level, top: topY, bottom: bottomY });
        }
      });

      if (points.length < 2) return;

      // Build smooth path connecting heading centers with rounded filleted bends
      let path = `M ${points[0].x} ${points[0].top}`;
      path += ` L ${points[0].x} ${points[0].y}`;

      const r = 5; // fillet radius for bends

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        if (p1.x === p2.x) {
          // Straight vertical segment
          path += ` L ${p2.x} ${p2.y}`;
        } else {
          // Bending transition between p1.x and p2.x
          const midY = (p1.y + p2.y) / 2;
          path += ` L ${p1.x} ${midY - r}`;
          path += ` C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${midY + r}`;
          path += ` L ${p2.x} ${p2.y}`;
        }
      }

      // Extend slightly past last item
      const lastPoint = points[points.length - 1];
      path += ` L ${lastPoint.x} ${lastPoint.bottom}`;

      setSvgPath(path);

      // Track active segment position for highlight indicator
      const activePoint = points.find((p) => p.id === activeId) || points[0];
      if (activePoint) {
        setActiveSegment({
          y1: activePoint.top + 2,
          y2: activePoint.bottom - 2,
          x: activePoint.x,
        });
      }
    };

    measureAndDraw();

    const ro = new ResizeObserver(() => measureAndDraw());
    ro.observe(containerRef.current);
    window.addEventListener("resize", measureAndDraw);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureAndDraw);
    };
  }, [headings, activeId]);

  // Scrollspy via IntersectionObserver
  useEffect(() => {
    if (headings.length === 0) return;

    if (!activeId && headings[0]) {
      setActiveId(headings[0].id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
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
      window.history.replaceState(null, "", "#" + id);
    }
  };

  return (
    <nav className="w-full select-none" aria-label="Table of contents">
      {/* Top Section Label */}
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-3.5 pl-0.5">
        On this page
      </div>

      {/* Navigation Links with Curved Guideline Track */}
      <div ref={containerRef} className="relative pl-5 py-0.5">
        {/* SVG Track Layer for Bent / Curved Lines */}
        <svg
          className="absolute left-0 top-0 w-5 h-full pointer-events-none overflow-visible"
          aria-hidden="true"
        >
          {/* Base Track (Subtle Gray) */}
          {svgPath && (
            <path
              d={svgPath}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              className="text-border/70"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Active Highlight Notch */}
          {activeSegment && (
            <line
              x1={activeSegment.x}
              y1={activeSegment.y1}
              x2={activeSegment.x}
              y2={activeSegment.y2}
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary transition-all duration-200"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Headings List */}
        <div className="space-y-1.5">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;
            const isSubheading = heading.level === 3;

            return (
              <div
                key={heading.id}
                ref={(el) => {
                  if (el) headingRefs.current.set(heading.id, el);
                  else headingRefs.current.delete(heading.id);
                }}
                className={isSubheading ? "pl-2.5" : "pl-0"}
              >
                <a
                  href={"#" + heading.id}
                  onClick={(e) => handleClick(e, heading.id)}
                  className={
                    "block text-[11px] leading-snug transition-colors duration-150 py-0.5 cursor-pointer " +
                    (isActive
                      ? "text-primary font-medium"
                      : "text-muted-foreground/75 hover:text-foreground font-normal")
                  }
                  title={heading.text}
                >
                  {heading.text}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

