// src/features/learning/explainer/components/ExplainerPageShell.tsx
/**
 * Two-column tool layout (per page_layout.md): sticky form sidebar on the
 * left, result/output panel on the right. Stacks to a single column on mobile.
 */
"use client";

import type { ReactNode } from "react";

interface ExplainerPageShellProps {
  title: string;
  description: string;
  /** Rendered in the page header (e.g. <DraftStatus />). */
  headerAction?: ReactNode;
  /** Left column: the tool's form. Sticky on desktop. */
  form: ReactNode;
  /** Right column: the tool's result / output panel. */
  result: ReactNode;
}

export function ExplainerPageShell({
  title,
  description,
  headerAction,
  form,
  result,
}: ExplainerPageShellProps) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
        {headerAction}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4 lg:sticky lg:top-6 lg:self-start">
          {form}
        </div>
        <div className="min-w-0">{result}</div>
      </div>
    </div>
  );
}
