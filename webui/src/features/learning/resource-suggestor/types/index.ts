// src/features/learning/resource-suggestor/types/index.ts
/**
 * Zod schemas + TypeScript types for the Resource Suggestor API
 * (Backend/learning/resource_suggestor/api.md).
 */
import { z } from "zod";

export const ResourceTypeSchema = z.string();
export const ResourceDifficultySchema = z.string();

export const ResourceSuggestorFormSchema = z.object({
  background_subject: z.string().trim().min(1, "Background subject is required").max(500),
  target_topic: z.string().trim().min(1, "Target topic is required").max(500),
  additional_preferences: z.string().trim().max(1000).default(""),
});
export type ResourceSuggestorFormValues = z.infer<typeof ResourceSuggestorFormSchema>;

export const ResourceSuggestorRequestSchema = z.object({
  background_subject: z.string().trim().min(1),
  target_topic: z.string().trim().min(1),
  additional_preferences: z.string().optional(),
});
export type ResourceSuggestorRequest = z.infer<typeof ResourceSuggestorRequestSchema>;

export const ResourceItemSchema = z.object({
  title: z.string(),
  type: ResourceTypeSchema,
  author_or_creator: z.string(),
  description: z.string(),
  difficulty_level: ResourceDifficultySchema,
  estimated_time: z.string(),
  why_recommended: z.string(),
  prerequisite_knowledge: z.string(),
  access_info: z.string(),
});
export type ResourceItem = z.infer<typeof ResourceItemSchema>;

export const ResourceSuggestorResponseSchema = z.object({
  learning_path_summary: z.string(),
  recommended_resources: z.array(ResourceItemSchema).default([]),
  next_steps: z.string(),
  status: z.string(),
});
export type ResourceSuggestorResponse = z.infer<typeof ResourceSuggestorResponseSchema>;
