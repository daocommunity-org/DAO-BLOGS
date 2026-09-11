"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

let isMermaidInitialized = false;

function initMermaid() {
  if (typeof window === "undefined") return;

  const font = "Montserrat, sans-serif";

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: "base",
    themeVariables: {
      darkMode: true,
      background: "transparent",
      fontFamily: font,
      fontSize: "13px",
      primaryColor: "#222e45",
      primaryTextColor: "#ffffff",
      primaryBorderColor: "#415a77",
      lineColor: "#778da9",
      secondaryColor: "#1b263b",
      tertiaryColor: "#1a2436",
      mainBkg: "#222e45",
      nodeBorder: "#415a77",
      nodeTextColor: "#ffffff",
      clusterBkg: "#1a2436",
      clusterBorder: "#415a77",
      defaultLinkColor: "#778da9",
      titleColor: "#ffffff",
      edgeLabelBackground: "#162032",
      labelBoxBkgColor: "#162032",
      labelBoxBorderColor: "#415a77",
      labelTextColor: "#cbd5e1",
    },
    flowchart: {
      look: "classic",
      htmlLabels: true,
      curve: "linear",
      padding: 24,
      nodeSpacing: 45,
      rankSpacing: 45,
      useMaxWidth: false,
    },
  });
}

interface MermaidViewerProps {
  chart: string;
  className?: string;
}

export function MermaidViewer({ chart, className = "" }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Fullscreen & Zoom state
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      if (!chart.trim()) return;
      try {
        if (typeof document !== "undefined" && document.fonts) {
          await document.fonts.ready;
        }
        initMermaid();
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(
          id,
          chart,
          containerRef.current || undefined
        );
        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err: any) {
        console.error("Mermaid render error:", err);
        if (isMounted) {
          setError(err.message || "Failed to render Mermaid diagram.");
        }
      }
    };

    renderChart();
    return () => {
      isMounted = false;
    };
  }, [chart]);

  // Keyboard navigation when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "+" || e.key === "=") {
        setScale((s) => Math.min(s + 0.25, 4));
      } else if (e.key === "-") {
        setScale((s) => Math.max(s - 0.25, 0.4));
      } else if (e.key === "0") {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleOpen = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsOpen(true);
  };

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((s) => Math.min(s + 0.25, 4));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((s) => Math.max(s - 0.25, 0.4));
  };

  const handleReset = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    setScale((s) => Math.min(Math.max(s + delta, 0.4), 4));
  };

  // Drag to pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (error) {
    return (
      <div className="p-4 my-4 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive font-mono overflow-x-auto">
        <strong>Diagram Syntax Error:</strong>
        <pre className="mt-1">{chart}</pre>
      </div>
    );
  }

  return (
    <>
      {/* 1. In-Post Diagram Card with Click-to-Expand */}
      <div className="relative group my-6 w-full max-w-full">
        <div
          ref={containerRef}
          onClick={handleOpen}
          className={`mermaid mermaid-wrapper w-full max-w-full p-6 rounded-xl overflow-x-auto overflow-y-visible cursor-zoom-in transition-all duration-200 hover:border-[#1fb6ff]/40 text-center ${className}`}
          dangerouslySetInnerHTML={{ __html: svg }}
          title="Click to expand diagram in fullscreen viewer"
        />

        {/* Top-Right Expand Badge */}
        <button
          type="button"
          onClick={handleOpen}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1b263b]/90 border border-[#415a77] text-xs font-mono text-muted-foreground hover:text-foreground hover:border-[#1fb6ff] shadow-lg backdrop-blur-sm cursor-pointer z-10"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          <span>Expand</span>
        </button>
      </div>

      {/* 2. Fullscreen Interactive Pan & Zoom Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md animate-in fade-in-0 duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          {/* Top Control Bar */}
          <div className="w-full px-6 py-3.5 border-b border-[#415a77]/50 bg-[#162032]/95 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Diagram Viewer
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline-block font-mono">
                // Drag to pan, scroll to zoom
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-[#415a77]/60 bg-[#1b263b] p-1 gap-1">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out (-)"
                  className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>

                <span className="px-2 font-mono text-xs text-foreground min-w-[50px] text-center font-medium">
                  {Math.round(scale * 100)}%
                </span>

                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In (+)"
                  className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset (0)"
                  className="px-2 py-1 rounded hover:bg-muted text-[11px] font-mono text-muted-foreground hover:text-foreground cursor-pointer transition-colors border-l border-[#415a77]/50 ml-1"
                >
                  Reset
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close (Esc)"
                className="p-2 rounded-lg border border-[#415a77]/60 bg-[#1b263b] hover:bg-destructive/20 text-muted-foreground hover:text-destructive hover:border-destructive/40 cursor-pointer transition-colors ml-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Interactive Canvas */}
          <div
            className={`flex-1 w-full h-full overflow-hidden flex items-center justify-center p-8 select-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 0.1s ease-out",
              }}
              className="mermaid-fullscreen-content mermaid-wrapper mermaid pointer-events-none"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </div>
      )}
    </>
  );
}
