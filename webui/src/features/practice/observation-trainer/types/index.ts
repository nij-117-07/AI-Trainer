// src/features/practice/observation-trainer/types/index.ts
/**
 * Zod schemas + TypeScript types for the Observation Trainer API
 * (Backend/practice/observation_trainer/api.md).
 */
import { z } from "zod";

export const observationRatings = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;
export const scenarioPriorities = ["high", "medium", "low"] as const;
export const ObservationRatingSchema = z.enum(observationRatings);
export const ScenarioPrioritySchema = z.enum(scenarioPriorities);
export type ObservationRating = z.infer<typeof ObservationRatingSchema>;
export type ScenarioPriority = z.infer<typeof ScenarioPrioritySchema>;

export const TrainFormSchema = z.object({
  training_scenario: z.string().trim().min(1, "Training scenario is required").max(500),
  user_observations: z.string().trim().min(1, "Describe what you observed").max(5000),
  context_category: z.string().trim().max(200).default(""),
  training_focus: z.string().trim().max(200).default(""),
  reveal_hidden: z.boolean().default(true),
});
export type TrainFormValues = z.infer<typeof TrainFormSchema>;

export const TrainRequestSchema = z.object({
  image: z.string().min(1),
  user_observations: z.string().min(1),
  training_scenario: z.string().min(1),
  context_category: z.string().optional(),
  training_focus: z.string().optional(),
  reveal_hidden: z.boolean().default(true),
});
export type TrainRequest = z.infer<typeof TrainRequestSchema>;

export const MissedDetailSchema = z.object({
  detail: z.string(),
  category: z.string(),
  significance: z.string(),
  scenario_priority: ScenarioPrioritySchema,
});
export type MissedDetail = z.infer<typeof MissedDetailSchema>;

export const ImageAnalysisSchema = z.object({
  ground_truth_description: z.string(),
  key_elements: z.array(z.string()),
  subtle_details: z.array(z.string()),
});
export type ImageAnalysis = z.infer<typeof ImageAnalysisSchema>;

export const EvaluationSummarySchema = z.object({
  accuracy_assessment: z.string(),
  scenario_relevance: z.string(),
  rating: ObservationRatingSchema,
  score: z.number().int().min(1).max(10),
  strengths: z.array(z.string()),
  areas_for_improvement: z.array(z.string()),
  scenario_feedback: z.string(),
  feedback: z.string(),
});
export type EvaluationSummary = z.infer<typeof EvaluationSummarySchema>;

export const HiddenDetailsSummarySchema = z.object({
  missed_items: z.array(MissedDetailSchema),
  potential_score: z.number().int().min(1).max(10),
  skill_gap: z.string(),
  training_tip: z.string(),
  practice_exercise: z.string(),
  encouragement: z.string(),
});
export type HiddenDetailsSummary = z.infer<typeof HiddenDetailsSummarySchema>;

export const TrainResponseSchema = z.object({
  image_analysis: ImageAnalysisSchema,
  evaluation: EvaluationSummarySchema,
  hidden_details: HiddenDetailsSummarySchema.nullable().optional(),
  training_scenario: z.string(),
  status: z.string().default("success"),
});
export type TrainResponse = z.infer<typeof TrainResponseSchema>;
