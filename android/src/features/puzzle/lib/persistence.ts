/** Storage keys and saved-draft helpers for the Puzzle Generator. */
import { DEFAULT_PUZZLE_FORM } from "../options";
import type { PuzzleFormValues } from "../types";
import { CHOICE_MAX, USER_INSTRUCTIONS_MAX } from "./validate";
import { isRecord } from "./text";

export const PUZZLE_FORM_KEY = "practice.puzzle.form.v1";
export const PUZZLE_ROUND_KEY = "practice.puzzle.round.v1";

function choiceOf(value: unknown, fallback: string): string {
  const text = typeof value === "string" ? value.trim().slice(0, CHOICE_MAX) : "";
  return text || fallback;
}

/** Keeps saved fields, including custom choices. Empty or damaged fields fall back field by field. */
export function parseSavedForm(saved: unknown): PuzzleFormValues {
  if (!isRecord(saved)) return DEFAULT_PUZZLE_FORM;
  return {
    fieldOfInterest:
      typeof saved.fieldOfInterest === "string" ? saved.fieldOfInterest : DEFAULT_PUZZLE_FORM.fieldOfInterest,
    puzzleType: choiceOf(saved.puzzleType, DEFAULT_PUZZLE_FORM.puzzleType),
    targetDomain: choiceOf(saved.targetDomain, DEFAULT_PUZZLE_FORM.targetDomain),
    difficultyLevel: choiceOf(saved.difficultyLevel, DEFAULT_PUZZLE_FORM.difficultyLevel),
    userInstructions:
      typeof saved.userInstructions === "string" ? saved.userInstructions.slice(0, USER_INSTRUCTIONS_MAX) : "",
  };
}
