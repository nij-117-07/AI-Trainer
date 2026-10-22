// src/features/practice/interview/components/session/ReviewStage.tsx
/**
 * Stage ④ — Answer reviewer output: five score bars, strengths/weaknesses,
 * missed keywords and the ideal answer. Gate: Proceed (track progress) or
 * Re-review (edit the answer and score it again).
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, RotateCcw, StepForward } from "lucide-react";
import { StageShell, StageBadge } from "./StageShell";
import { useSyncedDraft } from "../../hooks/useSyncedDraft";
import type { AnswerReviewResponse } from "../../types";

const SCORE_ROWS: Array<{ key: keyof AnswerReviewResponse; label: string }> = [
  { key: "overall_score", label: "Overall" },
  { key: "technical_accuracy", label: "Technical accuracy" },
  { key: "completeness", label: "Completeness" },
  { key: "clarity_score", label: "Clarity" },
  { key: "depth_score", label: "Depth" },
];

function BulletList({ title, items, tone }: { title: string; items: string[]; tone: "good" | "bad" }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-sm font-medium">{title}</p>
      <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className={tone === "bad" ? "text-amber-600 dark:text-amber-500" : undefined}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface ReviewStageProps {
  review: AnswerReviewResponse;
  submittedAnswer: string;
  isPending: boolean;
  error: string | null;
  onProceed: () => void;
  onReReview: (answer: string) => void;
}

export function ReviewStage({
  review,
  submittedAnswer,
  isPending,
  error,
  onProceed,
  onReReview,
}: ReviewStageProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useSyncedDraft(submittedAnswer);

  return (
    <StageShell
      step="Step 4"
      label="Reviewer feedback"
      hint={`Recommendation: ${review.recommendation}`}
      isPending={isPending}
      pendingLabel="Scoring again…"
      error={error}
      actions={
        editing ? (
          <>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                onReReview(draft.trim() || submittedAnswer);
                setEditing(false);
              }}
              disabled={isPending || !draft.trim()}
              className="gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              Re-review
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variant="outline" onClick={() => setEditing(true)} disabled={isPending} className="gap-1.5">
              <Pencil className="h-4 w-4" />
              Edit answer
            </Button>
            <Button type="button" onClick={onProceed} disabled={isPending} className="gap-1.5">
              <StepForward className="h-4 w-4" />
              Track progress
            </Button>
          </>
        )
      }
    >
      <div className="space-y-2">
        {SCORE_ROWS.map(({ key, label }) => {
          const value = review[key];
          const numeric = typeof value === "number" ? value : 0;
          const isOverall = key === "overall_score";
          return (
            <div key={key} className={isOverall ? "flex items-center gap-3" : "space-y-1"}>
              <div className="flex w-full items-center justify-between text-sm">
                <span className={isOverall ? "font-semibold" : "text-muted-foreground"}>{label}</span>
                <span className={isOverall ? "text-xl font-bold tabular-nums" : "font-semibold tabular-nums"}>
                  {numeric.toFixed(1)}
                  <span className="text-xs font-normal text-muted-foreground">/10</span>
                </span>
              </div>
              {!isOverall ? (
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, (numeric / 10) * 100)}%` }}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <BulletList title="Strengths" items={review.strengths} tone="good" />
        <BulletList title="Weaknesses" items={review.weaknesses} tone="bad" />
        <BulletList title="Missed keywords" items={review.missed_keywords} tone="bad" />
        <BulletList title="Weak topics identified" items={review.weak_topics_identified} tone="bad" />
      </div>

      {review.red_flags_detected.length > 0 ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="mb-1 text-sm font-medium text-destructive">Red flags detected</p>
          <ul className="list-inside list-disc space-y-0.5 text-sm text-destructive/90">
            {review.red_flags_detected.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {review.follow_up_suggestion ? (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <StageBadge className="border-sky-500/30 bg-sky-500/10 text-sky-600">follow-up</StageBadge>
          {review.follow_up_suggestion}
        </div>
      ) : null}

      {review.improved_answer ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm leading-relaxed">
          <p className="mb-1 font-medium text-emerald-600 dark:text-emerald-500">How an ideal answer looks</p>
          <p className="text-foreground/85">{review.improved_answer}</p>
        </div>
      ) : null}

      {editing ? (
        <div className="space-y-1.5 border-t pt-3">
          <Label htmlFor="review_answer_edit">Your answer</Label>
          <Textarea
            id="review_answer_edit"
            className="min-h-32 resize-y bg-transparent"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        </div>
      ) : null}
    </StageShell>
  );
}
