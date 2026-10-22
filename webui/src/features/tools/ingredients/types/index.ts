// src/features/tools/ingredients/types/index.ts
/**
 * Zod schemas + TypeScript types for the Ingredients Checker API
 * (Backend/tools/ingredients/api.md).
 */
import { z } from "zod";

export const HealthLevelSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);
export type HealthLevel = z.infer<typeof HealthLevelSchema>;

export const IngredientAnalysisResponseSchema = z.object({
  extracted_ingredients: z.array(z.string()),
  health_level: HealthLevelSchema,
  risk_factors: z.array(z.string()),
  summary_analysis: z.string(),
  file_path: z.string(),
  status: z.string().default("success"),
});
export type IngredientAnalysisResponse = z.infer<typeof IngredientAnalysisResponseSchema>;

export interface IngredientCheckPayload {
  file: File;
  manual_text: string;
}
