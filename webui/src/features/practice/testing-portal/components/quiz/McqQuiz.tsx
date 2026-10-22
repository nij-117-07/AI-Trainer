// src/features/practice/testing-portal/components/quiz/McqQuiz.tsx
/**
 * Interactive MCQ quiz with instant right/wrong feedback on every option
 * click. Supports both "list" (scroll) and "one by one" (step) view modes
 * with a live score. All question cards stay mounted so per-question state
 * (selections, AI rechecks) survives mode switching.
 */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCcw, Trophy } from "lucide-react";
import type { McqItem } from "../../types";
import { ViewModeToggle, type ViewMode } from "./ViewModeToggle";
import { StepNavigator } from "./StepNavigator";
import { McqQuestionCard } from "./McqQuestionCard";

interface McqQuizProps {
  questions: McqItem[];
  contextSetting?: string;
}

export function McqQuiz({ questions, contextSetting }: McqQuizProps) {
  const [mode, setMode] = useState<ViewMode>("list");
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [prevQuestions, setPrevQuestions] = useState(questions);

  if (prevQuestions !== questions) {
    setPrevQuestions(questions);
    setActiveIndex(0);
    setAnswers({});
  }

  const score = questions.reduce(
    (total, question, index) => total + (answers[index] === question.correct_answer ? 1 : 0),
    0
  );
  const answeredCount = questions.filter((_, index) => answers[index] !== undefined).length;
  const allAnswered = answeredCount === questions.length;

  const handleSelect = (index: number, option: string) =>
    setAnswers((prev) => ({ ...prev, [index]: option }));

  const handleReset = () => setAnswers({});

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ViewModeToggle mode={mode} onChange={setMode} />
        <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          Score: {score}/{questions.length}
        </span>
      </div>

      {mode === "step" && (
        <StepNavigator
          index={activeIndex}
          total={questions.length}
          onPrevious={() => setActiveIndex((index) => Math.max(0, index - 1))}
          onNext={() => setActiveIndex((index) => Math.min(questions.length - 1, index + 1))}
        />
      )}

      {questions.map((question, index) => (
        <div key={index} hidden={mode === "step" && index !== activeIndex}>
          <McqQuestionCard
            index={index}
            question={question}
            selected={answers[index]}
            onSelect={(option) => handleSelect(index, option)}
            contextSetting={contextSetting}
          />
        </div>
      ))}

      {allAnswered && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Trophy className="h-5 w-5 text-amber-500" />
              You answered {score} of {questions.length} correctly.
            </p>
            <Button type="button" variant="outline" size="sm" onClick={handleReset} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Try again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
