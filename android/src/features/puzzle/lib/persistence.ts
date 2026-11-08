// src/features/puzzle/lib/persistence.ts
/** Storage keys and saved-draft helpers for the Puzzle Generator. */
import { DEFAULT_PUZZLE_FORM } from "../options";
import { COGNITIVE_DOMAINS, DIFFICULTY_LEVELS, PUZZLE_TYPES, type PuzzleFormValues } from "../types";
import { isRecord } from "./text";

export const PUZZLE_FORM_KEY = "practice.puzzle.form.v1";
export const PUZZLE_ROUND_KEY = "practice.puzzle.round.v1";

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.find((option) => option === value) ?? fallback;
}

/** Keeps each saved field only when it is valid, so a damaged draft falls back field by field. */
export function parseSavedForm(saved: unknown): PuzzleFormValues {
  if (!isRecord(saved)) return DEFAULT_PUZZLE_FORM;
  return {
    fieldOfInterest:
      typeof saved.fieldOfInterest === "string" ? saved.fieldOfInterest : DEFAULT_PUZZLE_FORM.fieldOfInterest,
    puzzleType: oneOf(saved.puzzleType, PUZZLE_TYPES, DEFAULT_PUZZLE_FORM.puzzleType),
    targetDomain: oneOf(saved.targetDomain, COGNITIVE_DOMAINS, DEFAULT_PUZZLE_FORM.targetDomain),
    difficultyLevel: oneOf(saved.difficultyLevel, DIFFICULTY_LEVELS, DEFAULT_PUZZLE_FORM.difficultyLevel),
  };
}
