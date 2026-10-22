// src/features/tools/ai-detector/components/StepIndicator.tsx
/**
 * Display-only progress header for the AI Detector wizard. Shows the three
 * steps (Detect → Humanize → Re-detect) with done/current/locked states so
 * users know what is available and that later steps unlock via button clicks.
 */
"use client";

import { Check, LockKeyhole, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WizardStep } from "../types";

interface StepMeta {
  key: WizardStep;
  label: string;
  description: string;
}

const STEPS: StepMeta[] = [
  { key: "detect", label: "Detect", description: "Scan text for AI patterns" },
  { key: "humanize", label: "Humanize", description: "Rewrite it naturally" },
  { key: "recheck", label: "Re-detect", description: "Verify the rewrite" },
];

interface StepIndicatorProps {
  step: WizardStep;
  canHumanize: boolean;
  canRecheck: boolean;
  isBusy: boolean;
}

function stepState(
  index: number,
  step: WizardStep,
  canHumanize: boolean,
  canRecheck: boolean
): "done" | "current" | "locked" {
  const currentIndex = STEPS.findIndex((s) => s.key === step);
  if (index < currentIndex) return "done";
  if (index === currentIndex) return "current";
  const unlocked = (index === 1 && canHumanize) || (index === 2 && canRecheck);
  return unlocked ? "done" : "locked";
}

export function StepIndicator({
  step,
  canHumanize,
  canRecheck,
  isBusy,
}: StepIndicatorProps) {
  return (
    <ol className="flex items-start gap-1 rounded-xl border border-border bg-muted/30 p-3">
      {STEPS.map((meta, index) => {
        const state = stepState(index, step, canHumanize, canRecheck);
        const isLast = index === STEPS.length - 1;

        return (
          <li
            key={meta.key}
            className={cn(
              "flex min-w-0 flex-1 items-start gap-2",
              !isLast && "border-r border-border pr-1"
            )}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                state === "done" && "bg-emerald-500/15 text-emerald-600",
                state === "current" && "bg-primary text-primary-foreground",
                state === "locked" && "bg-muted text-muted-foreground/60"
              )}
            >
              {state === "done" ? (
                <Check className="h-3.5 w-3.5" />
              ) : state === "current" && isBusy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : state === "locked" ? (
                <LockKeyhole className="h-3 w-3" />
              ) : (
                index + 1
              )}
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  "block truncate text-xs font-medium",
                  state === "locked" && "text-muted-foreground/60"
                )}
              >
                {meta.label}
              </span>
              <span className="hidden truncate text-[11px] text-muted-foreground sm:block">
                {meta.description}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
