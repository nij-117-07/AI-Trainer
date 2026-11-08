// src/features/guess-game/lib/normalize.ts
/** Turns raw model output into the typed game results. Empty or malformed fields never crash the UI. */
import type { CoachResult, GameSetupResult, GuessResult, HintResult } from "../types";
import { clampUnit, isTrue, textOf } from "./text";

export function normalizeSetup(
  raw: { mysteryItem?: unknown; funFact?: unknown; firstHint?: unknown },
  maxGuesses: number,
): GameSetupResult {
  const mysteryItem = textOf(raw.mysteryItem);
  if (!mysteryItem) throw new Error("The model did not pick a mystery item. Please try again.");
  return {
    mysteryItem,
    funFact: textOf(raw.funFact),
    firstHint: textOf(raw.firstHint),
    maxGuesses,
  };
}

export function normalizeHint(raw: { newHint?: unknown; hintEncouragement?: unknown }): HintResult {
  const hint = textOf(raw.newHint);
  if (!hint) throw new Error("The model did not return a hint. Please try again.");
  return { hint, encouragement: textOf(raw.hintEncouragement) };
}

export function normalizeGuess(raw: {
  isCorrect?: unknown;
  feedback?: unknown;
  closenessScore?: unknown;
  suggestion?: unknown;
}): GuessResult {
  return {
    correct: isTrue(raw.isCorrect),
    feedback: textOf(raw.feedback),
    closeness: clampUnit(raw.closenessScore),
    suggestion: textOf(raw.suggestion),
  };
}

export function normalizeCoach(raw: {
  coachingMessage?: unknown;
  thinkingFramework?: unknown;
  partialReveal?: unknown;
  askForHint?: unknown;
}): CoachResult {
  return {
    coaching: textOf(raw.coachingMessage),
    framework: textOf(raw.thinkingFramework),
    partialReveal: textOf(raw.partialReveal) || null,
    shouldHint: isTrue(raw.askForHint),
  };
}
