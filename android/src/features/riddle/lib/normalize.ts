// src/features/riddle/lib/normalize.ts
/**
 * Turns raw model output and saved drafts into the typed values the screens use. Missing or
 * wrongly typed fields fall back to empty values instead of crashing.
 */
import { CHOICE_MAX, DEFAULT_FORM, USER_INSTRUCTIONS_MAX } from "../options";
import type { RiddleAttempt, RiddleContent, RiddleEvaluation, RiddleFormValues, RiddleRound } from "../types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function listOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Reads a boolean that the model may return as text, such as "true" or "yes". */
export function coerceBool(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  return ["true", "1", "yes", "y"].includes(String(value ?? "").trim().toLowerCase());
}

export function normalizeRiddle(raw: { riddleText?: unknown; solution?: unknown; cognitiveTrigger?: unknown }): RiddleContent {
  const riddle = {
    riddleText: textOf(raw.riddleText),
    solution: textOf(raw.solution),
    cognitiveTrigger: textOf(raw.cognitiveTrigger),
  };
  if (!riddle.riddleText || !riddle.solution) {
    throw new Error("The model did not return a complete riddle. Please try again.");
  }
  return riddle;
}

export function normalizeEvaluation(raw: {
  isCorrect?: unknown;
  feedback?: unknown;
  thoughtRedirection?: unknown;
}): RiddleEvaluation {
  return {
    isCorrect: coerceBool(raw.isCorrect),
    feedback: textOf(raw.feedback),
    thoughtRedirection: textOf(raw.thoughtRedirection),
  };
}

/** Keeps saved draft fields, including custom choices. Empty or damaged fields use the default. */
export function sanitizeForm(saved: unknown): RiddleFormValues {
  if (!isRecord(saved)) return DEFAULT_FORM;
  const fieldOfInterest = typeof saved.fieldOfInterest === "string" ? saved.fieldOfInterest : DEFAULT_FORM.fieldOfInterest;
  const targetDomain = choiceOf(saved.targetDomain, DEFAULT_FORM.targetDomain);
  const difficultyLevel = choiceOf(saved.difficultyLevel, DEFAULT_FORM.difficultyLevel);
  const userInstructions = typeof saved.userInstructions === "string" ? saved.userInstructions.slice(0, USER_INSTRUCTIONS_MAX) : "";
  return { fieldOfInterest, targetDomain, difficultyLevel, userInstructions };
}

function choiceOf(value: unknown, fallback: string): string {
  const text = typeof value === "string" ? value.trim().slice(0, CHOICE_MAX) : "";
  return text || fallback;
}

export function sanitizeRound(saved: unknown): RiddleRound | null {
  if (!isRecord(saved) || !isRecord(saved.riddle)) return null;
  const riddle = normalizeSavedRiddle(saved.riddle);
  if (!riddle) return null;
  const attempts = listOf(saved.attempts).filter(isRecord).map(normalizeSavedAttempt).filter(isAttempt);
  return { riddle, attempts, userAnswer: textOf(saved.userAnswer) };
}

function normalizeSavedRiddle(raw: Record<string, unknown>): RiddleContent | null {
  const riddleText = textOf(raw.riddleText);
  const solution = textOf(raw.solution);
  if (!riddleText || !solution) return null;
  return { riddleText, solution, cognitiveTrigger: textOf(raw.cognitiveTrigger) };
}

function normalizeSavedAttempt(raw: Record<string, unknown>): RiddleAttempt | null {
  if (!isRecord(raw.evaluation)) return null;
  return {
    answer: textOf(raw.answer),
    evaluation: normalizeEvaluation(raw.evaluation),
  };
}

function isAttempt(value: RiddleAttempt | null): value is RiddleAttempt {
  return value !== null;
}
