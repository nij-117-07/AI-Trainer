// src/features/linguistic/idioms/types/index.ts
/**
 * Zod schemas + TypeScript types for the Idioms API
 * (Backend/linguistic/idioms/api.md).
 */
import { z } from "zod";

export const userProficiencies = [
  "beginner",
  "intermediate",
  "advanced",
  "native-aspirant",
] as const;
export const UserProficiencySchema = z.enum(userProficiencies);

export const IdiomFormSchema = z.object({
  target_language: z.string().trim().min(1, "Target language is required").max(100),
  native_language: z.string().trim().min(1, "Native language is required").max(100),
  user_proficiency: UserProficiencySchema.default("intermediate"),
  theme_or_keyword: z.string().trim().min(1, "Theme or keyword is required").max(200),
  seed: z.string().trim().max(200).default(""),
  custom_user_request: z.string().trim().max(1000).default(""),
});
export type IdiomFormValues = z.infer<typeof IdiomFormSchema>;

export const IdiomRequestSchema = z.object({
  target_language: z.string().trim().min(1),
  native_language: z.string().trim().min(1),
  user_proficiency: z.string().trim().min(1),
  theme_or_keyword: z.string().trim().min(1),
  seed: z.string().trim().min(1),
  custom_user_request: z.string().trim().optional(),
});
export type IdiomRequest = z.infer<typeof IdiomRequestSchema>;

export const IdiomResponseSchema = z.object({
  rationale: z.string().default(""),
  idiom_in_target_language: z.string(),
  phonetic_pronunciation: z.string().default(""),
  figurative_meaning: z.string().default(""),
  cultural_context: z.string().default(""),
  equivalent_in_native_language: z.string().default(""),
  dialogue_scenario: z.string().default(""),
  practice_prompt: z.string().default(""),
});
export type IdiomResponse = z.infer<typeof IdiomResponseSchema>;
