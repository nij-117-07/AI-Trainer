// src/features/practice/interview/components/session/ProgressStage.tsx
/**
 * Stage ⑤ — Progress tracker output: the merged performance profile, trend and
 * score breakdowns. Gate: Proceed (next loop iteration) or Undo (revert the
 * merge and go back to the review stage).
 */
"use client";

import { Button } from "@/components/ui/button";
import { Undo2, StepForward } from "lucide-react";
import { StageShell, StageBadge } from "./StageShell";
import type { InterviewSessionState, PerformanceTrend } from "../../types";

const TREND_COPY: Record<PerformanceTrend, string> = {
  improving: "Your answers are trending upward — keep the momentum.",
  stable: "Performance is steady across questions so far.",
  declining: "Recent answers scored lower — consider slowing down and structuring responses.",
};

function stringsOf(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function numbersOf(value: unknown): Array<[string, number]> {
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>)
    .filter((entry): entry is [string, number] => typeof entry[1] === "number")
    .sort((a, b) => b[1] - a[1]);
}

function ScoreBars({ title, entries }: { title: string; entries: Array<[string, number]> }) {
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

interface ProgressStageProps {
  state: InterviewSessionState;
  isPending: boolean;
  error: string | null;
  onProceed: () => void;
  onUndo: () => void;
}

export function ProgressStage({ state, isPending, error, onProceed, onUndo }: ProgressStageProps) {
  const profile = state.progress_state;
  const overall =
    typeof profile.overall_score === "number" ? profile.overall_score : null;
  const answered = typeof profile.questions_answered === "number" ? profile.questions_answered : 0;
  const trend = state.performance_trend;

  return (
    <StageShell
      step="Step 5"
      label="Performance profile updated"
      hint={TREND_COPY[trend]}
      isPending={isPending}
      pendingLabel="Updating your profile…"
      error={error}
      actions={
        <>
          <Button type="button" variant="outline" onClick={onUndo} disabled={isPending} className="gap-1.5">
            <Undo2 className="h-4 w-4" />
            Undo
          </Button>
          <Button type="button" onClick={onProceed} disabled={isPending} className="gap-1.5">
            <StepForward className="h-4 w-4" />
            Next question
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
        <div>
          <p className="text-xs text-muted-foreground">Running score</p>
          <p className="text-2xl font-bold tabular-nums">
            {overall !== null ? overall.toFixed(1) : "—"}
            <span className="text-sm font-normal text-muted-foreground">/10</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Answered</p>
          <p className="text-2xl font-bold tabular-nums">
            {answered}
            <span className="text-sm font-normal text-muted-foreground">/{state.setup.max_questions}</span>
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <StageBadge className="border-primary/30 bg-primary/10 text-primary">{trend}</StageBadge>
          {typeof profile.confidence_level === "string" ? (
            <StageBadge>confidence: {profile.confidence_level}</StageBadge>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ScoreBars title="Topic scores" entries={numbersOf(profile.topic_scores)} />
        <ScoreBars title="Question type scores" entries={numbersOf(profile.type_scores)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-sm font-medium">Strong areas</p>
          <div className="flex flex-wrap gap-1.5">
            {stringsOf(profile.strong_areas).length ? (
              stringsOf(profile.strong_areas).map((area) => (
                <StageBadge key={area} className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
                  {area}
                </StageBadge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">None recorded yet.</span>
            )}
          </div>
        </div>
        <div>
          <p className="mb-1 text-sm font-medium">Weak areas</p>
          <div className="flex flex-wrap gap-1.5">
            {stringsOf(profile.weak_areas).length ? (
              stringsOf(profile.weak_areas).map((area) => (
                <StageBadge key={area} className="border-amber-500/30 bg-amber-500/10 text-amber-600">
                  {area}
                </StageBadge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">None recorded yet.</span>
            )}
          </div>
        </div>
      </div>
    </StageShell>
  );
}
