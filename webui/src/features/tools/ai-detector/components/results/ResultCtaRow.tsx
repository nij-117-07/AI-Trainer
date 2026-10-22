// src/features/tools/ai-detector/components/results/ResultCtaRow.tsx
/**
 * Footer row for result cards that holds the explicit button(s) advancing the
 * wizard (e.g. "Continue to Humanize"). Keeps CTA placement consistent.
 */
"use client";

import type { ReactNode } from "react";

export function ResultCtaRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-end">
      {children}
    </div>
  );
}
