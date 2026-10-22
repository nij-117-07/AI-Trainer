// src/features/learning/conceptual-bridge/types/index.ts
/**
 * Zod schemas + TypeScript types for the Conceptual Bridge Builder API
 * (Backend/practice/conceptual_bridge/api.md).
 */
import { z } from "zod";

export const abstractionDepths = ["surface", "structural", "systemic"] as const;
export const AbstractionDepthSchema = z.enum(abstractionDepths);
export type AbstractionDepth = z.infer<typeof AbstractionDepthSchema>;

export const BridgeFormSchema = z.object({
  concept_a: z.string().trim().min(1, "First concept is required").max(200),
  concept_b: z.string().trim().min(1, "Second concept is required").max(200),
  abstraction_depth: AbstractionDepthSchema.default("structural"),
});
export type BridgeFormValues = z.infer<typeof BridgeFormSchema>;

export const BridgeRequestSchema = z.object({
  concept_a: z.string().min(1),
  concept_b: z.string().min(1),
  abstraction_depth: AbstractionDepthSchema.default("structural"),
});
export type BridgeRequest = z.infer<typeof BridgeRequestSchema>;

export const BridgeResponseSchema = z.object({
  structural_analogy: z.string(),
  bridging_narrative: z.string(),
  insight_question: z.string(),
  cognitive_flexibility_score: z.number().int().min(1).max(5),
  status: z.string().default("success"),
});
export type BridgeResponse = z.infer<typeof BridgeResponseSchema>;
