// src/features/linguistic/translator/types/index.ts
/**
 * Zod schemas + TypeScript types for the Translator API
 * (Backend/linguistic/translator/api.md).
 */
import { z } from "zod";

export const translationTones = [
  "formal",
  "casual",
  "business",
  "poetic",
  "technical",
] as const;
export const TranslationToneSchema = z.enum(translationTones);

export const TranslationFormSchema = z.object({
  text_to_translate: z.string().trim().min(1, "Text to translate is required").max(10000),
  source_language: z.string().trim().min(1, "Source language is required").max(100),
  target_language: z.string().trim().min(1, "Target language is required").max(100),
  tone: TranslationToneSchema.default("formal"),
  reference_material: z.string().trim().max(4000).default(""),
  custom_instructions: z.string().trim().max(1000).default(""),
});
export type TranslationFormValues = z.infer<typeof TranslationFormSchema>;

export const TranslationRequestSchema = z.object({
  text_to_translate: z.string().trim().min(1),
  source_language: z.string().trim().min(1),
  target_language: z.string().trim().min(1),
  tone: z.string().trim().min(1),
  reference_material: z.string().trim().optional(),
  custom_instructions: z.string().trim().optional(),
});
export type TranslationRequest = z.infer<typeof TranslationRequestSchema>;

export const TranslationResponseSchema = z.object({
  rationale: z.string().default(""),
  translated_text: z.string(),
  cultural_notes: z.string().default(""),
});
export type TranslationResponse = z.infer<typeof TranslationResponseSchema>;
