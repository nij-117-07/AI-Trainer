// src/features/linguistic/language-tester/components/quiz/FibQuiz.tsx
/**
 * Interactive fill-in-the-blank quiz rendered from a FibResponse. Each
 * question lets the user type an answer and check it against the backend
 * evaluation endpoint, showing correctness, feedback, and a grammar tip.
 */
"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { EvaluationResponse, FibQuestion, FibResponse } from "../../types";
import { fibEvaluateAction } from "../../actions/fib";

export function FibQuiz({ result }: { result: FibResponse }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, EvaluationResponse>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (question: FibQuestion) => {
    const userAnswer = (answers[question.sentence] ?? "").trim();
    if (!userAnswer || pendingId) return;
    setPendingId(question.sentence);
    setError(null);
    try {
      const evaluation = await fibEvaluateAction({
        sentence_context: question.sentence,
        correct_word: question.correct_word,
        user_answer: userAnswer,
      });
      setFeedback((current) => ({ ...current, [question.sentence]: evaluation }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check your answer.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {result.questions.map((question, index) => {
        const evaluation = feedback[question.sentence];
        const isChecking = pendingId === question.sentence;
        return (
          <Card key={question.sentence}>
            <CardHeader>
              <CardTitle className="text-base leading-relaxed">
                <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                {question.sentence}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {question.hint && (
                <p className="text-xs text-muted-foreground">Hint: {question.hint}</p>
              )}
              {question.context_clue && (
                <p className="text-xs italic text-muted-foreground">
                  {question.context_clue}
                </p>
              )}
              <div className="flex items-end gap-2">
                <Input
                  className="flex-1 bg-transparent"
                  placeholder="Type your answer…"
                  value={answers[question.sentence] ?? ""}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [question.sentence]: event.target.value,
                    }))
                  }
                  disabled={!!evaluation || isChecking}
                />
                <Button
                  variant="outline"
                  onClick={() => void handleCheck(question)}
                  disabled={!!evaluation || isChecking || !(answers[question.sentence] ?? "").trim()}
                  className="gap-1.5"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking…
                    </>
                  ) : evaluation ? (
                    "Checked"
                  ) : (
                    "Check"
                  )}
                </Button>
              </div>
              {evaluation && (
                <div
                  className={cn(
                    "space-y-1 rounded-lg border p-3 text-sm",
                    evaluation.is_correct
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-destructive/30 bg-destructive/5"
                  )}
                >
                  <p className="flex items-center gap-1.5 font-medium">
                    {evaluation.is_correct ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <X className="h-4 w-4 text-destructive" />
                    )}
                    {evaluation.status === "typo"
                      ? "Almost! Small typo."
                      : evaluation.is_correct
                        ? "Correct"
                        : "Not quite."}
                  </p>
                  {evaluation.feedback && (
                    <p className="text-muted-foreground">{evaluation.feedback}</p>
                  )}
                  {evaluation.improvement_tip && (
                    <p className="text-xs text-muted-foreground">
                      Tip: {evaluation.improvement_tip}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
