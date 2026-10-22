// src/features/linguistic/sentence-of-the-day/types/index.ts
/**
 * Zod schemas + TypeScript types for the Sentence of the Day API
 * (Backend/linguistic/sentence_of_the_day/api.md).
 */
import { z } from "zod";

export const contextSettings = ["business", "casual", "literary", "romantic", "travel"] as const;
export const ContextSettingSchema = z.enum(contextSettings);

export const complexityLevels = ["beginner", "intermediate", "advanced", "native-level"] as const;
export const ComplexityLevelSchema = z.enum(complexityLevels);

export const SentenceFormSchema = z.object({
  target_language: z.string().trim().min(1, "Target language is required").max(100),
  native_language: z.string().trim().min(1, "Native language is required").max(100).default("English"),
  context_setting: ContextSettingSchema.default("literary"),
  complexity_level: ComplexityLevelSchema.default("advanced"),
});
export type SentenceFormValues = z.infer<typeof SentenceFormSchema>;

export const SentenceRequestSchema = z.object({
  target_language: z.string().trim().min(1),
  native_language: z.string().trim().min(1),
  context_setting: ContextSettingSchema,
  complexity_level: ComplexityLevelSchema,
});
export type SentenceRequest = z.infer<typeof SentenceRequestSchema>;

export const SentenceResponseSchema = z.object({
  date: z.string().default(""),
  target_sentence: z.string(),
  literal_translation: z.string().default(""),
  natural_translation: z.string().default(""),
  grammatical_highlight: z.string().default(""),
  cultural_context: z.string().default(""),
  substitution_options: z.array(z.string()).default([]),
});
export type SentenceResponse = z.infer<typeof SentenceResponseSchema>;
