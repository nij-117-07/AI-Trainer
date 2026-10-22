// src/features/linguistic/rewriter/types/index.ts
/**
 * Zod schemas + TypeScript types for the Rewriter API
 * (Backend/linguistic/rewriter/api.md).
 */
import { z } from "zod";

export const transformationGoals = ["paraphrase", "shorten", "expand", "simplify"] as const;
export const TransformationGoalSchema = z.enum(transformationGoals);

export const RewriteFormSchema = z.object({
  original_text: z.string().trim().min(1, "Original text is required").max(10000),
  target_tone: z.string().trim().min(1, "Target tone is required").max(200),
  audience: z.string().trim().min(1, "Audience is required").max(200),
  transformation_goal: TransformationGoalSchema.default("paraphrase"),
  custom_instructions: z.string().trim().max(1000).default(""),
});
export type RewriteFormValues = z.infer<typeof RewriteFormSchema>;

export const RewriteRequestSchema = z.object({
  original_text: z.string().trim().min(1),
  target_tone: z.string().trim().min(1),
  audience: z.string().trim().min(1),
  transformation_goal: TransformationGoalSchema,
  custom_instructions: z.string().trim().optional(),
});
export type RewriteRequest = z.infer<typeof RewriteRequestSchema>;

export const RewriteResponseSchema = z.object({
  rationale: z.string().default(""),
  rewritten_text: z.string(),
  improvements_made: z.array(z.string()).default([]),
});
export type RewriteResponse = z.infer<typeof RewriteResponseSchema>;
