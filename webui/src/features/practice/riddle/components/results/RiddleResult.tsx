// src/features/practice/riddle/components/results/RiddleResult.tsx
/**
 * Displays the generated riddle, a running history of the user's attempts, and
 * an answer box to keep guessing until the riddle is solved. Each attempt gets
 * feedback plus a thought-redirection nudge; the solution is only revealed
 * after the user has answered.
 */
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownContent } from "@/components/ui/markdown-content";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Eye,
  Lightbulb,
  Loader2,
  RefreshCw,
  Trophy,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RiddleAttempt, RiddleResponse } from "../../types";

interface RiddleResultProps {
  riddle: RiddleResponse;
  attempts: RiddleAttempt[];
  userAnswer: string;
  isPending: boolean;
  error: string | null;
  onAnswerChange: (answer: string) => void;
  onEvaluate: (answer: string) => void;
}

export function RiddleResult({
  riddle,
  attempts,
  userAnswer,
  isPending,
  error,
  onAnswerChange,
  onEvaluate,
}: RiddleResultProps) {
  const [showSolution, setShowSolution] = useState(false);
  const latest = attempts.length > 0 ? attempts[attempts.length - 1] : null;
  const solved = latest?.evaluation.is_correct ?? false;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-start gap-2">
            <Brain className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <MarkdownContent content={riddle.riddle_text} />
          </div>

          <div className="space-y-1.5 rounded-lg border border-border bg-muted/40 p-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Mental hook being trained
            </p>
            <p className="text-sm text-muted-foreground">{riddle.cognitive_trigger}</p>
          </div>

          {attempts.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Your attempts</p>
              <ol className="space-y-1.5">
                {attempts.map((attempt, index) => {
                  const attemptNumber = index + 1;
                  const correct = attempt.evaluation.is_correct;
                  return (
                    <li
                      key={index}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                        correct
                          ? "border-emerald-500/30 bg-emerald-500/10"
                          : "border-border bg-muted/40"
                      )}
                    >
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                        {attemptNumber}
                      </span>
                      {correct ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                      )}
                      <span className="min-w-0 flex-1 truncate">{attempt.answer}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {correct ? "Correct" : "Not quite"}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {latest && (
            <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-3">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium",
                  latest.evaluation.is_correct
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                )}
              >
                {latest.evaluation.is_correct ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {latest.evaluation.is_correct ? "Correct!" : "Not quite"}
              </span>
              <div className="space-y-1.5">
                <p className="text-sm font-semibold">Feedback</p>
                <MarkdownContent content={latest.evaluation.feedback} className="text-sm" />
              </div>
              <div className="space-y-1.5 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm font-semibold">Shift your perspective</p>
                <p className="text-sm">{latest.evaluation.thought_redirection}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowSolution((value) => !value)}
              >
                <Eye className="h-4 w-4" />
                {showSolution ? "Hide solution" : "Reveal solution"}
              </Button>
              {showSolution && (
                <div className="space-y-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <p className="text-sm font-semibold">Solution</p>
                  <MarkdownContent content={riddle.solution} className="text-sm" />
                </div>
              )}
            </div>
          )}

          {solved ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              <Trophy className="h-4 w-4 shrink-0" />
              Solved in {attempts.length} {attempts.length === 1 ? "attempt" : "attempts"} — nice work!
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={userAnswer}
                onChange={(event) => onAnswerChange(event.target.value)}
                placeholder={attempts.length > 0 ? "Try a different answer…" : "Your answer (or ask for a hint)…"}
                disabled={isPending}
                className="min-h-24 resize-none bg-transparent"
              />
              {error && (
                <p role="alert" className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </p>
              )}
              <Button
                type="button"
                size="lg"
                disabled={!userAnswer.trim() || isPending}
                onClick={() => onEvaluate(userAnswer)}
                className="w-full gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking answer…
                  </>
                ) : (
                  <>
                    {attempts.length > 0 ? (
                      <RefreshCw className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {attempts.length > 0 ? "Check again" : "Submit answer"}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
