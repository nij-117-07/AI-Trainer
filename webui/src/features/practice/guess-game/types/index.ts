// src/features/practice/guess-game/types/index.ts
/**
 * Zod schemas + TypeScript types for the Guess Game API
 * (Backend/practice/guess_game/api.md).
 */
import { z } from "zod";
import type { PracticeChatMessage } from "@/features/practice/components/chat/types";

export const gameCategories = ["word", "movie", "sentence", "book", "celebrity", "song"] as const;
export const gameDifficulties = ["easy", "medium", "hard", "expert"] as const;
export const GameCategorySchema = z.enum(gameCategories);
export const GameDifficultySchema = z.enum(gameDifficulties);
export type GameCategory = z.infer<typeof GameCategorySchema>;
export type GameDifficulty = z.infer<typeof GameDifficultySchema>;

export const GameStartFormSchema = z.object({
  category: GameCategorySchema.default("word"),
  difficulty: GameDifficultySchema.default("medium"),
  vocabulary_theme: z.string().trim().max(200).default(""),
});
export type GameStartFormValues = z.infer<typeof GameStartFormSchema>;

export const GameStartRequestSchema = z.object({
  category: GameCategorySchema,
  difficulty: GameDifficultySchema,
  vocabulary_theme: z.string().optional(),
});
export type GameStartRequest = z.infer<typeof GameStartRequestSchema>;

export const GameStartResponseSchema = z.object({
  mystery_item: z.string(),
  fun_fact: z.string(),
  first_hint: z.string(),
  max_guesses: z.number().int().min(1),
  message: z.string(),
  status: z.string().default("success"),
});
export type GameStartResponse = z.infer<typeof GameStartResponseSchema>;

export const HintRequestSchema = z.object({
  mystery_item: z.string().min(1),
  category: GameCategorySchema,
  previous_hints: z.array(z.string()).default([]),
});
export type HintRequest = z.infer<typeof HintRequestSchema>;

export const HintResponseSchema = z.object({
  hint: z.string(),
  encouragement: z.string(),
  hints_used: z.array(z.string()),
  status: z.string().default("success"),
});
export type HintResponse = z.infer<typeof HintResponseSchema>;

export const GuessRequestSchema = z.object({
  mystery_item: z.string().min(1),
  category: GameCategorySchema,
  difficulty: GameDifficultySchema,
  guess: z.string().min(1),
});
export type GuessRequest = z.infer<typeof GuessRequestSchema>;

export const GuessResponseSchema = z.object({
  correct: z.boolean(),
  feedback: z.string(),
  closeness: z.number().min(0).max(1),
  suggestion: z.string(),
  status: z.string().default("success"),
});
export type GuessResponse = z.infer<typeof GuessResponseSchema>;

export const CoachRequestSchema = z.object({
  mystery_item: z.string().min(1),
  category: GameCategorySchema,
  failed_guesses: z.array(z.string()),
  hint_number: z.number().int().min(1),
});
export type CoachRequest = z.infer<typeof CoachRequestSchema>;

export const CoachResponseSchema = z.object({
  coaching: z.string(),
  framework: z.string(),
  partial_reveal: z.string().nullable().optional(),
  should_hint: z.boolean(),
  status: z.string().default("success"),
});
export type CoachResponse = z.infer<typeof CoachResponseSchema>;

/** Persisted client-side session state for a running game. */
export interface GuessGameSession {
  category: GameCategory;
  difficulty: GameDifficulty;
  mystery_item: string;
  fun_fact: string;
  hints: string[];
  maxGuesses: number;
  guesses: string[];
  solved: boolean;
  log: PracticeChatMessage[];
}
