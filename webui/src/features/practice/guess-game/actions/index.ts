// src/features/practice/guess-game/actions/index.ts
/**
 * Server Actions for the Guess Game API:
 * POST /practice/guess_game/start, /guess, /hint, and /coach.
 */
"use server";

import {
  CoachRequestSchema,
  CoachResponseSchema,
  GameStartFormSchema,
  GameStartRequestSchema,
  GameStartResponseSchema,
  GuessRequestSchema,
  GuessResponseSchema,
  HintRequestSchema,
  HintResponseSchema,
  type CoachRequest,
  type CoachResponse,
  type GameStartFormValues,
  type GameStartRequest,
  type GameStartResponse,
  type GuessRequest,
  type GuessResponse,
  type HintRequest,
  type HintResponse,
} from "../types";
import { postJson, safeParse, practiceApiUrl } from "../../lib/api";

export async function startGameAction(input: GameStartFormValues): Promise<GameStartResponse> {
  safeParse(GameStartFormSchema, input, "Invalid game start request");

  const payload: GameStartRequest = {
    category: input.category,
    difficulty: input.difficulty,
  };
  if (input.vocabulary_theme.trim()) payload.vocabulary_theme = input.vocabulary_theme.trim();
  safeParse(GameStartRequestSchema, payload, "Invalid game start payload");

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/guess_game", "start"),
    payload
  );
  return safeParse(GameStartResponseSchema, raw, "Invalid game start response");
}

export async function guessAction(input: GuessRequest): Promise<GuessResponse> {
  safeParse(GuessRequestSchema, input, "Invalid guess request");

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/guess_game", "guess"),
    input
  );
  return safeParse(GuessResponseSchema, raw, "Invalid guess response");
}

export async function hintAction(input: HintRequest): Promise<HintResponse> {
  safeParse(HintRequestSchema, input, "Invalid hint request");

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/guess_game", "hint"),
    input
  );
  return safeParse(HintResponseSchema, raw, "Invalid hint response");
}

export async function coachAction(input: CoachRequest): Promise<CoachResponse> {
  safeParse(CoachRequestSchema, input, "Invalid coach request");

  const raw = await postJson<unknown>(
    practiceApiUrl("/practice/guess_game", "coach"),
    input
  );
  return safeParse(CoachResponseSchema, raw, "Invalid coach response");
}
