// src/features/puzzle/lib/normalize.ts
/**
 * Turns raw model output (and saved rounds) into the typed values the screen renders. Numbers are
 * clamped and booleans accept text, as the backend coercers do.
 */
import type { Puzzle, PuzzleAttempt, PuzzleEvaluation, PuzzleRound, PuzzleType } from "../types";
import { booleanOf, isRecord, listOf, numberOf, textOf } from "./text";
import { CHOICE_MAX } from "./validate";

const DEFAULT_ACCURACY = 0.5;

function clamp01(value: unknown): number {
  const parsed = numberOf(value);
  if (parsed === null) return DEFAULT_ACCURACY;
  return Math.min(1, Math.max(0, parsed));
}

export function normalizePuzzle(raw: unknown): Puzzle {
  const r = isRecord(raw) ? raw : {};
  const puzzleText = textOf(r.puzzleText);
  if (!puzzleText) throw new Error("The puzzle came back empty. Try generating again.");
  return {
    puzzlerPersona: textOf(r.puzzlerPersona),
    puzzleText,
    solution: textOf(r.solution),
    cognitiveTrigger: textOf(r.cognitiveTrigger),
  };
}

export function normalizeEvaluation(raw: unknown): PuzzleEvaluation {
  const r = isRecord(raw) ? raw : {};
  const isCorrect = booleanOf(r.isCorrect);
  const hint = textOf(r.hintRedirection);
  return {
    isCorrect,
    accuracyScore: clamp01(r.accuracyScore),
    evaluationFeedback: textOf(r.evaluationFeedback),
    hintRedirection: !isCorrect && hint ? hint : null,
    metacognitivePrompt: textOf(r.metacognitivePrompt),
  };
}

function readAttempt(raw: unknown): PuzzleAttempt | null {
  if (!isRecord(raw) || !isRecord(raw.evaluation)) return null;
  const answer = textOf(raw.answer);
  if (!answer) return null;
  return { answer, evaluation: normalizeEvaluation(raw.evaluation) };
}

function readPuzzleType(value: unknown): PuzzleType {
  return textOf(value).slice(0, CHOICE_MAX) || "riddle";
}

/** Reads a saved round. Returns null when the draft has no usable puzzle. */
export function readRound(raw: unknown): PuzzleRound | null {
  if (!isRecord(raw) || !isRecord(raw.puzzle)) return null;
  const puzzleText = textOf(raw.puzzle.puzzleText);
  if (!puzzleText) return null;
  return {
    puzzle: {
      puzzlerPersona: textOf(raw.puzzle.puzzlerPersona),
      puzzleText,
      solution: textOf(raw.puzzle.solution),
      cognitiveTrigger: textOf(raw.puzzle.cognitiveTrigger),
    },
    puzzleType: readPuzzleType(raw.puzzleType),
    attempts: listOf(raw.attempts)
      .map(readAttempt)
      .filter((attempt): attempt is PuzzleAttempt => attempt !== null),
    userAnswer: typeof raw.userAnswer === "string" ? raw.userAnswer : "",
  };
}
