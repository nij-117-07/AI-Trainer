// src/features/practice/testing-portal/components/quiz/ViewModeToggle.tsx
/**
 * Segmented control that switches between two question view modes:
 * "list" (scroll all questions at once) and "step" (one by one).
 */
"use client";

import { List, Rows3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "list" | "step";

interface ViewModeToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const MODES: { value: ViewMode; label: string }[] = [
  { value: "list", label: "List" },
  { value: "step", label: "One by one" },
];

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Question view"
      className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5"
    >
      {MODES.map(({ value, label }) => {
        const Icon = value === "list" ? List : Rows3;
        const isActive = mode === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
