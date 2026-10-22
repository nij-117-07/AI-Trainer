// src/features/practice/puzzle/components/pages/PuzzlePage.tsx
/**
 * Puzzle Generator page: generate a personalized cognitive puzzle, answer it,
 * and see your accuracy, feedback, and a metacognitive nudge.
 */
"use client";

import { useRef } from "react";
import { Puzzle } from "lucide-react";
import { ExplainerPageShell } from "@/features/learning/explainer/components/ExplainerPageShell";
import { DraftStatus } from "@/features/learning/explainer/components/DraftStatus";
import { FormActions } from "@/features/learning/explainer/components/FormActions";
import { EmptyResult } from "@/features/learning/explainer/components/EmptyResult";
import { InputField, SelectField } from "@/features/learning/explainer/components/fields";
import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { usePersistedState } from "@/features/learning/explainer/hooks/usePersistedState";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { generatePuzzleAction, evaluatePuzzleAction } from "../../actions";
import {
  PuzzleFormSchema,
  type PuzzleEvaluationRequest,
  type PuzzleEvaluationResponse,
  type PuzzleFormValues,
  type PuzzleResponse,
  type PuzzleRound,
} from "../../types";
import { cognitiveDomainOptions, difficultyLevelOptions, puzzleTypeOptions } from "../../lib/options";
import { PuzzleResult } from "../results/PuzzleResult";

const STORAGE_KEY = "practice.puzzle.form.v1";
const ROUND_KEY = "practice.puzzle.round.v2";

const DEFAULTS: PuzzleFormValues = {
  field_of_interest: "Ancient Egypt",
  puzzle_type: "logic grid",
  target_domain: "lateral",
  difficulty_level: "intermediate",
};

export function PuzzlePage() {
  const persisted = usePersistedForm<PuzzleFormValues, PuzzleResponse>({
    schema: PuzzleFormSchema,
    storageKey: STORAGE_KEY,
    defaults: DEFAULTS,
  });
  const round = usePersistedState<PuzzleRound | null>({
    key: ROUND_KEY,
    initialValue: null,
  });
  const generate = useToolRequest<PuzzleFormValues, PuzzleResponse>({
    run: generatePuzzleAction,
    onSuccess: (result) => {
      evaluate.reset();
      round.setValue({ puzzle: result, attempts: [], userAnswer: "" });
    },
  });
  const pendingAnswerRef = useRef("");
  const evaluate = useToolRequest<PuzzleEvaluationRequest, PuzzleEvaluationResponse>({
    run: evaluatePuzzleAction,
    onSuccess: (result) => {
      const answer = pendingAnswerRef.current;
      pendingAnswerRef.current = "";
      round.setValue((current) => {
        if (!current) return current;
        return {
          ...current,
          attempts: [...current.attempts, { answer, evaluation: result }],
          userAnswer: "",
        };
      });
    },
  });

  const errors = persisted.form.formState.errors;

  const handleEvaluate = (answer: string) => {
    const current = round.value;
    if (!current || !answer.trim()) return;
    const { puzzle } = current;
    const trimmed = answer.trim();
    pendingAnswerRef.current = trimmed;
    round.setValue({ ...current, userAnswer: trimmed });
    evaluate.execute({
      puzzle_context: puzzle.puzzle_text,
      puzzle_type: puzzleTypeOf(puzzle),
      official_solution: puzzle.solution,
      user_response: trimmed,
    });
  };

  const handleNewPuzzle = () => {
    evaluate.reset();
    round.setValue(null);
    persisted.resetDraft();
  };

  const handleAnswerChange = (answer: string) => {
    const current = round.value;
    if (current) round.setValue({ ...current, userAnswer: answer });
  };

  return (
    <ExplainerPageShell
      title="Puzzle Generator"
      description="Generate a personalized cognitive puzzle — riddle, logic grid, sequence, wordplay, or cipher — then keep guessing until you crack it and get scored on each attempt."
      headerAction={
        <DraftStatus
          status={persisted.status}
          onReset={handleNewPuzzle}
          onClear={handleNewPuzzle}
          disabled={generate.isPending || evaluate.isPending}
        />
      }
      form={
        <form onSubmit={persisted.form.handleSubmit(generate.execute)} className="space-y-4">
          <InputField
            label="Field of Interest"
            htmlFor="puzzle_topic"
            placeholder="e.g. Cyberpunk, Ancient Egypt, Quantum Physics"
            disabled={generate.isPending}
            {...persisted.form.register("field_of_interest")}
            error={errors.field_of_interest?.message}
          />
          <SelectField
            label="Puzzle Type"
            name="puzzle_type"
            htmlFor="puzzle_type"
            control={persisted.form.control}
            options={puzzleTypeOptions}
            disabled={generate.isPending}
            error={errors.puzzle_type?.message}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              label="Cognitive Domain"
              name="target_domain"
              htmlFor="puzzle_domain"
              control={persisted.form.control}
              options={cognitiveDomainOptions}
              disabled={generate.isPending}
              error={errors.target_domain?.message}
            />
            <SelectField
              label="Difficulty"
              name="difficulty_level"
              htmlFor="puzzle_difficulty"
              control={persisted.form.control}
              options={difficultyLevelOptions}
              disabled={generate.isPending}
              error={errors.difficulty_level?.message}
            />
          </div>
          <FormActions
            isPending={generate.isPending}
            error={generate.error}
            submitLabel="Generate puzzle"
            submitPendingLabel="Crafting the puzzle…"
          />
        </form>
      }
      result={
        round.value ? (
          <PuzzleResult
            puzzle={round.value.puzzle}
            attempts={round.value.attempts}
            userAnswer={round.value.userAnswer}
            isPending={evaluate.isPending}
            error={evaluate.error}
            onAnswerChange={handleAnswerChange}
            onEvaluate={handleEvaluate}
          />
        ) : (
          <EmptyResult
            icon={Puzzle}
            title="No puzzle yet"
            description="Pick a topic, puzzle type, and difficulty, then generate your first puzzle."
          />
        )
      }
    />
  );
}

function puzzleTypeOf(puzzle: PuzzleResponse): "riddle" | "logic grid" | "sequence" | "wordplay" | "cipher" {
  const text = puzzle.puzzle_text.toLowerCase();
  if (text.includes("logic grid")) return "logic grid";
  if (text.includes("sequence")) return "sequence";
  if (text.includes("wordplay")) return "wordplay";
  if (text.includes("cipher")) return "cipher";
  return "riddle";
}
