// src/features/learning/motivation/types/index.ts
/**
 * Zod schemas + TypeScript types for the Motivation & Reflection API
 * (Backend/learning/motivation/api.md).
 */
import { z } from "zod";

export const quoteTypes = ["stoic", "modern", "poetic", "tough-love"] as const;

export const QuoteTypeSchema = z.enum(quoteTypes);

// ---------------------------------------------------------------------------
// Quote (POST /learning/motivation/generate)
// ---------------------------------------------------------------------------

export const MotivationQuoteFormSchema = z.object({
  seed_topic: z.string().trim().min(1, "Seed topic is required").max(200),
  quote_type: QuoteTypeSchema,
  user_feeling: z.string().trim().min(1, "How you feel is required").max(500),
});
export type MotivationQuoteFormValues = z.infer<typeof MotivationQuoteFormSchema>;

export const MotivationRequestSchema = z.object({
  seed_topic: z.string().trim().min(1),
  quote_type: QuoteTypeSchema,
  user_feeling: z.string().trim().min(1),
});
export type MotivationRequest = z.infer<typeof MotivationRequestSchema>;

export const MotivationResponseSchema = z.object({
  quote: z.string(),
  author_persona: z.string(),
  actionable_insight: z.string(),
  current_date: z.string().optional(),
});
export type MotivationResponse = z.infer<typeof MotivationResponseSchema>;

// ---------------------------------------------------------------------------
// Reflect (POST /learning/motivation/reflect)
// ---------------------------------------------------------------------------

export const ReflectionFormSchema = z.object({
  current_mood: z.string().trim().min(1, "Your current mood is required").max(500),
  goal_alignment: z.string().trim().min(1, "Goal or value is required").max(500),
  recent_patterns: z.string().trim().max(1000).default(""),
});
export type ReflectionFormValues = z.infer<typeof ReflectionFormSchema>;

export const ReflectionRequestSchema = z.object({
  current_mood: z.string().trim().min(1),
  goal_alignment: z.string().trim().min(1),
  recent_patterns: z.string().trim().optional(),
});
export type ReflectionRequest = z.infer<typeof ReflectionRequestSchema>;

export const ReflectionResponseSchema = z.object({
  prompts: z.array(z.string()).default([]),
  perspective_shift: z.string(),
});
export type ReflectionResponse = z.infer<typeof ReflectionResponseSchema>;
