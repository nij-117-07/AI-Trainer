// src/features/practice/joke-coach/components/ModeLayout.tsx
/**
 * Two-column layout for a single Joke Coach mode: form (left) + result (right),
 * with a draft status header.
 */
"use client";

import type { ReactNode } from "react";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";

interface ModeLayoutProps {
  status: "idle" | "saving" | "saved";
  onReset: () => void;
  onClear: () => void;
  disabled: boolean;
  form: ReactNode;
  result: ReactNode;
}

export function ModeLayout({ status, onReset, onClear, disabled, form, result }: ModeLayoutProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DraftStatus status={status} onReset={onReset} onClear={onClear} disabled={disabled} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>{form}</div>
        <div>{result}</div>
      </div>
    </div>
  );
}
