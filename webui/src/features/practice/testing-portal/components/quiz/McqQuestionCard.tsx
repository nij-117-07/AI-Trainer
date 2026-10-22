// src/features/practice/testing-portal/components/quiz/McqQuestionCard.tsx
/**
 * A single MCQ with instant right/wrong feedback on option click, plus a
 * "Recheck with AI" button that runs the question through the solve-mcq API
 * and renders the model's chosen option + reasoning.
 */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { solveMcqAction } from "../../actions/solveMcq";
import { SolverResult } from "../results/SolverResult";
import type { McqItem, McqSolverResponse, SolverFormValues } from "../../types";

const OPTION_KEYS = ["A", "B", "C", "D"] as const;

interface McqQuestionCardProps {
  index: number;
  question: McqItem;
  selected?: string;
  onSelect: (option: string) => void;
  contextSetting?: string;
}

export function McqQuestionCard({
  index,
  question,
  selected,
  onSelect,
  contextSetting,
}: McqQuestionCardProps) {
  const solver = useToolRequest<SolverFormValues, McqSolverResponse>({
    run: solveMcqAction,
  });

  const revealed = selected !== undefined;
  const isCorrect = revealed && selected === question.correct_answer;

  const recheckWithAI = () => {
    solver.execute({
      question: question.question_text,
      context: contextSetting ?? "",
      options: {
        A: question.options.A,
        B: question.options.B,
        C: question.options.C,
        D: question.options.D,
      },
    });
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <MarkdownContent content={question.question_text} className="!prose-sm" />
            {revealed &&
              (isCorrect ? (
                <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Correct — {question.correct_answer}
                </p>
              ) : (
                <p className="flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
                  <XCircle className="h-4 w-4" />
                  Wrong — correct answer: {question.correct_answer}
                </p>
              ))}
          </div>
        </div>

        <div className="grid gap-2">
          {OPTION_KEYS.map((key) => {
            const isSelected = selected === key;
            const isCorrectOption = revealed && key === question.correct_answer;
            const isWrongPick = revealed && isSelected && key !== question.correct_answer;
            return (
              <button
                key={key}
                type="button"
                disabled={revealed}
                onClick={() => onSelect(key)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  "hover:border-primary/50",
                  revealed && "cursor-default",
                  isCorrectOption && "border-emerald-500/60 bg-emerald-500/10",
                  isWrongPick && "border-red-500/60 bg-red-500/10"
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    isCorrectOption
                      ? "border-emerald-500/60 text-emerald-600 dark:text-emerald-400"
                      : isWrongPick
                        ? "border-red-500/60 text-red-600 dark:text-red-400"
                        : "text-muted-foreground"
                  )}
                >
                  {key}
                </span>
                <span className="flex-1">{question.options[key]}</span>
                {isCorrectOption && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />}
                {isWrongPick && <XCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />}
              </button>
            );
          })}
        </div>

        <div className="space-y-2 border-t border-border pt-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-2"
            disabled={solver.isPending}
            onClick={recheckWithAI}
          >
            {solver.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            {solver.isPending ? "Rechecking with AI…" : "Recheck with AI"}
          </Button>
          {solver.error && (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {solver.error}
            </p>
          )}
          {solver.data && <SolverResult result={solver.data} />}
        </div>
      </CardContent>
    </Card>
  );
}
