// src/features/practice/puzzle/types/index.ts
/**
 * Zod schemas + TypeScript types for the Puzzle Generator API
 * (Backend/practice/puzzle/api.md).
 */
import { z } from "zod";

export const puzzleTypes = ["riddle", "logic grid", "sequence", "wordplay", "cipher"] as const;
export const cognitiveDomains = ["verbal", "mathematical", "spatial", "lateral"] as const;
export const difficultyLevels = ["novice", "intermediate", "expert", "genius"] as const;
export const PuzzleTypeSchema = z.enum(puzzleTypes);
export const CognitiveDomainSchema = z.enum(cognitiveDomains);
export const DifficultyLevelSchema = z.enum(difficultyLevels);
export type PuzzleType = z.infer<typeof PuzzleTypeSchema>;
export type CognitiveDomain = z.infer<typeof CognitiveDomainSchema>;
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;

export const PuzzleFormSchema = z.object({
  field_of_interest: z.string().trim().min(1, "Topic is required").max(200),
  puzzle_type: PuzzleTypeSchema.default("riddle"),
  target_domain: CognitiveDomainSchema.default("lateral"),
  difficulty_level: DifficultyLevelSchema.default("intermediate"),
});
export type PuzzleFormValues = z.infer<typeof PuzzleFormSchema>;

export const PuzzleRequestSchema = z.object({
  field_of_interest: z.string().min(1),
  puzzle_type: PuzzleTypeSchema,
  target_domain: CognitiveDomainSchema,
  difficulty_level: DifficultyLevelSchema,
});
export type PuzzleRequest = z.infer<typeof PuzzleRequestSchema>;

export const PuzzleResponseSchema = z.object({
  puzzler_persona: z.string(),
  puzzle_text: z.string(),
  solution: z.string(),
  cognitive_trigger: z.string(),
  status: z.string().default("success"),
});
export type PuzzleResponse = z.infer<typeof PuzzleResponseSchema>;

export const PuzzleEvaluationRequestSchema = z.object({
  puzzle_context: z.string().min(1),
  puzzle_type: PuzzleTypeSchema,
  official_solution: z.string().min(1),
  user_response: z.string().min(1),
});
export type PuzzleEvaluationRequest = z.infer<typeof PuzzleEvaluationRequestSchema>;

export const PuzzleEvaluationResponseSchema = z.object({
  is_correct: z.boolean(),
  accuracy_score: z.number().min(0).max(1),
  evaluation_feedback: z.string(),
  hint_redirection: z.string().nullable().optional(),
  metacognitive_prompt: z.string(),
  status: z.string().default("success"),
});
export type PuzzleEvaluationResponse = z.infer<typeof PuzzleEvaluationResponseSchema>;

/** A single answer attempt in a puzzle round, with its evaluation. */
export interface PuzzleAttempt {
  answer: string;
  evaluation: PuzzleEvaluationResponse;
}

/** Persisted state for an in-progress puzzle round (the guess-until-correct game). */
export interface PuzzleRound {
  puzzle: PuzzleResponse;
  attempts: PuzzleAttempt[];
  userAnswer: string;
}
