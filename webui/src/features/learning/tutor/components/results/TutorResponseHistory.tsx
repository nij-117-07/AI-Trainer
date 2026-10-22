// src/features/learning/tutor/components/results/TutorResponseHistory.tsx
/**
 * Version navigation bar for the Adaptive Tutor results. Lets the user browse
 * previously generated responses (stored in browser localStorage) with
 * prev/next controls and reset the whole version history.
 */
"use client";

import { ChevronLeft, ChevronRight, History, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { TutorResponse } from "../../types";

interface TutorResponseHistoryProps {
  versions: TutorResponse[];
  activeIndex: number;
  onNavigate: (index: number) => void;
  onReset: () => void;
}

export function TutorResponseHistory({
  versions,
  activeIndex,
  onNavigate,
  onReset,
}: TutorResponseHistoryProps) {
  if (versions.length === 0) return null;

  const isFirst = activeIndex <= 0;
  const isLast = activeIndex >= versions.length - 1;

  const handleReset = () => {
    if (window.confirm("Reset all saved responses? This clears your version history.")) {
      onReset();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
      <div className="flex items-center gap-2">
        <History className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium">Responses</span>
        <span className="text-xs tabular-nums text-muted-foreground">
          Version {activeIndex + 1} of {versions.length}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={isFirst}
          aria-label="Previous response version"
          onClick={() => onNavigate(activeIndex - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={isLast}
          aria-label="Next response version"
          onClick={() => onNavigate(activeIndex + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Reset response history"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Reset response history</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
