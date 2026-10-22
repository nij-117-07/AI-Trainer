// src/features/learning/explainer/components/ResultCallout.tsx
/**
 * Small accent callout used by result renderers for key takeaways, cruxes,
 * pedagogical goals, and analogies. Keeps visual consistency across tools.
 */
"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalloutTone = "accent" | "info" | "success" | "warn";

const toneStyles: Record<CalloutTone, string> = {
  accent: "border-primary/30 bg-primary/10",
  info: "border-sky-500/30 bg-sky-500/10",
  success: "border-emerald-500/30 bg-emerald-500/10",
  warn: "border-amber-500/30 bg-amber-500/10",
};

interface ResultCalloutProps {
  icon: LucideIcon;
  title: string;
  tone?: CalloutTone;
  children: React.ReactNode;
}

export function ResultCallout({
  icon: Icon,
  title,
  tone = "accent",
  children,
}: ResultCalloutProps) {
  return (
    <div className={cn("rounded-lg border p-4", toneStyles[tone])}>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Icon className="h-4 w-4 shrink-0" />
        {title}
      </div>
      <div className="mt-1.5 text-sm leading-relaxed text-foreground/85">{children}</div>
    </div>
  );
}
