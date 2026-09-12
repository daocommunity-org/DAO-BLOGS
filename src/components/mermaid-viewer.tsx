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
    theme: "dark",
    fontFamily: font,
    flowchart: {
      look: "classic",
      htmlLabels: true,
      curve: "linear",
      padding: 24,
      nodeSpacing: 45,
      rankSpacing: 45,
      useMaxWidth: true,
    },
    themeVariables: {
      darkMode: true,
      background: "transparent",
      fontFamily: font,
      fontSize: "13px",
      mainBkg: "#222e45",
      nodeBkg: "#222e45",
      nodeTextColor: "#ffffff",
      nodeBorder: "#415a77",
      primaryColor: "#222e45",
      primaryTextColor: "#ffffff",
      primaryBorderColor: "#415a77",
      lineColor: "#778da9",
      secondaryColor: "#1b263b",
      tertiaryColor: "#1b263b",
      edgeLabelBackground: "#162032",
    },
  });
}

interface MermaidViewerProps {
  chart: string;
  className?: string;
}

function wrapEdgeLabels(diagramCode: string): string {
  // 1) Pipe syntax: -->|text| or -.->|text| or ==>|text| or --> |text|
  let res = diagramCode.replace(/([=-]+>|--\>|-\.->|==>|--)\s*\|([^|\n]+)\|/g, (match, arrow, label) => {
    let clean = label.trim();
    if (/<br\s*\/?>/i.test(clean)) return match;
    const hasQuotes = clean.startsWith('"') && clean.endsWith('"');
    if (hasQuotes) clean = clean.slice(1, -1);
    const words = clean.split(/\s+/);
    if (words.length >= 2) {
      const wrapped = words.length === 2 ? words.join("<br/>") : words.join("<br/>");
      return `${arrow.trim()}|"${wrapped}"|`;
    }
    return match;
  });

  // 2) Dash syntax: -- text --> or -- "text" -->
  res = res.replace(/--\s+([A-Za-z0-9&/ _-]+?)\s+-->/g, (match, label) => {
    let clean = label.trim();
    if (/<br\s*\/?>/i.test(clean)) return match;
    const hasQuotes = clean.startsWith('"') && clean.endsWith('"');
    if (hasQuotes) clean = clean.slice(1, -1);
    const words = clean.split(/\s+/);
    if (words.length >= 2) {
      const wrapped = words.join("<br/>");
      return `-->|"${wrapped}"|`;
    }
    return match;
  });

  return res;
}

function adjustClusterLabels(svgString: string): string {
  if (typeof window === "undefined" || !window.DOMParser) {
    return svgString;
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svg = doc.querySelector("svg");
    if (!svg) return svgString;

    const clusters = doc.querySelectorAll("g.cluster");
    const clusterLabels: Element[] = [];

    clusters.forEach((cluster) => {
      const rect = cluster.querySelector("rect");
      const label = cluster.querySelector("g.cluster-label");
      if (rect && label) {
        const rectX = parseFloat(rect.getAttribute("x") || "0");
        const rectY = parseFloat(rect.getAttribute("y") || "0");
        label.setAttribute("transform", `translate(${rectX + 16}, ${rectY - 10})`);
        clusterLabels.push(label);
      }
    });

    if (clusterLabels.length > 0) {
      const edgePaths = doc.querySelector("g.edges, g.edgePaths");
      const elevatedGroup = doc.createElementNS("http://www.w3.org/2000/svg", "g");
      elevatedGroup.setAttribute("class", "cluster-labels-elevated");

      clusterLabels.forEach((label) => {
        elevatedGroup.appendChild(label);
      });

      if (edgePaths && edgePaths.parentNode) {
        edgePaths.parentNode.insertBefore(elevatedGroup, edgePaths.nextSibling);
      } else {
        svg.appendChild(elevatedGroup);
      }
    }

    return new XMLSerializer().serializeToString(doc);
  } catch (err) {
    console.error("Error adjusting cluster labels:", err);
    return svgString;
  }
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
        const processedChart = wrapEdgeLabels(chart);
        const { svg: renderedSvg } = await mermaid.render(id, processedChart);
        const finalSvg = adjustClusterLabels(renderedSvg);
        if (isMounted) {
          setSvg(finalSvg);
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

  const modalCanvasRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation & body scroll locking when modal is open
  useEffect(() => {
    if (!isOpen) return;

    // Lock background page scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

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

    // Non-passive wheel event listener to strictly prevent page scroll
    const canvasEl = modalCanvasRef.current;
    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY * -0.0015;
      setScale((s) => Math.min(Math.max(s + delta, 0.4), 4));
    };

    if (canvasEl) {
      canvasEl.addEventListener("wheel", handleNativeWheel, { passive: false });
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (canvasEl) {
        canvasEl.removeEventListener("wheel", handleNativeWheel);
      }
    };
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
      <div className="p-4 my-4 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive overflow-x-auto">
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
          className={`mermaid mermaid-wrapper w-full max-w-full p-6 rounded-xl overflow-hidden cursor-zoom-in transition-all duration-200 hover:border-[#1fb6ff]/40 text-center ${className}`}
          dangerouslySetInnerHTML={{ __html: svg }}
          title="Click to expand diagram in fullscreen viewer"
        />

        {/* Top-Right Expand Badge */}
        <button
          type="button"
          onClick={handleOpen}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1b263b]/90 border border-[#415a77] text-xs text-muted-foreground hover:text-foreground hover:border-[#1fb6ff] shadow-lg backdrop-blur-sm cursor-pointer z-10"
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
          <div className="w-full px-6 py-3 border-b border-border/40 bg-background/90 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">
                Diagram
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline-block">
                Scroll to zoom, drag to pan
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-border/60 bg-card/60 p-0.5 gap-0.5">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out (-)"
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors text-sm font-medium"
                >
                  −
                </button>

                <span className="px-2 text-xs text-foreground min-w-[46px] text-center font-medium">
                  {Math.round(scale * 100)}%
                </span>

                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In (+)"
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors text-sm font-medium"
                >
                  +
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset (0)"
                  className="px-2.5 h-7 flex items-center justify-center rounded-md hover:bg-muted text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors border-l border-border/40 ml-0.5"
                >
                  Reset
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close (Esc)"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-border/60 bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors ml-1 text-xs"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Interactive Canvas */}
          <div
            ref={modalCanvasRef}
            className={`flex-1 w-full h-full overflow-hidden flex items-center justify-center p-8 select-none overscroll-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
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
              className="mermaid-fullscreen-content mermaid mermaid-wrapper flex items-center justify-center pointer-events-none"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </div>
      )}
    </>
  );
}
