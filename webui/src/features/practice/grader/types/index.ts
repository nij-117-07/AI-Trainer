// src/features/practice/grader/types/index.ts
/**
 * Zod schemas + TypeScript types for the Performance Grader API
 * (Backend/assessment/grader/api.md).
 */
import { z } from "zod";

export const expectedLevels = ["beginner", "intermediate", "expert"] as const;

// The backend accepts any value for `expected_level` ("any value accepted"),
// so the schema is a free-form string with a suggested preset list above.
export const ExpectedLevelSchema = z
  .string()
  .trim()
  .min(1, "Expected level is required")
  .max(100, "Expected level is too long");
export type ExpectedLevel = z.infer<typeof ExpectedLevelSchema>;

export const GradingResponseSchema = z.object({
  combined_analysis: z.string(),
  score: z.number().min(0).max(10),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  detailed_feedback: z.string(),
  is_target_met: z.boolean(),
  status: z.string().default("success"),
});
export type GradingResponse = z.infer<typeof GradingResponseSchema>;

export const GraderFormSchema = z.object({
  scenario: z.string().trim().min(1, "Scenario is required").max(500),
  question_asked: z.string().trim().min(1, "Question is required").max(2000),
  target_objective: z.string().trim().min(1, "Target objective is required").max(1000),
  expected_level: ExpectedLevelSchema.default("intermediate"),
  user_answer_text: z.string().trim().max(5000).default(""),
});
export type GraderFormValues = z.infer<typeof GraderFormSchema>;

export interface GraderPayload extends GraderFormValues {
  image: File | null;
}

export interface TheoreticalGradingPayload {
  scenario: string;
  question_asked: string;
  target_objective: string;
  expected_level: string;
  user_answer_text: string;
  image?: File | null;
}
