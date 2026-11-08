// src/features/ingredients/lib/persistence.ts
/** Storage key and saved-state shape for the Ingredients Checker draft and last analysis. */
import type { IngredientAnalysis, IngredientsFormValues } from "../types";

export const INGREDIENTS_STORAGE_KEY = "tools.ingredients.check.v1";

export const INGREDIENTS_DEFAULTS: IngredientsFormValues = {
  manualText: "",
};

export interface SavedIngredientsState {
  form: IngredientsFormValues;
  result: IngredientAnalysis | null;
}

/** Keeps the saved manual text only when it is a string, so a damaged draft falls back to empty. */
export function mergeSavedForm(saved: unknown): IngredientsFormValues {
  if (typeof saved !== "object" || saved === null) return INGREDIENTS_DEFAULTS;
  const manualText = (saved as Record<string, unknown>).manualText;
  return typeof manualText === "string" ? { manualText } : INGREDIENTS_DEFAULTS;
}
