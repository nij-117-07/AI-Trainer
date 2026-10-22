// src/features/practice/debate/components/results/DebateVerdict.tsx
/**
 * The judge's verdict for a completed debate.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Trophy, ThumbsUp, ThumbsDown, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JudgeResponse } from "../../types";

export function DebateVerdict({ verdict }: { verdict: JudgeResponse }) {
  const winnerLabel =
    verdict.winner === "tie" ? "Tie" : verdict.winner === "pro" ? "Pro wins" : "Con wins";

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">{winnerLabel}</p>
          </div>
          <p className="text-sm tabular-nums">
            <span className="font-semibold">Pro {verdict.pro_score}</span>
            <span className="mx-1.5 text-muted-foreground">–</span>
            <span className="font-semibold">{verdict.con_score} Con</span>
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <ThumbsUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Strongest argument</p>
              <p className={cn("capitalize", verdict.strongest_argument.side)}>
                <span className="font-medium">{verdict.strongest_argument.side}:</span>{" "}
                {verdict.strongest_argument.claim}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <ThumbsDown className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Weakest argument</p>
              <p className={cn("capitalize", verdict.weakest_argument.side)}>
                <span className="font-medium">{verdict.weakest_argument.side}:</span>{" "}
                {verdict.weakest_argument.claim}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-3 text-sm">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Scale className="h-3.5 w-3.5" />
            Reasoning
          </p>
          {verdict.reasoning}
        </div>

        <p className="text-sm text-muted-foreground">{verdict.judge_comments}</p>
      </CardContent>
    </Card>
  );
}
