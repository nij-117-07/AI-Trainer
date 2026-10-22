// src/features/learning/guides/types/index.ts
/**
 * Zod schemas + TypeScript types for every Learning Guides API endpoint
 * (Backend/learning/guides/api.md).
 *
 * Each endpoint gets three schemas:
 *  - a form schema (validated by usePersistedForm / react-hook-form; arrays are
 *    represented as newline-separated strings so drafts persist cleanly),
 *  - a request schema (the exact backend body, built inside the server action),
 *  - a response schema (arrays default to [] so renderers can be defensive).
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------

export const currentLevels = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Professional",
  "Expert",
] as const;

export const dailyPlanLevels = ["beginner", "intermediate", "advanced"] as const;

export const targetMasteryLevels = [
  "familiarity",
  "competency",
  "expert-level troubleshooting",
  "architectural-design",
] as const;

export const learningFocuses = [
  "practical",
  "debugging",
  "theoretical",
  "project-based",
] as const;

export const topicLevels = ["Beginner", "Intermediate", "Advanced"] as const;

export const CurrentLevelSchema = z.enum(currentLevels);
export const DailyPlanLevelSchema = z.enum(dailyPlanLevels);
export const TargetMasterySchema = z.enum(targetMasteryLevels);
export const LearningFocusSchema = z.enum(learningFocuses);
export const TopicLevelSchema = z.enum(topicLevels);

// ---------------------------------------------------------------------------
// Guide Tasks (POST /learning/guides/task)
// ---------------------------------------------------------------------------

export const GuideTaskFormSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(200),
  goal: z.string().trim().min(1, "Goal is required").max(500),
  current_level: CurrentLevelSchema,
  count: z.number().int().min(1).max(10).default(3),
  history: z.string().trim().max(2000).default(""),
  instructions: z.string().trim().max(1000).default(""),
});
export type GuideTaskFormValues = z.infer<typeof GuideTaskFormSchema>;

export const GuideRequestSchema = z.object({
  subject: z.string().trim().min(1),
  goal: z.string().trim().min(1),
  current_level: z.string().trim().min(1),
  count: z.number().int().min(1).max(10).optional(),
  history: z.array(z.string()).optional(),
  instructions: z.string().trim().optional(),
});
export type GuideRequest = z.infer<typeof GuideRequestSchema>;

export const GuideTaskSchema = z.object({
  title: z.string(),
  description: z.string(),
  difficulty: z.string(),
  learning_outcomes: z.array(z.string()).default([]),
  estimated_hours: z.number().optional(),
});
export type GuideTask = z.infer<typeof GuideTaskSchema>;

export const GuideResponseSchema = z.object({
  mentor_feedback: z.string(),
  tasks: z.array(GuideTaskSchema).default([]),
});
export type GuideResponse = z.infer<typeof GuideResponseSchema>;

// ---------------------------------------------------------------------------
// Daily Plan (POST /learning/guides/daily-plan)
// ---------------------------------------------------------------------------

export const DailyPlannerFormSchema = z.object({
  master_topic: z.string().trim().min(1, "Master topic is required").max(200),
  subtopic_preference: z.string().trim().max(500).default(""),
  user_level: DailyPlanLevelSchema,
  target_mastery: TargetMasterySchema,
  existing_knowledge: z.string().trim().min(1, "Existing knowledge is required").max(2000),
  learning_focus: LearningFocusSchema,
  history: z.string().trim().max(2000).default(""),
});
export type DailyPlannerFormValues = z.infer<typeof DailyPlannerFormSchema>;

export const DailyPlannerRequestSchema = z.object({
  master_topic: z.string().trim().min(1),
  subtopic_preference: z.string().trim().optional(),
  user_level: DailyPlanLevelSchema,
  target_mastery: TargetMasterySchema,
  existing_knowledge: z.string().trim().min(1),
  learning_focus: LearningFocusSchema,
  history: z.string().trim().optional(),
});
export type DailyPlannerRequest = z.infer<typeof DailyPlannerRequestSchema>;

export const DailyPlannerResponseSchema = z.object({
  learning_objective: z.string(),
  mastery_gap_analysis: z.string(),
  structured_roadmap: z.array(z.string()).default([]),
  recommended_exercise: z.string(),
  resource_suggestions: z.string(),
});
export type DailyPlannerResponse = z.infer<typeof DailyPlannerResponseSchema>;

// ---------------------------------------------------------------------------
// Project Blueprint (POST /learning/guides/project-blueprint)
// ---------------------------------------------------------------------------

export const ProjectBlueprintFormSchema = z.object({
  master_topic: z.string().trim().min(1, "Master topic is required").max(200),
  subtopic_focus: z.string().trim().min(1, "Subtopic focus is required").max(200),
  target_mastery: z.string().trim().min(1, "Target mastery is required").max(200),
  preferred_industry: z.string().trim().max(200).default(""),
});
export type ProjectBlueprintFormValues = z.infer<typeof ProjectBlueprintFormSchema>;

export const ProjectArchitectRequestSchema = z.object({
  master_topic: z.string().trim().min(1),
  subtopic_focus: z.string().trim().min(1),
  target_mastery: z.string().trim().min(1),
  preferred_industry: z.string().trim().optional(),
});
export type ProjectArchitectRequest = z.infer<typeof ProjectArchitectRequestSchema>;

export const ProjectArchitectResponseSchema = z.object({
  project_name: z.string(),
  industry_context: z.string(),
  problem_statement: z.string(),
  technical_requirements: z.array(z.string()).default([]),
  stretch_goals: z.array(z.string()).default([]),
  validation_criteria: z.string(),
  random_seed: z.string().optional(),
});
export type ProjectArchitectResponse = z.infer<typeof ProjectArchitectResponseSchema>;

// ---------------------------------------------------------------------------
// Suggest Topics (POST /learning/guides/suggest-topics)
// ---------------------------------------------------------------------------

export const SuggestTopicsFormSchema = z.object({
  broader_topic: z.string().trim().min(1, "Broader topic is required").max(200),
  specific_interest: z.string().trim().min(1, "Specific interest is required").max(200),
  learned_before: z.string().trim().min(1, "Background knowledge is required").max(2000),
  previous_suggestions: z.string().trim().max(2000).default(""),
  custom_user_input: z.string().trim().max(1000).default(""),
  topic_level: TopicLevelSchema,
});
export type SuggestTopicsFormValues = z.infer<typeof SuggestTopicsFormSchema>;

export const WhatToLearnRequestSchema = z.object({
  broader_topic: z.string().trim().min(1),
  specific_interest: z.string().trim().min(1),
  learned_before: z.string().trim().min(1),
  previous_suggestions: z.array(z.string()).optional(),
  custom_user_input: z.string().trim().optional(),
  topic_level: TopicLevelSchema,
});
export type WhatToLearnRequest = z.infer<typeof WhatToLearnRequestSchema>;

export const TopicRecommendationSchema = z.object({
  topic_name: z.string(),
  reason: z.string(),
});
export type TopicRecommendation = z.infer<typeof TopicRecommendationSchema>;

export const WhatToLearnResponseSchema = z.object({
  recommendations: z.array(TopicRecommendationSchema).default([]),
});
export type WhatToLearnResponse = z.infer<typeof WhatToLearnResponseSchema>;

// ---------------------------------------------------------------------------
// Suggest Projects (POST /learning/guides/suggest-projects)
// ---------------------------------------------------------------------------

export const SuggestProjectsFormSchema = z.object({
  topic: z.string().trim().min(1, "Topic is required").max(200),
  industry: z.string().trim().min(1, "Industry is required").max(200),
  num_use_cases: z.number().int().min(1).max(10).default(3),
  user_instructions: z.string().trim().max(1000).default(""),
  existing_suggestions: z.string().trim().max(2000).default(""),
});
export type SuggestProjectsFormValues = z.infer<typeof SuggestProjectsFormSchema>;

export const ProjectSuggestorRequestSchema = z.object({
  topic: z.string().trim().min(1),
  industry: z.string().trim().min(1),
  num_use_cases: z.number().int().min(1).max(10).optional(),
  user_instructions: z.string().trim().optional(),
  existing_suggestions: z.array(z.string()).optional(),
});
export type ProjectSuggestorRequest = z.infer<typeof ProjectSuggestorRequestSchema>;

export const ProjectUseCaseSchema = z.object({
  title: z.string(),
  problem: z.string(),
  key_features: z.array(z.string()).default([]),
});
export type ProjectUseCase = z.infer<typeof ProjectUseCaseSchema>;

export const ProjectSuggestorResponseSchema = z.object({
  brief_strategy: z.string(),
  projects: z.array(ProjectUseCaseSchema).default([]),
});
export type ProjectSuggestorResponse = z.infer<typeof ProjectSuggestorResponseSchema>;
