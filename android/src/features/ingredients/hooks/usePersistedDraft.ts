// src/features/ingredients/hooks/usePersistedDraft.ts
/** Keeps the Ingredients Checker form on the device, and the last analysis for the result page to reload on focus. */
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { normalizeIngredientAnalysis } from "../lib/normalize";
import { INGREDIENTS_DEFAULTS, INGREDIENTS_FORM_KEY, INGREDIENTS_RESULT_KEY, mergeSavedForm } from "../lib/persistence";
import type { IngredientAnalysis, IngredientsFormValues } from "../types";

export function usePersistedForm() {
  const [form, setForm] = useState<IngredientsFormValues>(INGREDIENTS_DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(INGREDIENTS_FORM_KEY, null)
      .then((saved) => {
        if (active) setForm(mergeSavedForm(saved));
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
    saveDocument(INGREDIENTS_FORM_KEY, form).catch(() => undefined);
  }, [loaded, form]);

  const reset = useCallback(() => {
    setForm(INGREDIENTS_DEFAULTS);
  }, []);

  return { form, setForm, reset };
}

export function usePersistedResult(): IngredientAnalysis | null {
  const [result, setResult] = useState<IngredientAnalysis | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadDocument<unknown>(INGREDIENTS_RESULT_KEY, null)
        .then((saved) => {
          if (active) setResult(restoreResult(saved));
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );

  return result;
}

/** Stored JSON is not trusted: it must pass the same normaliser as a fresh model answer. */
function restoreResult(saved: unknown): IngredientAnalysis | null {
  if (typeof saved !== "object" || saved === null || Array.isArray(saved)) return null;
  try {
    return normalizeIngredientAnalysis(saved as Parameters<typeof normalizeIngredientAnalysis>[0]);
  } catch {
    return null;
  }
}
