// src/features/linguistic/language-tester/components/quiz/AssessmentQuiz.tsx
/**
 * Interactive multiple-choice quiz rendered from an AssessmentResponse.
 * Lets the user pick an option per question, then checks answers against the
 * backend-provided correct letters and reveals explanations.
 */
"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AssessmentResponse, McqQuestion } from "../../types";

const OPTION_KEYS = ["A", "B", "C", "D"] as const;

export function AssessmentQuiz({ result }: { result: AssessmentResponse }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const selectOption = (questionId: string, letter: string) => {
    if (checked) return;
    setAnswers((current) => ({ ...current, [questionId]: letter }));
  };

  const handleCheck = () => {
    setChecked(true);
  };

  const handleReset = () => {
    setAnswers({});
    setChecked(false);
  };

  const score = result.questions.filter((q) => answers[q.id] === q.correct).length;

  return (
    <div className="space-y-4">
      {result.assessment_title && (
        <header className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">{result.assessment_title}</h2>
          {result.level_rationale && (
            <p className="text-sm text-muted-foreground">{result.level_rationale}</p>
          )}
        </header>
      )}

      {result.questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          question={question}
          index={index}
          selected={answers[question.id]}
          checked={checked}
          onSelect={selectOption}
        />
      ))}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {checked
            ? `Score: ${score} / ${result.questions.length}`
            : "Select an answer for each question, then check."}
        </p>
        {checked ? (
          <Button variant="outline" onClick={handleReset} className="gap-1.5">
            Try Again
          </Button>
        ) : (
          <Button onClick={handleCheck} disabled={result.questions.length === 0}>
            Check Answers
          </Button>
        )}
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: McqQuestion;
  index: number;
  selected: string | undefined;
  checked: boolean;
  onSelect: (questionId: string, letter: string) => void;
}

function QuestionCard({ question, index, selected, checked, onSelect }: QuestionCardProps) {
  const isCorrect = selected === question.correct;
  const answered = selected !== undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base leading-relaxed">
          <span className="mr-2 text-muted-foreground">{index + 1}.</span>
          {question.text}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid gap-2 sm:grid-cols-2">
          {OPTION_KEYS.map((letter) => {
            const text = question.options[letter];
            if (!text) return null;
            const isThisSelected = selected === letter;
            const isThisCorrect = question.correct === letter;
            return (
              <button
                key={letter}
                type="button"
                onClick={() => onSelect(question.id, letter)}
                disabled={checked}
                className={cn(
                  "flex items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  !checked && isThisSelected && "border-primary bg-primary/10",
                  !checked && !isThisSelected && "hover:bg-muted/60",
                  checked && isThisCorrect && "border-emerald-500/50 bg-emerald-500/10",
                  checked && isThisSelected && !isThisCorrect && "border-destructive/50 bg-destructive/10",
                  checked && !isThisSelected && !isThisCorrect && "opacity-60"
                )}
              >
                <span className="mt-0.5 shrink-0 font-mono text-xs text-muted-foreground">
                  {letter}
                </span>
                <span className="min-w-0 flex-1">{text}</span>
                {checked && isThisCorrect && <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />}
                {checked && isThisSelected && !isThisCorrect && (
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                )}
              </button>
            );
          })}
        </div>
        {checked && answered && (
          <div
            className={cn(
              "rounded-lg p-3 text-sm",
              isCorrect
                ? "border border-emerald-500/30 bg-emerald-500/5"
                : "border border-destructive/30 bg-destructive/5"
            )}
          >
            <p className="font-medium">
              {isCorrect ? "Correct" : `Not quite — the answer is ${question.correct}.`}
            </p>
            {question.explanation && (
              <p className="mt-1 text-muted-foreground">{question.explanation}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
