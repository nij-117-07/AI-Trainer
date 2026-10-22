// src/features/practice/bias-inoculator/types/index.ts
/**
 * Zod schemas + TypeScript types for the Cognitive Bias Inoculator API
 * (Backend/practice/bias_inoculator/api.md).
 */
import { z } from "zod";

export const targetBiases = [
  "anchoring",
  "availability",
  "confirmation",
  "sunk_cost",
  "framing",
] as const;
export const TargetBiasSchema = z.enum(targetBiases);
export type TargetBias = z.infer<typeof TargetBiasSchema>;

/** Form value that also offers "random" (maps to omitting target_bias). */
export const BiasFormSchema = z.object({
  user_interest: z.string().trim().min(1, "Field of interest is required").max(200),
  target_bias: z.string().default("random"),
});
export type BiasFormValues = z.infer<typeof BiasFormSchema>;

export const BiasRequestSchema = z.object({
  user_interest: z.string().min(1),
  target_bias: TargetBiasSchema.optional(),
});
export type BiasRequest = z.infer<typeof BiasRequestSchema>;

export const BiasResponseSchema = z.object({
  target_bias: TargetBiasSchema,
  scenario_setup: z.string(),
  intuitive_trap: z.string(),
  rational_analysis: z.string(),
  real_world_application: z.string(),
  status: z.string().default("success"),
});
export type BiasResponse = z.infer<typeof BiasResponseSchema>;
