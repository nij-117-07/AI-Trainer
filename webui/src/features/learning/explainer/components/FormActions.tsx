// src/features/learning/explainer/components/FormActions.tsx
/**
 * Shared submit row for Explainer tool forms: renders the async error banner
 * and the submit button with a loading spinner, so every tool has identical
 * visual feedback while a Server Action runs.
 */
"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Wand2 } from "lucide-react";

interface FormActionsProps {
  isPending: boolean;
  disabled?: boolean;
  error?: string | null;
  submitLabel: string;
  submitPendingLabel: string;
}

export function FormActions({
  isPending,
  disabled,
  error,
  submitLabel,
  submitPendingLabel,
}: FormActionsProps) {
  return (
    <div className="space-y-3 pt-2">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive animate-in slide-in-from-top-2"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" size="lg" disabled={disabled || isPending} className="w-full gap-2">
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {submitPendingLabel}
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4" />
            {submitLabel}
          </>
        )}
      </Button>
    </div>
  );
}
