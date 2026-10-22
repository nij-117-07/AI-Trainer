// src/features/practice/testing-portal/components/results/McqResult.tsx
/**
 * Header + interactive quiz for generated MCQs. The "Generate more" button
 * refills the form's past-questions field with the current questions and
 * generates a fresh batch.
 */
"use client";

import { ListChecks, Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { McqResponse } from "../../types";
import { McqQuiz } from "../quiz/McqQuiz";

interface McqResultProps {
  result: McqResponse;
  contextSetting?: string;
  onGenerateMore: () => void;
  isGeneratingMore: boolean;
}

export function McqResult({
  result,
  contextSetting,
  onGenerateMore,
  isGeneratingMore,
}: McqResultProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">
            {result.questions.length} question{result.questions.length === 1 ? "" : "s"}
          </h2>
        </div>
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
      <McqQuiz questions={result.questions} contextSetting={contextSetting} />
    </div>
  );
}
