// src/features/guess-game/lib/generators.ts
/**
 * Guess Game generators. Each call validates its input, runs one Ax signature with the saved
 * model settings, and returns a normalised result. Calls stop when the AbortSignal fires.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { GUESS_MAX_LENGTH, MAX_GUESSES_BY_DIFFICULTY, THEME_MAX_LENGTH } from "../options";
import {
  GAME_DIFFICULTIES,
  type CoachResult,
  type GameDifficulty,
  type GameSetupFormValues,
  type GameSetupResult,
  type GuessResult,
  type HintResult,
} from "../types";
import { failGuideSignature, gameSetupSignature, guessEvaluatorSignature, hintProviderSignature } from "./signatures";
import { normalizeCoach, normalizeGuess, normalizeHint, normalizeSetup } from "./normalize";
import { optionalText, requireOption, requireText, resolveCategory } from "./validate";

const TEMPERATURE = 0.4;

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new Error("The request was cancelled.");
}

export async function startGame(
  settings: AiSettings,
  values: GameSetupFormValues,
  signal: AbortSignal,
): Promise<GameSetupResult> {
  const category = resolveCategory(values);
  const difficulty = requireOption(values.difficulty, GAME_DIFFICULTIES, "Difficulty");
  const vocabularyTheme = optionalText(values.vocabularyTheme, "Vocabulary theme", THEME_MAX_LENGTH);
  const llm = createLlm(settings);
  throwIfAborted(signal);
  const result = await ax(gameSetupSignature).forward(
    llm,
    { category, difficulty, vocabularyTheme },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  return normalizeSetup(result, MAX_GUESSES_BY_DIFFICULTY[difficulty]);
}

export interface GuessInput {
  mysteryItem: string;
  category: string;
  difficulty: GameDifficulty;
  guess: string;
}

export async function makeGuess(settings: AiSettings, input: GuessInput, signal: AbortSignal): Promise<GuessResult> {
  const guess = requireText(input.guess, "Guess", GUESS_MAX_LENGTH);
  const llm = createLlm(settings);
  throwIfAborted(signal);
  const result = await ax(guessEvaluatorSignature).forward(
    llm,
    {
      mysteryItem: input.mysteryItem,
      category: input.category,
      userGuess: guess,
      difficulty: input.difficulty,
    },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  return normalizeGuess(result);
}

export interface HintInput {
  mysteryItem: string;
  category: string;
  previousHints: string[];
}

export async function requestHint(settings: AiSettings, input: HintInput, signal: AbortSignal): Promise<HintResult> {
  const llm = createLlm(settings);
  throwIfAborted(signal);
  const result = await ax(hintProviderSignature).forward(
    llm,
    {
      mysteryItem: input.mysteryItem,
      category: input.category,
      previousHints: input.previousHints.length > 0 ? input.previousHints.join("\n") : undefined,
      hintNumber: input.previousHints.length + 1,
    },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  return normalizeHint(result);
}

export interface CoachInput {
  mysteryItem: string;
  category: string;
  failedGuesses: string[];
  hintNumber: number;
}

export async function requestCoaching(
  settings: AiSettings,
  input: CoachInput,
  signal: AbortSignal,
): Promise<CoachResult> {
  const llm = createLlm(settings);
  throwIfAborted(signal);
  const result = await ax(failGuideSignature).forward(
    llm,
    {
      mysteryItem: input.mysteryItem,
      category: input.category,
      failedGuesses: input.failedGuesses.length > 0 ? input.failedGuesses.join("\n") : undefined,
      hintNumber: Math.max(1, input.hintNumber),
    },
    { abortSignal: signal, modelConfig: { temperature: TEMPERATURE } },
  );
  return normalizeCoach(result);
}
