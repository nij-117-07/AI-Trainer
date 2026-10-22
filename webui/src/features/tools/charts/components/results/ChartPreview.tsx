// src/features/tools/charts/components/results/ChartPreview.tsx
/**
 * Renders generated Chart.js code (a <div>/<canvas>/<script> block) inside a
 * same-origin srcdoc iframe so the chart runs live. The iframe sits in a
 * pan/zoom viewport (drag to pan, scroll wheel / buttons to zoom) with PNG
 * download and copy-to-clipboard. Chart.js is loaded from CDN when the
 * generated snippet does not bundle it.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, ImageDown, Loader2, Maximize2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MIN_SCALE = 0.1;
const MAX_SCALE = 5;
const CHART_CDN = "https://cdn.jsdelivr.net/npm/chart.js@4";

const clamp = (value: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

function buildDocument(code: string): string {
  const hasCdn =
    code.includes("cdn.jsdelivr.net") ||
    code.includes("cdnjs.cloudflare.com") ||
    code.includes("unpkg.com");
  const chartTag = hasCdn ? "" : `<script src="${CHART_CDN}"></script>`;
  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    chartTag,
    "<script>",
    "window.onerror = function (message) {",
    '  parent.postMessage({ type: "chart-error", message: String(message) }, "*");',
    "};",
    "</script>",
    "<style>",
    "html, body { margin: 0; height: 100%; }",
    "body { box-sizing: border-box; display: flex; align-items: center; justify-content: center; padding: 16px; background: #fff; overflow: hidden; }",
    "body > div { width: 100% !important; height: 100% !important; }",
    "</style>",
    "</head>",
    "<body>",
    code,
    "</body>",
    "</html>",
  ].join("\n");
}

interface ViewState {
  x: number;
  y: number;
  scale: number;
}

export function ChartPreview({ code }: { code: string }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const panStart = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<ViewState>({ x: 0, y: 0, scale: 1 });

  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  const [lastCode, setLastCode] = useState(code);
  if (code !== lastCode) {
    setLastCode(code);
    setReady(false);
    setError(null);
    setView({ x: 0, y: 0, scale: 1 });
  }

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

  const fitView = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const pad = 24;
    const scale = clamp(
      Math.min(
        (viewport.clientWidth - pad * 2) / viewport.clientWidth,
        (viewport.clientHeight - pad * 2) / viewport.clientHeight
      )
    );
    setView({
      scale,
      x: (viewport.clientWidth - viewport.clientWidth * scale) / 2,
      y: (viewport.clientHeight - viewport.clientHeight * scale) / 2,
    });
  }, []);

  const handleLoad = useCallback(() => {
    setReady(true);
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc) return;
    const root = doc.documentElement;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const v = viewRef.current;
      zoomAt(
        v.x + event.clientX * v.scale,
        v.y + event.clientY * v.scale,
        event.deltaY < 0 ? 1.15 : 0.87
      );
    };
    const onPointerDown = (event: PointerEvent) => {
      panStart.current = {
        x: event.clientX,
        y: event.clientY,
        vx: viewRef.current.x,
        vy: viewRef.current.y,
      };
      root.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!panStart.current) return;
      setView((prev) => ({
        ...prev,
        x: panStart.current!.vx + (event.clientX - panStart.current!.x),
        y: panStart.current!.vy + (event.clientY - panStart.current!.y),
      }));
    };
    const onPointerEnd = (event: PointerEvent) => {
      panStart.current = null;
      try {
        root.releasePointerCapture(event.pointerId);
      } catch {
        // pointer may already have been released
      }
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerEnd);
    root.addEventListener("pointercancel", onPointerEnd);
  }, [zoomAt]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const iframe = iframeRef.current;
      if (!iframe || event.source !== iframe.contentWindow) return;
      if (typeof event.data !== "object" || event.data === null) return;
      if (event.data.type === "chart-error") {
        setError(String(event.data.message ?? "Failed to render chart"));
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy chart code:", err);
    }
  };

  const handleDownloadPng = () => {
    const doc = iframeRef.current?.contentDocument;
    const canvas = doc?.querySelector("canvas");
    if (!canvas) return;
    const scale = 2;
    const output = document.createElement("canvas");
    output.width = canvas.width * scale;
    output.height = canvas.height * scale;
    const ctx = output.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);
    ctx.drawImage(canvas, 0, 0);
    const anchor = document.createElement("a");
    anchor.href = output.toDataURL("image/png");
    anchor.download = `chart-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.png`;
    anchor.click();
  };

  const hasCode = code.trim().length > 0;
  const status = !hasCode ? "idle" : error ? "error" : ready ? "ready" : "rendering";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={zoomOut}
            disabled={status !== "ready"}
            aria-label="Zoom out"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">
            {Math.round(view.scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={zoomIn}
            disabled={status !== "ready"}
            aria-label="Zoom in"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={fitView}
            disabled={status !== "ready"}
            aria-label="Fit to view"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5"
            onClick={handleDownloadPng}
            disabled={status !== "ready"}
          >
            <ImageDown className="h-3.5 w-3.5" />
            PNG
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5"
            onClick={handleCopy}
            disabled={!hasCode}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className={cn(
          "relative h-[480px] w-full touch-none select-none overflow-hidden rounded-lg border border-border bg-white",
          status === "ready" && "cursor-grab active:cursor-grabbing"
        )}
      >
        {hasCode && (
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
              transformOrigin: "0 0",
            }}
          >
            <iframe
              ref={iframeRef}
              onLoad={handleLoad}
              srcDoc={buildDocument(code)}
              title="Chart.js preview"
              className="h-full w-full border-0 bg-white"
            />
          </div>
        )}

        {status === "rendering" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Rendering chart…</p>
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
              <p className="text-sm font-medium text-destructive">Could not render this chart code</p>
              <p className="font-mono text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
