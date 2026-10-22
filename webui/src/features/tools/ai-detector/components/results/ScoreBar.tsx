// src/features/tools/ai-detector/components/results/ScoreBar.tsx
/**
 * Colored 0–1 score meter shared by the detection and humanize result cards.
 * "risk" colors high values as danger (AI likelihood); "confidence" colors
 * high values as success (pass-as-human confidence).
 */
"use client";

import { cn } from "@/lib/utils";

interface ScoreBarProps {
  value: number;
  label: string;
  caption?: string;
  variant: "risk" | "confidence";
}

function barColor(variant: "risk" | "confidence", value: number): string {
  if (variant === "risk") {
    if (value >= 0.7) return "bg-destructive";
    if (value >= 0.4) return "bg-amber-500";
    return "bg-emerald-500";
  }
  if (value >= 0.7) return "bg-emerald-500";
  if (value >= 0.4) return "bg-amber-500";
  return "bg-destructive";
}

export function ScoreBar({ value, label, caption, variant }: ScoreBarProps) {
  const clamped = Math.min(1, Math.max(0, value));
  const percent = Math.round(clamped * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-lg font-bold tabular-nums">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor(variant, clamped))}
          style={{ width: `${percent}%` }}
        />
      </div>
      {caption && <p className="text-xs text-muted-foreground">{caption}</p>}
    </div>
  );
}
