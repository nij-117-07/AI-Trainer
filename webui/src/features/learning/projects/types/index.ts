// src/features/learning/projects/types/index.ts
/**
 * Zod schemas + TypeScript types for the Project Recommender API
 * (Backend/learning/projects/api.md).
 */
import { z } from "zod";

export const projectSizes = ["small", "medium", "large"] as const;
export const projectDifficultyLevels = ["beginner", "intermediate", "advanced"] as const;

export const ProjectSizeSchema = z.enum(projectSizes);
export const ProjectDifficultySchema = z.enum(projectDifficultyLevels);

export const ProjectRecommenderFormSchema = z.object({
  topic: z.string().trim().min(1, "Topic is required").max(200),
  project_size: ProjectSizeSchema,
  difficulty_level: ProjectDifficultySchema,
  num_recommendations: z.number().int().min(1).max(10).default(3),
});
export type ProjectRecommenderFormValues = z.infer<typeof ProjectRecommenderFormSchema>;

export const ProjectRecommenderRequestSchema = z.object({
  topic: z.string().trim().min(1),
  project_size: ProjectSizeSchema,
  difficulty_level: ProjectDifficultySchema,
  num_recommendations: z.number().int().min(1).max(10).optional(),
});
export type ProjectRecommenderRequest = z.infer<typeof ProjectRecommenderRequestSchema>;

export const ProjectRecommendationSchema = z.object({
  title: z.string(),
  description: z.string(),
  key_concepts: z.array(z.string()).default([]),
  estimated_hours: z.number().optional(),
  prerequisites: z.array(z.string()).default([]),
  deliverables: z.array(z.string()).default([]),
  stretch_goals: z.array(z.string()).default([]),
});
export type ProjectRecommendation = z.infer<typeof ProjectRecommendationSchema>;

export const ProjectRecommenderResponseSchema = z.object({
  projects: z.array(ProjectRecommendationSchema).default([]),
  advice: z.string().optional(),
});
export type ProjectRecommenderResponse = z.infer<typeof ProjectRecommenderResponseSchema>;
