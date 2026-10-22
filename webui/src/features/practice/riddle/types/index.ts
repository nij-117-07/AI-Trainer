// src/features/practice/riddle/types/index.ts
/**
 * Zod schemas + TypeScript types for the Riddle Generator API
 * (Backend/practice/riddle/api.md).
 */
import { z } from "zod";

export const cognitiveDomains = ["verbal", "mathematical", "spatial", "lateral"] as const;
export const difficultyLevels = ["novice", "intermediate", "expert", "genius"] as const;
export const CognitiveDomainSchema = z.enum(cognitiveDomains);
export const DifficultyLevelSchema = z.enum(difficultyLevels);
export type CognitiveDomain = z.infer<typeof CognitiveDomainSchema>;
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;

export const RiddleFormSchema = z.object({
  field_of_interest: z.string().trim().min(1, "Topic is required").max(200),
  target_domain: CognitiveDomainSchema.default("verbal"),
  difficulty_level: DifficultyLevelSchema.default("intermediate"),
});
export type RiddleFormValues = z.infer<typeof RiddleFormSchema>;

export const RiddleRequestSchema = z.object({
  field_of_interest: z.string().min(1),
  target_domain: CognitiveDomainSchema,
  difficulty_level: DifficultyLevelSchema,
});
export type RiddleRequest = z.infer<typeof RiddleRequestSchema>;

export const RiddleResponseSchema = z.object({
  riddle_text: z.string(),
  solution: z.string(),
  cognitive_trigger: z.string(),
  status: z.string().default("success"),
});
export type RiddleResponse = z.infer<typeof RiddleResponseSchema>;

export const RiddleEvaluationRequestSchema = z.object({
  riddle_text: z.string().min(1),
  solution: z.string().min(1),
  user_answer: z.string().min(1),
});
export type RiddleEvaluationRequest = z.infer<typeof RiddleEvaluationRequestSchema>;

export const RiddleEvaluationResponseSchema = z.object({
  is_correct: z.boolean(),
  feedback: z.string(),
  thought_redirection: z.string(),
  status: z.string().default("success"),
});
export type RiddleEvaluationResponse = z.infer<typeof RiddleEvaluationResponseSchema>;

/** A single answer attempt in a riddle round, with its evaluation. */
export interface RiddleAttempt {
  answer: string;
  evaluation: RiddleEvaluationResponse;
}

/** Persisted state for an in-progress riddle round (the guess-until-correct game). */
export interface RiddleRound {
  riddle: RiddleResponse;
  attempts: RiddleAttempt[];
  userAnswer: string;
}
