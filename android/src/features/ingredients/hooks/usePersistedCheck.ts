// src/features/ingredients/hooks/usePersistedCheck.ts
/** Keeps the Ingredients Checker draft and last analysis on the device between visits. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import {
  INGREDIENTS_DEFAULTS,
  INGREDIENTS_STORAGE_KEY,
  mergeSavedForm,
  type SavedIngredientsState,
} from "../lib/persistence";
import type { IngredientAnalysis, IngredientsFormValues } from "../types";

export function usePersistedCheck() {
  const [form, setForm] = useState<IngredientsFormValues>(INGREDIENTS_DEFAULTS);
  const [result, setResult] = useState<IngredientAnalysis | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<Partial<SavedIngredientsState> | null>(INGREDIENTS_STORAGE_KEY, null)
      .then((saved) => {
        if (!active || !saved) return;
        setForm(mergeSavedForm(saved.form));
        setResult(saved.result ?? null);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const state: SavedIngredientsState = { form, result };
    saveDocument(INGREDIENTS_STORAGE_KEY, state).catch(() => undefined);
  }, [loaded, form, result]);

  const reset = useCallback(() => {
    setForm(INGREDIENTS_DEFAULTS);
    setResult(null);
  }, []);

  return { form, setForm, result, setResult, reset };
}
