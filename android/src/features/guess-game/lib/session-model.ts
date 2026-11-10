// src/features/guess-game/lib/session-model.ts
/**
 * Pure rules for a running game: starting it, recording guesses, hints and coaching, and reading a
 * saved game back from the device. Nothing here touches storage or the network.
 */
import { CATEGORY_MAX_LENGTH } from "../options";
import { GAME_DIFFICULTIES } from "../types";
import type {
  CoachResult,
  GameDifficulty,
  GameSetupResult,
  GuessGameSession,
  GuessResult,
  HintResult,
} from "../types";
import { isRecord } from "./guard";

export function startSession(
  setup: GameSetupResult,
  category: string,
  difficulty: GameDifficulty,
): GuessGameSession {
  return {
    category,
    difficulty,
    mysteryItem: setup.mysteryItem,
    funFact: setup.funFact,
    hints: [{ hint: setup.firstHint, encouragement: "" }],
    maxGuesses: setup.maxGuesses,
    attempts: [],
    solved: false,
    coaching: null,
  };
}

export function guessesLeft(session: GuessGameSession): number {
  return Math.max(0, session.maxGuesses - session.attempts.length);
}

export function recordGuess(session: GuessGameSession, guess: string, result: GuessResult): GuessGameSession {
  return {
    ...session,
    attempts: [...session.attempts, { guess, result }],
    solved: result.correct,
  };
}

export function recordHint(session: GuessGameSession, result: HintResult): GuessGameSession {
  return {
    ...session,
    hints: [...session.hints, { hint: result.hint, encouragement: result.encouragement }],
  };
}

export function recordCoaching(session: GuessGameSession, result: CoachResult): GuessGameSession {
  return { ...session, coaching: result };
}

const isString = (value: unknown): value is string => typeof value === "string";

function isGuessResult(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.correct === "boolean" &&
    isString(value.feedback) &&
    typeof value.closeness === "number" &&
    isString(value.suggestion)
  );
}

function isHint(value: unknown): boolean {
  return isRecord(value) && isString(value.hint) && isString(value.encouragement);
}

function isAttempt(value: unknown): boolean {
  return isRecord(value) && isString(value.guess) && isGuessResult(value.result);
}

function isCoach(value: unknown): boolean {
  return (
    isRecord(value) &&
    isString(value.coaching) &&
    isString(value.framework) &&
    (value.partialReveal === null || isString(value.partialReveal)) &&
    typeof value.shouldHint === "boolean"
  );
}

/** Accepts a saved game only when every field has the expected type. Anything else starts fresh. */
export function parseSavedSession(value: unknown): GuessGameSession | null {
  if (!isRecord(value)) return null;
  const valid =
    isString(value.category) &&
    value.category.trim() !== "" &&
    value.category.length <= CATEGORY_MAX_LENGTH &&
    (GAME_DIFFICULTIES as readonly unknown[]).includes(value.difficulty) &&
    isString(value.mysteryItem) &&
    value.mysteryItem.trim() !== "" &&
    isString(value.funFact) &&
    Array.isArray(value.hints) &&
    value.hints.every(isHint) &&
    typeof value.maxGuesses === "number" &&
    Array.isArray(value.attempts) &&
    value.attempts.every(isAttempt) &&
    typeof value.solved === "boolean" &&
    (value.coaching === null || isCoach(value.coaching));
  if (!valid) return null;
  return {
    category: value.category as string,
    difficulty: value.difficulty as GameDifficulty,
    mysteryItem: value.mysteryItem as string,
    funFact: value.funFact as string,
    hints: value.hints as GuessGameSession["hints"],
    maxGuesses: value.maxGuesses as number,
    attempts: value.attempts as GuessGameSession["attempts"],
    solved: value.solved as boolean,
    coaching: value.coaching as CoachResult | null,
  };
}
