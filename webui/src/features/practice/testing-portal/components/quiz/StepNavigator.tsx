// src/features/practice/testing-portal/components/quiz/StepNavigator.tsx
/**
 * Prev/next controls with a progress bar used by the "one by one" view mode.
 */
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepNavigatorProps {
  index: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function StepNavigator({ index, total, onPrevious, onNext }: StepNavigatorProps) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-2">
      <Button type="button" variant="ghost" size="sm" onClick={onPrevious} disabled={isFirst}>
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      <div className="text-center">
        <p className="text-xs font-medium text-muted-foreground">
          Question {index + 1} of {total}
        </p>
        <div className="mt-1 h-1 w-24 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onNext} disabled={isLast}>
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
