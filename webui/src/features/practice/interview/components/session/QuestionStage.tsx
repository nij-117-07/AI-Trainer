// src/features/practice/interview/components/session/QuestionStage.tsx
/**
 * Stage ② — Question generator output: the crafted question plus reviewer
 * calibration data. Gate: Proceed (answer it), Edit question (override the
 * wording), or Regenerate (ask the backend for another take).
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, RotateCcw, StepForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { StageShell, StageBadge } from "./StageShell";
import { useSyncedDraft } from "../../hooks/useSyncedDraft";
import type { QuestionGenerateResponse } from "../../types";

interface QuestionStageProps {
  question: QuestionGenerateResponse;
  isPending: boolean;
  error: string | null;
  onProceed: (question: string) => void;
  onRegenerate: () => void;
}

function CalibrationBlock({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-muted/30">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm font-medium hover:bg-muted/60"
      >
        {title}
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="px-3 pb-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
      ) : null}
    </div>
  );
}

export function QuestionStage({
  question,
  isPending,
  error,
  onProceed,
  onRegenerate,
}: QuestionStageProps) {
  const [draft, setDraft] = useSyncedDraft(question.question);

  return (
    <StageShell
      step="Step 2"
      label="Interview question"
      isPending={isPending}
      pendingLabel="Crafting the question…"
      error={error}
      actions={
        <>
          <Button type="button" variant="outline" onClick={onRegenerate} disabled={isPending} className="gap-1.5">
            <RotateCcw className="h-4 w-4" />
            Regenerate
          </Button>
          <Button
            type="button"
            onClick={() => onProceed(draft.trim() || question.question)}
            disabled={isPending || !draft.trim()}
            className="gap-1.5"
          >
            <StepForward className="h-4 w-4" />
            Proceed to answer
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap gap-2">
        <StageBadge>{question.topic || "general"}</StageBadge>
        <StageBadge>{question.difficulty}</StageBadge>
        {question.expected_keywords.slice(0, 5).map((keyword) => (
          <StageBadge key={keyword} className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
            {keyword}
          </StageBadge>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="question_edit">Question wording</Label>
        <Textarea
          id="question_edit"
          className="min-h-24 resize-none bg-transparent text-lg font-medium leading-relaxed"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          Edit the generated question directly, or proceed with it as written.
        </p>
      </div>

      <div className="space-y-2">
        <CalibrationBlock title="Evaluation criteria">{question.evaluation_criteria}</CalibrationBlock>
        {question.red_flags.length > 0 ? (
          <CalibrationBlock title={`Red flags (${question.red_flags.length})`}>
            <ul className="list-inside list-disc space-y-0.5">
              {question.red_flags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          </CalibrationBlock>
        ) : null}
        {question.sample_strong_answer ? (
          <CalibrationBlock title="What a strong answer looks like">
            {question.sample_strong_answer}
          </CalibrationBlock>
        ) : null}
        {question.sample_weak_answer ? (
          <CalibrationBlock title="What a weak answer looks like">
            {question.sample_weak_answer}
          </CalibrationBlock>
        ) : null}
      </div>
    </StageShell>
  );
}
