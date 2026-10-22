// src/features/practice/interview/components/session/StageShell.tsx
/**
 * Shared card for every interview loop stage: a step badge, the stage output
 * body, an optional pending banner, the error slot, and the gate action bar
 * (Proceed / Edit / Regenerate buttons rendered by each stage).
 */
"use client";

import type { ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StageShellProps {
  step: string;
  label: string;
  hint?: string;
  children?: ReactNode;
  actions?: ReactNode;
  isPending?: boolean;
  pendingLabel?: string;
  error?: string | null;
}

export function StageShell({
  step,
  label,
  hint,
  children,
  actions,
  isPending,
  pendingLabel,
  error,
}: StageShellProps) {
  return (
    <Card>
      <CardHeader className="space-y-1.5 pb-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            {step}
          </span>
          <CardTitle className="text-base">{label}</CardTitle>
        </div>
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {isPending ? (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {pendingLabel ?? "Working…"}
          </div>
        ) : null}
        {children}
        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}
        {actions ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-3">{actions}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}

/** Small badge used for topic / difficulty / type metadata. */
export function StageBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-xs font-medium text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}
