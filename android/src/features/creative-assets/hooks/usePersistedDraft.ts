// src/features/creative-assets/hooks/usePersistedDraft.ts
/** Keeps the Creative Assets form and the batch list on the device. The list reloads when its page is focused. */
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { restoreCreativeAssetsResult } from "../lib/normalize";
import { CREATIVE_ASSETS_DEFAULTS, CREATIVE_ASSETS_FORM_KEY, CREATIVE_ASSETS_RESULT_KEY, mergeSavedForm } from "../lib/persistence";
import type { CreativeAssetsFormValues, CreativeAssetsResult } from "../types";

export function usePersistedForm() {
  const [form, setForm] = useState<CreativeAssetsFormValues>(CREATIVE_ASSETS_DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(CREATIVE_ASSETS_FORM_KEY, null)
      .then((saved) => {
        if (active) setForm(mergeSavedForm(CREATIVE_ASSETS_DEFAULTS, saved));
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
    saveDocument(CREATIVE_ASSETS_FORM_KEY, form).catch(() => undefined);
  }, [loaded, form]);

  const reset = useCallback(() => {
    setForm(CREATIVE_ASSETS_DEFAULTS);
  }, []);

  return { form, setForm, reset };
}

/** Reads the saved batch list now. Use it right before a write, so the write builds on the latest data. */
export async function loadCreativeAssetsResult(): Promise<CreativeAssetsResult | null> {
  return restoreCreativeAssetsResult(await loadDocument<unknown>(CREATIVE_ASSETS_RESULT_KEY, null));
}

export function saveCreativeAssetsResult(result: CreativeAssetsResult): Promise<void> {
  return saveDocument(CREATIVE_ASSETS_RESULT_KEY, result);
}

/** The result page's view of the batch list. Every change is saved at once, so ticks survive leaving the app. */
export function usePersistedResult() {
  const [result, setResultState] = useState<CreativeAssetsResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadCreativeAssetsResult()
        .then((next) => {
          if (active) setResultState(next);
        })
        .catch(() => undefined)
        .finally(() => {
          if (active) setLoaded(true);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const setResult = useCallback((next: CreativeAssetsResult) => {
    setResultState(next);
    saveCreativeAssetsResult(next).catch(() => undefined);
  }, []);

  return { result, setResult, loaded };
}
