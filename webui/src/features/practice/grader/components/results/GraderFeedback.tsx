// src/features/practice/grader/components/results/GraderFeedback.tsx
/**
 * Presentational grader output: score bar, objective status, analysis,
 * strengths, weaknesses, and constructive feedback. Shared between the
 * standalone Performance Grader page and the Theoretical question page.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { cn } from "@/lib/utils";
import { AlertTriangle, Check, CheckCircle2, Target, XCircle } from "lucide-react";
import type { GradingResponse } from "../../types";

function scoreTone(score: number): { color: string; text: string } {
  if (score >= 7) return { color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 4) return { color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" };
  return { color: "bg-red-500", text: "text-red-600 dark:text-red-400" };
}

export function GraderFeedback({ result }: { result: GradingResponse }) {
  const tone = scoreTone(result.score);

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-baseline gap-1">
            <span className={cn("text-3xl font-bold tabular-nums", tone.text)}>
              {result.score.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">/ 10</span>
          </div>
          <div className="min-w-[140px] flex-1">
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", tone.color)}
                style={{ width: `${Math.max(4, result.score * 10)}%` }}
              />
            </div>
          </div>
          {result.is_target_met ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Objective met
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400">
              <XCircle className="h-4 w-4" />
              Objective not met
            </span>
          )}
        </div>

        {result.combined_analysis.trim() && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Analysis</h3>
            <MarkdownContent content={result.combined_analysis} />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {result.strengths.length > 0 && (
            <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <Check className="h-4 w-4 text-emerald-500" />
                Strengths
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {result.strengths.map((strength) => (
                  <li key={strength}>{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {result.weaknesses.length > 0 && (
            <div className="space-y-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Weaknesses
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {result.weaknesses.map((weakness) => (
                  <li key={weakness}>{weakness}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {result.detailed_feedback.trim() && (
          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>{result.detailed_feedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
