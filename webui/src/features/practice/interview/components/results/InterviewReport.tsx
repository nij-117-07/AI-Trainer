// src/features/practice/interview/components/results/InterviewReport.tsx
/**
 * Stage ⑥ — Final report built client-side from the finished session
 * (progress_state + session_history). Acts as a placeholder until a backend
 * /report endpoint exists — swap buildInterviewReport for that call then.
 */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag, RotateCcw, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { buildInterviewReport } from "../../lib/report";
import type { InterviewSessionState, PerformanceTrend } from "../../types";

const TREND_META: Record<PerformanceTrend, { label: string; icon: typeof TrendingUp; className: string }> = {
  improving: { label: "Improving", icon: TrendingUp, className: "text-emerald-500" },
  stable: { label: "Stable", icon: Minus, className: "text-sky-500" },
  declining: { label: "Declining", icon: TrendingDown, className: "text-amber-500" },
};

function ChipList({ items, tone }: { items: string[]; tone: "good" | "bad" | "info" }) {
  const styles = {
    good: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
    bad: "border-amber-500/30 bg-amber-500/10 text-amber-600",
    info: "border-sky-500/30 bg-sky-500/10 text-sky-600",
  } as const;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.length === 0 ? (
        <span className="text-sm text-muted-foreground">None recorded.</span>
      ) : (
        items.map((item) => (
          <Badge key={item} variant="outline" className={styles[tone]}>
            {item}
          </Badge>
        ))
      )}
    </div>
  );
}

function ScoreBreakdown({ title, scores }: { title: string; scores: Record<string, number> }) {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{title}</p>
      <div className="space-y-1.5">
        {entries.map(([label, score]) => (
          <div key={label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate text-muted-foreground">{label}</span>
              <span className="font-semibold tabular-nums">{score.toFixed(1)}/10</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, (score / 10) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InterviewReport({
  state,
  onRestart,
}: {
  state: InterviewSessionState;
  onRestart: () => void;
}) {
  const report = buildInterviewReport(state);
  const trend = TREND_META[report.performance_trend];
  const TrendIcon = trend.icon;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Final score</p>
              <p className="text-3xl font-bold tabular-nums">
                {report.overall_score.toFixed(1)}
                <span className="text-sm font-normal text-muted-foreground">/10</span>
              </p>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                {report.questions_answered}/{report.max_questions} questions answered
              </p>
              <p>
                Started {new Date(report.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {" · "}Finished {new Date(report.finished_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <Badge variant="outline" className={`ml-auto gap-1 ${trend.className}`}>
              <TrendIcon className="h-3.5 w-3.5" />
              {trend.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <ScoreBreakdown title="Topic scores" scores={report.topic_scores} />
          <ScoreBreakdown title="Question type scores" scores={report.type_scores} />
          <div>
            <p className="mb-1.5 text-sm font-medium">Strong areas</p>
            <ChipList items={report.strong_areas} tone="good" />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium">Weak areas</p>
            <ChipList items={report.weak_areas} tone="bad" />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium">Topics covered</p>
            <ChipList items={report.topics_covered} tone="info" />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium">Recommended next topics</p>
            <ChipList items={report.recommended_next_topics} tone="info" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Question log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {report.history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No questions were answered.</p>
          ) : (
            report.history.map((entry, index) => (
              <div key={`${entry.question}-${index}`} className="space-y-2 border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">
                    {index + 1}. {entry.question}
                  </p>
                  <Badge variant="secondary" className="shrink-0 tabular-nums">
                    {entry.review.overall_score.toFixed(1)}/10
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                  <Badge variant="outline">{entry.topic}</Badge>
                  <Badge variant="outline">{entry.difficulty}</Badge>
                  <Badge variant="outline">{entry.review.recommendation}</Badge>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{entry.answer}</p>
                {entry.review.weaknesses.length > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">To improve:</span>{" "}
                    {entry.review.weaknesses.join("; ")}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button" onClick={onRestart} className="gap-1.5">
          <RotateCcw className="h-4 w-4" />
          New interview
        </Button>
      </div>
      <p className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
        <Flag className="h-3.5 w-3.5" />
        Report generated from your session profile — a dedicated report endpoint may replace this later.
      </p>
    </div>
  );
}
