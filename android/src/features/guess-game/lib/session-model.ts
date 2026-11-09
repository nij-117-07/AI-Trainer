// src/features/guess-game/lib/session-model.ts
/**
 * Pure rules for a running game: starting it, recording guesses, hints and coaching, and
 * reading a saved game back from the device. Nothing here touches storage or the network.
 */
import { CUSTOM_CATEGORY_MAX_LENGTH } from "../options";
import { GAME_DIFFICULTIES } from "../types";
import type {
  CoachResult,
  GameDifficulty,
  GameMessage,
  GameSetupResult,
  GuessGameSession,
  GuessResult,
  HintResult,
} from "../types";

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
    hints: [setup.firstHint],
    maxGuesses: setup.maxGuesses,
    guesses: [],
    solved: false,
    log: [
      {
        role: "assistant",
        content: `**New game!** Category: ${category} · Difficulty: ${difficulty}\n\n**First hint:** ${setup.firstHint}`,
      },
    ],
  };
}

export function guessesLeft(session: GuessGameSession): number {
  return Math.max(0, session.maxGuesses - session.guesses.length);
}

export function recordGuess(session: GuessGameSession, guess: string, result: GuessResult): GuessGameSession {
  const content = result.correct
    ? `${result.feedback}\n\n**Correct!** The answer was **${session.mysteryItem}**.\n\n**Fun fact:** ${session.funFact}`
    : `${result.feedback}\n\n*Nudge: ${result.suggestion}*`;
  return {
    ...session,
    guesses: [...session.guesses, guess],
    solved: result.correct,
    log: [...session.log, { role: "user", content: guess }, { role: "assistant", content }],
  };
}

export function recordHint(session: GuessGameSession, result: HintResult): GuessGameSession {
  const hints = [...session.hints, result.hint];
  return {
    ...session,
    hints,
    log: [
      ...session.log,
      {
        role: "assistant",
        content: `**Hint ${hints.length}:** ${result.hint}\n\n${result.encouragement}`,
      },
    ],
  };
}

export function recordCoaching(session: GuessGameSession, result: CoachResult): GuessGameSession {
  const parts = [`**Coaching:** ${result.coaching}`, `**Framework:** ${result.framework}`];
  if (result.partialReveal) parts.push(`**Partial reveal:** ${result.partialReveal}`);
  return {
    ...session,
    log: [...session.log, { role: "assistant", content: parts.join("\n\n") }],
  };
}

function isMessage(value: unknown): value is GameMessage {
  if (typeof value !== "object" || value === null) return false;
  const message = value as Record<string, unknown>;
  return (message.role === "user" || message.role === "assistant") && typeof message.content === "string";
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

/** Accepts a saved game only when every field has the expected type. Anything else starts fresh. */
export function parseSavedSession(value: unknown): GuessGameSession | null {
  if (typeof value !== "object" || value === null) return null;
  const saved = value as Record<string, unknown>;
  const valid =
    typeof saved.category === "string" &&
    saved.category.trim() !== "" &&
    saved.category.length <= CUSTOM_CATEGORY_MAX_LENGTH &&
    (GAME_DIFFICULTIES as readonly unknown[]).includes(saved.difficulty) &&
    typeof saved.mysteryItem === "string" &&
    saved.mysteryItem.trim() !== "" &&
    typeof saved.funFact === "string" &&
    isStringArray(saved.hints) &&
    typeof saved.maxGuesses === "number" &&
    isStringArray(saved.guesses) &&
    typeof saved.solved === "boolean" &&
    Array.isArray(saved.log) &&
    saved.log.every(isMessage);
  if (!valid) return null;
  return {
    category: saved.category as string,
    difficulty: saved.difficulty as GameDifficulty,
    mysteryItem: saved.mysteryItem as string,
    funFact: saved.funFact as string,
    hints: saved.hints as string[],
    maxGuesses: saved.maxGuesses as number,
    guesses: saved.guesses as string[],
    solved: saved.solved as boolean,
    log: saved.log as GameMessage[],
  };
}
