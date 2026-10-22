// src/features/practice/interview/components/session/AnswerStage.tsx
/**
 * Stage ③ — Candidate answers: a free-text composer for the current question.
 * Submitting sends the answer to /answer/review for scoring.
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import { StageShell } from "./StageShell";
import type { QuestionGenerateResponse } from "../../types";

interface AnswerStageProps {
  question: QuestionGenerateResponse;
  isPending: boolean;
  error: string | null;
  onSubmit: (answer: string) => void;
}

export function AnswerStage({ question, isPending, error, onSubmit }: AnswerStageProps) {
  const [answer, setAnswer] = useState("");
  const canSubmit = answer.trim().length > 0 && !isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(answer.trim());
    setAnswer("");
  };

  return (
    <StageShell
      step="Step 3"
      label="Your answer"
      hint="Take your time — the reviewer scores completeness, depth, clarity and technical accuracy."
      isPending={isPending}
      pendingLabel="Reviewing your answer…"
      error={error}
      actions={
        <Button type="button" onClick={handleSubmit} disabled={!canSubmit} className="gap-1.5">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Submit answer
        </Button>
      }
    >
      <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm font-medium leading-relaxed">
        {question.question}
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="interview_answer">Your response</Label>
        <Textarea
          id="interview_answer"
          className="min-h-40 resize-y bg-transparent"
          placeholder="Type your answer… (Enter submits, Shift+Enter for a new line)"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit();
            }
          }}
          disabled={isPending}
        />
      </div>
    </StageShell>
  );
}
