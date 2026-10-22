// src/features/practice/testing-portal/components/results/TheoreticalResult.tsx
/**
 * Lists generated theoretical questions with "list" and "one by one" (default)
 * view modes. Each card supports answering + AI grading and an "Answer with
 * AI" expert answer. The "Generate more" button refills past-questions and
 * generates a fresh batch.
 */
"use client";

import { useState } from "react";
import { FileQuestion, Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TheoreticalItem, TheoreticalResponse } from "../../types";
import { TheoreticalQuestionCard } from "./TheoreticalQuestionCard";
import { ViewModeToggle, type ViewMode } from "../quiz/ViewModeToggle";
import { StepNavigator } from "../quiz/StepNavigator";

interface TheoreticalResultProps {
  result: TheoreticalResponse;
  contextSetting: string;
  difficultyLevel: string;
  onGenerateMore: () => void;
  isGeneratingMore: boolean;
}

export function TheoreticalResult({
  result,
  contextSetting,
  difficultyLevel,
  onGenerateMore,
  isGeneratingMore,
}: TheoreticalResultProps) {
  const [mode, setMode] = useState<ViewMode>("step");
  const [activeIndex, setActiveIndex] = useState(0);
  const [generation, setGeneration] = useState(0);
  const [prevResult, setPrevResult] = useState(result);

  if (prevResult !== result) {
    setPrevResult(result);
    setGeneration((value) => value + 1);
    setActiveIndex(0);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileQuestion className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">
            {result.questions.length} question{result.questions.length === 1 ? "" : "s"}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ViewModeToggle mode={mode} onChange={setMode} />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-2"
            disabled={isGeneratingMore}
            onClick={onGenerateMore}
          >
            {isGeneratingMore ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="h-4 w-4" />
            )}
            {isGeneratingMore ? "Generating more…" : "Generate more"}
          </Button>
        </div>
      </div>

      {mode === "step" && (
        <StepNavigator
          index={activeIndex}
          total={result.questions.length}
          onPrevious={() => setActiveIndex((index) => Math.max(0, index - 1))}
          onNext={() => setActiveIndex((index) => Math.min(result.questions.length - 1, index + 1))}
        />
      )}

      {result.questions.map((question: TheoreticalItem, index) => (
        <div key={`${generation}-${index}`} hidden={mode === "step" && index !== activeIndex}>
          <TheoreticalQuestionCard
            index={index}
            question={question}
            contextSetting={contextSetting}
            difficultyLevel={difficultyLevel}
            expectedLevel={difficultyLevel}
          />
        </div>
      ))}
    </div>
  );
}
