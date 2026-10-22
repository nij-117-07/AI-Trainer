// src/features/linguistic/lesson/types/index.ts
/**
 * Zod schemas + TypeScript types for the Lesson API
 * (Backend/linguistic/lesson/api.md).
 */
import { z } from "zod";

export const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export const CefrLevelSchema = z.enum(cefrLevels);

export const learningFocuses = [
  "Grammar",
  "Vocabulary",
  "Conversation",
  "Culture",
  "Pronunciation",
] as const;
export const LearningFocusSchema = z.enum(learningFocuses);

export const complexityWeights = ["Low", "Medium", "High"] as const;
export const ComplexityWeightSchema = z.enum(complexityWeights);

export const LessonFormSchema = z.object({
  native_language: z.string().trim().min(1, "Native language is required").max(100).default("English"),
  target_language: z.string().trim().min(1, "Target language is required").max(100),
  current_level: CefrLevelSchema.default("A2"),
  last_lesson_summary: z.string().trim().max(2000).default(""),
  learning_focus: LearningFocusSchema.default("Vocabulary"),
  complexity_weight: ComplexityWeightSchema.default("Medium"),
  seed: z.string().trim().max(200).default(""),
  user_custom_instruction: z.string().trim().max(2000).default(""),
});
export type LessonFormValues = z.infer<typeof LessonFormSchema>;

export const LessonRequestSchema = z.object({
  native_language: z.string().trim().min(1),
  target_language: z.string().trim().min(1),
  current_level: CefrLevelSchema,
  last_lesson_summary: z.string().trim().optional(),
  learning_focus: LearningFocusSchema,
  complexity_weight: ComplexityWeightSchema,
  seed: z.string().trim().min(1),
  user_custom_instruction: z.string().trim().optional(),
});
export type LessonRequest = z.infer<typeof LessonRequestSchema>;

export const VocabularyItemSchema = z.object({
  word: z.string(),
  ipa: z.string().default(""),
  translation: z.string().default(""),
  example: z.string().default(""),
});
export type VocabularyItem = z.infer<typeof VocabularyItemSchema>;

export const LessonResponseSchema = z.object({
  header: z.string().default(""),
  comparative_analysis: z.string().default(""),
  deep_dive: z.string().default(""),
  vocabulary: z.array(VocabularyItemSchema).default([]),
  practice: z.array(z.string()).default([]),
  nuance: z.string().default(""),
  homework: z.string().default(""),
});
export type LessonResponse = z.infer<typeof LessonResponseSchema>;
