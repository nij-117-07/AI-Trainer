// src/features/learning/explainer/components/DraftStatus.tsx
/**
 * Shows the localStorage save status for a tool draft and exposes
 * "Reset to defaults" and "Clear draft" controls so users always know their
 * inputs are being saved locally.
 */
"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Loader2, RotateCcw, Trash2 } from "lucide-react";
import type { PersistStatus } from "../hooks/usePersistedState";

interface DraftStatusProps {
  status: PersistStatus;
  onReset: () => void;
  onClear: () => void;
  disabled?: boolean;
}

export function DraftStatus({ status, onReset, onClear, disabled }: DraftStatusProps) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5">
      {status === "saving" ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Saving draft…</span>
        </>
      ) : status === "saved" ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-xs text-muted-foreground">Draft saved locally</span>
        </>
      ) : (
        <span className="text-xs text-muted-foreground">Local draft</span>
      )}

      <span aria-hidden className="mx-0.5 h-3 w-px bg-border" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            onClick={onReset}
            aria-label="Reset form to defaults"
          >
            <RotateCcw />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Reset to defaults</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            onClick={onClear}
            aria-label="Clear saved draft"
          >
            <Trash2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Clear saved draft</TooltipContent>
      </Tooltip>
    </div>
  );
}
