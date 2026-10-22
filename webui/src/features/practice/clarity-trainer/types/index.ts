// src/features/practice/clarity-trainer/types/index.ts
/**
 * Zod schemas + TypeScript types for the Clarity Trainer API
 * (Backend/practice/clarity_trainer/api.md).
 */
import { z } from "zod";

export const scenarioDifficulties = ["easy", "medium", "hard", "advanced"] as const;
export const scenarioCategories = [
  "team update",
  "giving feedback",
  "difficult conversation",
  "pitch or ask",
  "status report",
  "conflict resolution",
  "presentation opening",
  "email",
  "negotiation",
  "apology",
] as const;
export const verbosityLevels = ["concise", "moderate", "verbose", "redundant"] as const;
export const clarityScores = ["excellent", "good", "fair", "poor"] as const;

export const ScenarioDifficultySchema = z.enum(scenarioDifficulties);
export const ScenarioCategorySchema = z.enum(scenarioCategories);
export const VerbosityLevelSchema = z.enum(verbosityLevels);
export const ClarityScoreSchema = z.enum(clarityScores);
export type ScenarioDifficulty = z.infer<typeof ScenarioDifficultySchema>;
export type ScenarioCategory = z.infer<typeof ScenarioCategorySchema>;
export type VerbosityLevel = z.infer<typeof VerbosityLevelSchema>;
export type ClarityScore = z.infer<typeof ClarityScoreSchema>;

export const CommunicationScenarioSchema = z.object({
  title: z.string(),
  situation: z.string(),
  characters: z.array(z.string()),
  goal: z.string(),
  constraints: z.array(z.string()),
  prompt_to_user: z.string(),
  ideal_length_seconds: z.number().int().min(0),
  difficulty: ScenarioDifficultySchema,
});
export type CommunicationScenario = z.infer<typeof CommunicationScenarioSchema>;

export const ScenarioFormSchema = z.object({
  difficulty: z.string().default("random"),
  category: z.string().default("random"),
  user_context: z.string().trim().max(200).default(""),
});
export type ScenarioFormValues = z.infer<typeof ScenarioFormSchema>;

export const ScenarioRequestSchema = z.object({
  difficulty: ScenarioDifficultySchema.optional(),
  category: ScenarioCategorySchema.optional(),
  user_context: z.string().optional(),
});
export type ScenarioRequest = z.infer<typeof ScenarioRequestSchema>;

export const ScenarioResponseSchema = z.object({
  scenario: CommunicationScenarioSchema,
  status: z.string().default("success"),
});
export type ScenarioResponse = z.infer<typeof ScenarioResponseSchema>;

export const ResponseAnalysisSchema = z.object({
  verbosity: VerbosityLevelSchema,
  word_count: z.number().int().min(0),
  filler_words: z.array(z.string()),
  redundant_phrases: z.array(z.string()),
  clarity: ClarityScoreSchema,
  goal_achievement: z.number().min(0).max(1),
  tone_fit: z.number().min(0).max(1),
  core_message: z.string(),
  scenario_fit_note: z.string(),
});
export type ResponseAnalysis = z.infer<typeof ResponseAnalysisSchema>;

export const CoachFeedbackSchema = z.object({
  score: z.number().int().min(1).max(10),
  what_worked: z.array(z.string()),
  what_to_cut: z.array(z.string()),
  what_to_add: z.array(z.string()),
  rewrite_suggestion: z.string(),
  one_principle: z.string(),
  coach_message: z.string(),
});
export type CoachFeedback = z.infer<typeof CoachFeedbackSchema>;

export const BetterVersionSchema = z.object({
  rewritten: z.string(),
  original_words: z.number().int().min(0),
  new_words: z.number().int().min(0),
  percent_reduced: z.number(),
  why_better: z.array(z.string()),
});
export type BetterVersion = z.infer<typeof BetterVersionSchema>;

export const GoldStandardSchema = z.object({
  opening: z.string(),
  full_response: z.string(),
  why_ideal: z.array(z.string()),
  word_count: z.number().int().min(0),
  seconds: z.number().int().min(0),
});
export type GoldStandard = z.infer<typeof GoldStandardSchema>;

export const EvaluateRequestSchema = z.object({
  scenario: CommunicationScenarioSchema,
  user_response: z.string().min(1),
});
export type EvaluateRequest = z.infer<typeof EvaluateRequestSchema>;

export const EvaluateResponseSchema = z.object({
  scenario: CommunicationScenarioSchema,
  user_response: z.string(),
  analysis: ResponseAnalysisSchema,
  feedback: CoachFeedbackSchema,
  better_version: BetterVersionSchema,
  gold_standard: GoldStandardSchema,
  status: z.string().default("success"),
});
export type EvaluateResponse = z.infer<typeof EvaluateResponseSchema>;

/** Persisted state for an in-progress clarity round. */
export interface ClarityRound {
  scenario: CommunicationScenario;
  response: string;
  evaluation: EvaluateResponse | null;
}
