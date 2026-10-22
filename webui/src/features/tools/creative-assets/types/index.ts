// src/features/tools/creative-assets/types/index.ts
/**
 * Zod schemas + TypeScript types for the Creative Assets API
 * (Backend/tools/creative_assets/api.md).
 */
import { z } from "zod";

export const CreativeAssetsFormSchema = z.object({
  task_type: z.string().trim().min(1, "Task type is required").max(100),
  user_query: z.string().trim().min(1, "Topic is required").max(2000),
  context: z.string().trim().max(2000).default(""),
  reference_examples: z.string().trim().max(3000).default(""),
  number_of_suggestions: z.number().int().min(1).max(20).default(3),
});
export type CreativeAssetsFormValues = z.infer<typeof CreativeAssetsFormSchema>;

export const CreativeAssetRequestSchema = z.object({
  task_type: z.string().min(1),
  user_query: z.string().min(1),
  context: z.string().optional(),
  reference_examples: z.array(z.string()).optional(),
  number_of_suggestions: z.number().int().min(1).max(20),
});
export type CreativeAssetRequest = z.infer<typeof CreativeAssetRequestSchema>;

export const CreativeSuggestionSchema = z.object({
  suggestion: z.string(),
  explanation: z.string(),
});
export type CreativeSuggestion = z.infer<typeof CreativeSuggestionSchema>;

export const CreativeAssetResponseSchema = z.object({
  suggestions: z.array(CreativeSuggestionSchema),
});
export type CreativeAssetResponse = z.infer<typeof CreativeAssetResponseSchema>;
