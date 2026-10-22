// src/features/practice/negotiation/components/results/NegotiationReport.tsx
/**
 * Full performance report for a completed negotiation session.
 */
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import type { EvaluateSessionResponse } from "../../types";

interface NegotiationReportProps {
  report: EvaluateSessionResponse;
  outcome: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  preparation: "Preparation",
  communication: "Communication",
  strategy: "Strategy",
  listening: "Listening",
  problem_solving: "Problem solving",
  flexibility: "Flexibility",
};

export function NegotiationReport({ report, outcome }: NegotiationReportProps) {
  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Trophy className="h-5 w-5 shrink-0 text-primary" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Session score</p>
            <p className="text-2xl font-bold tabular-nums">
              {report.overall_score}
              <span className="text-sm font-normal text-muted-foreground">/100</span>
            </p>
          </div>
          <p className="ml-auto max-w-xs text-right text-sm text-muted-foreground">{outcome}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(report.scores_by_category).map(([key, value]) => (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{CATEGORY_LABELS[key] ?? key}</span>
                <span className="font-semibold tabular-nums">{value}/10</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.min(100, (value / 10) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-1 text-sm font-medium">Strengths</p>
          <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
            {report.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium">Areas for improvement</p>
          <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
            {report.areas_for_improvement.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg bg-muted/50 p-3">
          <p className="mb-1 text-sm font-medium">Key takeaways</p>
          <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
            {report.key_takeaways.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium">Suggested resources</p>
          <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
            {report.suggested_resources.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
