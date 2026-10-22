// src/features/practice/socratic/types/index.ts
/**
 * Zod schemas + TypeScript types for the Socratic Challenger API
 * (Backend/practice/socratic/api.md).
 */
import { z } from "zod";

export const confidenceLevels = ["low", "medium", "high", "certain"] as const;
export const ConfidenceLevelSchema = z.enum(confidenceLevels);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

export const SocraticRequestSchema = z.object({
  conversation_history: z.array(z.string()).default([]),
  user_statement: z.string().min(1),
  confidence_level: ConfidenceLevelSchema.default("medium"),
});
export type SocraticRequest = z.infer<typeof SocraticRequestSchema>;

export const SocraticResponseSchema = z.object({
  logical_fallacy_check: z.string().nullable().optional(),
  falsification_question: z.string(),
  edge_case_scenario: z.string(),
  refined_perspective: z.string(),
  status: z.string().default("success"),
});
export type SocraticResponse = z.infer<typeof SocraticResponseSchema>;

export const SocraticFormSchema = z.object({
  user_statement: z.string().trim().min(1, "State your claim or rebuttal").max(2000),
  confidence_level: ConfidenceLevelSchema.default("medium"),
});
export type SocraticFormValues = z.infer<typeof SocraticFormSchema>;
