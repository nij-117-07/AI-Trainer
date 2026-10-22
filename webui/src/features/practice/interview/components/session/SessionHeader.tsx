// src/features/practice/interview/components/session/SessionHeader.tsx
/**
 * Session status bar: question counter, countdown, performance trend and the
 * always-available "End interview" control that jumps straight to the report.
 */
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flag, Timer, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InterviewSessionState, PerformanceTrend } from "../../types";

const TREND_META: Record<PerformanceTrend, { label: string; icon: typeof TrendingUp; className: string }> = {
  improving: { label: "Improving", icon: TrendingUp, className: "text-emerald-500" },
  stable: { label: "Stable", icon: Minus, className: "text-sky-500" },
  declining: { label: "Declining", icon: TrendingDown, className: "text-amber-500" },
};

export function SessionHeader({
  state,
  isPending,
  onEnd,
}: {
  state: InterviewSessionState;
  isPending: boolean;
  onEnd: () => void;
}) {
  const trend = TREND_META[state.performance_trend];
  const TrendIcon = trend.icon;
  const minutes = Math.max(0, state.time_remaining_minutes);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
      <Badge variant="secondary" className="tabular-nums">
        Question {Math.min(state.questions_asked + 1, state.setup.max_questions)} of{" "}
        {state.setup.max_questions}
      </Badge>
      <Badge variant="outline" className="gap-1 tabular-nums">
        <Timer className="h-3.5 w-3.5" />
        {minutes} min left
      </Badge>
      <Badge variant="outline" className={cn("gap-1", trend.className)}>
        <TrendIcon className="h-3.5 w-3.5" />
        {trend.label}
      </Badge>
      <span className="ml-auto truncate text-xs text-muted-foreground">
        {state.setup.position_role} · {state.setup.position_level}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onEnd}
        disabled={isPending}
        className="gap-1.5"
      >
        <Flag className="h-3.5 w-3.5" />
        End interview
      </Button>
    </div>
  );
}
