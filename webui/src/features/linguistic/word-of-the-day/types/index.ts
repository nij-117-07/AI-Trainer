// src/features/linguistic/word-of-the-day/types/index.ts
/**
 * Zod schemas + TypeScript types for the Word of the Day API
 * (Backend/linguistic/word_of_the_day/api.md).
 */
import { z } from "zod";

export const proficiencyLevels = ["basic", "academic", "poetic", "slang"] as const;
export const ProficiencySchema = z.enum(proficiencyLevels);

export const WotdFormSchema = z.object({
  target_language: z.string().trim().min(1, "Target language is required").max(100),
  native_language: z.string().trim().min(1, "Native language is required").max(100).default("English"),
  proficiency: ProficiencySchema.default("academic"),
  theme: z.string().trim().min(1, "Theme is required").max(200).default("General"),
  custom_instructions: z.string().trim().max(1000).default(""),
});
export type WotdFormValues = z.infer<typeof WotdFormSchema>;

export const WotdRequestSchema = z.object({
  target_language: z.string().trim().min(1),
  native_language: z.string().trim().min(1).optional(),
  proficiency: z.string().trim().min(1).optional(),
  theme: z.string().trim().min(1).optional(),
  custom_instructions: z.string().trim().optional(),
});
export type WotdRequest = z.infer<typeof WotdRequestSchema>;

export const WotdResponseSchema = z.object({
  word: z.string(),
  native_translation: z.string().default(""),
  phonetic_and_audio_guide: z.string().default(""),
  morphology_breakdown: z.string().default(""),
  primary_definition: z.string().default(""),
  the_vibe_check: z.string().default(""),
  historical_evolution: z.string().default(""),
  modern_usage_sentence: z.string().default(""),
  synonym_web: z.array(z.string()).default([]),
});
export type WotdResponse = z.infer<typeof WotdResponseSchema>;
