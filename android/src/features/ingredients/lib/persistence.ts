// src/features/ingredients/lib/persistence.ts
/** Storage keys and saved-draft merge for the Ingredients Checker form and its last analysis. */
import type { IngredientsFormValues } from "../types";

export const INGREDIENTS_FORM_KEY = "tools.ingredients.form.v2";
export const INGREDIENTS_RESULT_KEY = "tools.ingredients.result.v1";

export const INGREDIENTS_DEFAULTS: IngredientsFormValues = {
  manualText: "",
};

/** Keeps the saved manual text only when it is a string, so a damaged draft falls back to empty. */
export function mergeSavedForm(saved: unknown): IngredientsFormValues {
  if (typeof saved !== "object" || saved === null) return INGREDIENTS_DEFAULTS;
  const manualText = (saved as Record<string, unknown>).manualText;
  return typeof manualText === "string" ? { manualText } : INGREDIENTS_DEFAULTS;
}
