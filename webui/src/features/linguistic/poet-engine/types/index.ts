// src/features/linguistic/poet-engine/types/index.ts
/**
 * Zod schemas + TypeScript types for the Poet Engine API
 * (Backend/linguistic/poet_engine/api.md).
 */
import { z } from "zod";

export const poeticStyles = [
  "Shayari/Couplet",
  "Haiku",
  "Metaphorical Prose",
  "Ghazal-style",
] as const;
export const PoeticStyleSchema = z.enum(poeticStyles);

export const ConceptFormSchema = z.object({
  target_language: z.string().trim().min(1, "Target language is required").max(100),
  native_language: z.string().trim().min(1, "Native language is required").max(100).default("English"),
  concept_word: z.string().trim().min(1, "Concept word is required").max(200),
  poetic_style: PoeticStyleSchema.default("Shayari/Couplet"),
  user_mood: z.string().trim().max(200).default("mystical"),
  user_custom_instruction: z.string().trim().max(1000).default(""),
});
export type ConceptFormValues = z.infer<typeof ConceptFormSchema>;

export const ConceptRequestSchema = z.object({
  target_language: z.string().trim().min(1),
  native_language: z.string().trim().min(1),
  concept_word: z.string().trim().min(1),
  poetic_style: PoeticStyleSchema,
  user_mood: z.string().trim().optional(),
  user_custom_instruction: z.string().trim().optional(),
});
export type ConceptRequest = z.infer<typeof ConceptRequestSchema>;

export const ConceptResponseSchema = z.object({
  etymological_soul: z.string().default(""),
  original_poetry: z.string().default(""),
  soulful_translation: z.string().default(""),
  philosophical_reflection: z.string().default(""),
  visual_metaphor: z.string().default(""),
});
export type ConceptResponse = z.infer<typeof ConceptResponseSchema>;
