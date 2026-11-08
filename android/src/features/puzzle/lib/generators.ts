// src/features/puzzle/lib/generators.ts
/**
 * Puzzle Generator calls: create a personalised puzzle, and evaluate one answer attempt. Mirrors
 * PuzzleService in Backend/practice/puzzle/services.py, with the same temperature.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { Puzzle, PuzzleEvaluation, PuzzleFormValues, PuzzleType } from "../types";
import { normalizeEvaluation, normalizePuzzle } from "./normalize";
import { adaptivePuzzleSignature, puzzleEvaluatorSignature } from "./signatures";
import {
  ANSWER_MAX,
  PUZZLE_TEXT_MAX,
  TOPIC_MAX,
  requireCognitiveDomain,
  requireDifficulty,
  requirePuzzleType,
  requireText,
} from "./validate";

const TEMPERATURE = 0.7;
const SEED_RANGE = 1_000_000;

export interface EvaluationRequest {
  puzzle: Puzzle;
  puzzleType: PuzzleType;
  answer: string;
}

export async function generatePuzzle(
  settings: AiSettings,
  values: PuzzleFormValues,
  signal?: AbortSignal,
): Promise<Puzzle> {
  const fieldOfInterest = requireText(values.fieldOfInterest, "Field of interest", TOPIC_MAX);
  const puzzleType = requirePuzzleType(values.puzzleType);
  const targetDomain = requireCognitiveDomain(values.targetDomain);
  const difficultyLevel = requireDifficulty(values.difficultyLevel);
  throwIfCancelled(signal, "Puzzle generation cancelled.");

  const llm = createLlm(settings);
  const result = await ax(adaptivePuzzleSignature).forward(
    llm,
    {
      fieldOfInterest,
      puzzleType,
      targetDomain,
      difficultyLevel,
      seed: Math.floor(Math.random() * SEED_RANGE),
    },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  return normalizePuzzle(result);
}

export async function evaluatePuzzleAttempt(
  settings: AiSettings,
  request: EvaluationRequest,
  signal?: AbortSignal,
): Promise<PuzzleEvaluation> {
  const answer = requireText(request.answer, "Your answer", ANSWER_MAX);
  const puzzleContext = requireText(request.puzzle.puzzleText, "Puzzle", PUZZLE_TEXT_MAX);
  const officialSolution = request.puzzle.solution.trim();
  if (!officialSolution) throw new Error("This puzzle has no stored solution. Generate a new puzzle.");
  throwIfCancelled(signal, "Evaluation cancelled.");

  const llm = createLlm(settings);
  const result = await ax(puzzleEvaluatorSignature).forward(
    llm,
    {
      puzzleContext,
      puzzleType: request.puzzleType,
      officialSolution,
      userResponse: answer,
    },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  return normalizeEvaluation(result);
}

function throwIfCancelled(signal: AbortSignal | undefined, message: string): void {
  if (signal?.aborted) throw new Error(message);
}
