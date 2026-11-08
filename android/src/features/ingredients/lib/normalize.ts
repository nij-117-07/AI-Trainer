// src/features/ingredients/lib/normalize.ts
/**
 * Turns the raw model output into the typed analysis the screen renders. A health level outside
 * 1-5 is an error, because there is no safe score to show in its place.
 */
import type { HealthLevel, IngredientAnalysis } from "../types";
import { numberOf, textList, textOf } from "./text";

export function normalizeIngredientAnalysis(raw: {
  extractedIngredients?: unknown;
  healthLevel?: unknown;
  riskFactors?: unknown;
  summaryAnalysis?: unknown;
}): IngredientAnalysis {
  const level = numberOf(raw.healthLevel);
  if (level === null || level < 1 || level > 5) {
    throw new Error("The model did not return a valid health level. Please try again.");
  }
  return {
    extractedIngredients: textList(raw.extractedIngredients),
    healthLevel: level as HealthLevel,
    riskFactors: textList(raw.riskFactors),
    summaryAnalysis: textOf(raw.summaryAnalysis),
  };
}
