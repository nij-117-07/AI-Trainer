// src/features/tools/diagram/components/results/MermaidPreview.tsx
/**
 * Renders Mermaid diagram code into an interactive preview: drag to pan,
 * scroll wheel / buttons to zoom, plus PNG and SVG download buttons.
 * Rendered fully client-side via the `mermaid` package.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageDown, Loader2, Maximize2, Minus, Plus, FileDown } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MIN_SCALE = 0.1;
const MAX_SCALE = 5;

let mermaidInitialized = false;

async function getMermaid() {
  const mermaid = (await import("mermaid")).default;
  if (!mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: "default",
    });
    mermaidInitialized = true;
  }
  return mermaid;
}

const clamp = (value: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

interface RenderState {
  code: string;
  status: "ready" | "error";
  error?: string;
}

interface ViewState {
  x: number;
  y: number;
  scale: number;
}

export function MermaidPreview({ code }: { code: string }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const renderCounter = useRef(0);
  const panStart = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);

  const [renderState, setRenderState] = useState<RenderState>({ code: "", status: "ready" });
  const [view, setView] = useState<ViewState>({ x: 0, y: 0, scale: 1 });

  const fitView = useCallback(() => {
    const viewport = viewportRef.current;
    const svg = svgContainerRef.current?.querySelector("svg");
    if (!viewport || !svg) return;

    const viewBox = svg.viewBox.baseVal;
    const svgWidth = viewBox && viewBox.width > 0 ? viewBox.width : svg.clientWidth;
    const svgHeight = viewBox && viewBox.height > 0 ? viewBox.height : svg.clientHeight;
    if (!svgWidth || !svgHeight) return;

    const pad = 24;
    const scale = clamp(Math.min((viewport.clientWidth - pad * 2) / svgWidth, (viewport.clientHeight - pad * 2) / svgHeight));
    setView({
      scale,
      x: (viewport.clientWidth - svgWidth * scale) / 2,
      y: (viewport.clientHeight - svgHeight * scale) / 2,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const container = svgContainerRef.current;
    if (container) container.innerHTML = "";
    if (!code.trim()) return;

    (async () => {
      try {
        const mermaid = await getMermaid();
        renderCounter.current += 1;
        const { svg } = await mermaid.render(`mermaid-diagram-${renderCounter.current}`, code);
        if (cancelled) return;
        if (svgContainerRef.current) svgContainerRef.current.innerHTML = svg;
        fitView();
        setRenderState({ code, status: "ready" });
      } catch (err) {
        if (cancelled) return;
        setRenderState({
          code,
          status: "error",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, fitView]);

  const zoomAt = useCallback((px: number, py: number, factor: number) => {
    setView((prev) => {
      const scale = clamp(prev.scale * factor);
      const k = scale / prev.scale;
      return {
        scale,
        x: px - (px - prev.x) * k,
        y: py - (py - prev.y) * k,
      };
    });
  }, []);

  const zoomIn = useCallback(() => {
    const viewport = viewportRef.current;
    const rect = viewport?.getBoundingClientRect();
    zoomAt(rect ? rect.width / 2 : 0, rect ? rect.height / 2 : 0, 1.25);
  }, [zoomAt]);

  const zoomOut = useCallback(() => {
    const viewport = viewportRef.current;
    const rect = viewport?.getBoundingClientRect();
    zoomAt(rect ? rect.width / 2 : 0, rect ? rect.height / 2 : 0, 0.8);
  }, [zoomAt]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(event.clientX - rect.left, event.clientY - rect.top, event.deltaY < 0 ? 1.15 : 0.87);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    panStart.current = { x: event.clientX, y: event.clientY, vx: view.x, vy: view.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!panStart.current) return;
    setView((prev) => ({
      ...prev,
      x: panStart.current!.vx + (event.clientX - panStart.current!.x),
      y: panStart.current!.vy + (event.clientY - panStart.current!.y),
    }));
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    panStart.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const downloadSvg = async () => {
    const svg = svgContainerRef.current?.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${xml}`], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `diagram-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = async () => {
    const svg = svgContainerRef.current?.querySelector("svg");
    if (!svg) return;
    const dataUrl = await toPng(svg as unknown as HTMLElement, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#ffffff",
    });
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `diagram-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.png`;
    anchor.click();
  };

  const status =
    renderState.code === code
      ? renderState.status
      : code.trim()
        ? "rendering"
        : "idle";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={zoomOut} disabled={status !== "ready"} aria-label="Zoom out">
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">
            {Math.round(view.scale * 100)}%
          </span>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={zoomIn} disabled={status !== "ready"} aria-label="Zoom in">
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={fitView} disabled={status !== "ready"} aria-label="Fit to view">
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 gap-1.5" onClick={downloadPng} disabled={status !== "ready"}>
            <ImageDown className="h-3.5 w-3.5" />
            PNG
          </Button>
          <Button variant="outline" size="sm" className="h-7 gap-1.5" onClick={downloadSvg} disabled={status !== "ready"}>
            <FileDown className="h-3.5 w-3.5" />
            SVG
          </Button>
        </div>
      </div>

      <div
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={cn(
          "relative h-[480px] w-full touch-none select-none overflow-hidden rounded-lg border border-border bg-white",
          status === "ready" && "cursor-grab active:cursor-grabbing"
        )}
      >
        <div
          className="absolute top-0 left-0"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transformOrigin: "0 0",
          }}
        >
          <div ref={svgContainerRef} className="[&_svg]:max-w-none" />
        </div>

        {status === "rendering" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Rendering diagram…</p>
          </div>
        )}

        {status === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Nothing to render yet.</p>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="max-w-md space-y-1 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm font-medium text-destructive">Could not render this Mermaid code</p>
              <p className="font-mono text-xs text-muted-foreground">{renderState.error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
